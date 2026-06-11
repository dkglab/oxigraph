use crate::format_err;
use crate::io::{BytesInput, buffer_from_js_value, convert_base_iri, rdf_format};
use crate::model::*;
use crate::reflect::*;
use crate::utils::{to_option, to_option_ref};
use js_sys::{Array, Map, try_iter};
use oxigraph::io::{RdfParser, RdfSerializer};
use oxigraph::sparql::results::{QueryResultsFormat, QueryResultsSerializer};
use oxigraph::sparql::{
    QueryResults, QuerySolutionIter, QueryTripleIter, SparqlEvaluator, Variable,
};
use oxigraph::store::Store;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = Store, skip_typescript)]
pub struct JsStore {
    store: Store,
    data_factory: DataFactory,
}

#[wasm_bindgen(js_class = Store)]
impl JsStore {
    #[wasm_bindgen(constructor)]
    pub fn new(quads: &JsValue) -> Result<JsStore, JsValue> {
        console_error_panic_hook::set_once();

        let store = Self {
            store: Store::new().map_err(JsError::from)?,
            data_factory: default_data_factory(),
        };
        if let Some(quads) = to_option_ref(quads) {
            if let Some(quads) = try_iter(quads)? {
                for quad in quads {
                    store.add(&quad?)?;
                }
            }
        }
        Ok(store)
    }

    pub fn add(&self, quad: &JsValue) -> Result<(), JsValue> {
        self.store.insert(to_quad(quad)?).map_err(JsError::from)?;
        Ok(())
    }

    pub fn delete(&self, quad: &JsValue) -> Result<(), JsValue> {
        self.store.remove(&to_quad(quad)?).map_err(JsError::from)?;
        Ok(())
    }

    pub fn has(&self, quad: &JsValue) -> Result<bool, JsValue> {
        Ok(self
            .store
            .contains(&to_quad(quad)?)
            .map_err(JsError::from)?)
    }

    #[wasm_bindgen(getter=size)]
    pub fn size(&self) -> Result<usize, JsError> {
        Ok(self.store.len()?)
    }

    #[wasm_bindgen(js_name = match)]
    pub fn match_quads(
        &self,
        subject: &JsValue,
        predicate: &JsValue,
        object: &JsValue,
        graph_name: &JsValue,
    ) -> Result<Vec<JsValue>, JsValue> {
        let subject = to_option_ref(subject)
            .map(to_named_or_blank_node)
            .transpose()?;
        let predicate = to_option_ref(predicate).map(to_named_node).transpose()?;
        let object = to_option_ref(object).map(to_term).transpose()?;
        let graph_name = to_option_ref(graph_name).map(to_graph_name).transpose()?;
        Ok(self
            .store
            .quads_for_pattern(
                subject.as_ref(),
                predicate.as_ref(),
                object.as_ref(),
                graph_name.as_ref(),
            )
            .map(|v| v.map(|q| from_quad(&self.data_factory, &q)))
            .collect::<Result<Vec<_>, _>>()
            .map_err(JsError::from)?)
    }

    pub fn query(&self, query: &str, options: &JsValue) -> Result<JsValue, JsValue> {
        // results_format only affects how query() materializes its output; the
        // evaluation options are parsed by execute_query (shared with the cursors).
        let mut results_format = None;
        if let Some(options) = to_option_ref(options) {
            if let Some(js_results_format) = to_option(reflect_get(options, &RESULTS_FORMAT)?) {
                results_format = Some(
                    js_results_format
                        .as_string()
                        .ok_or_else(|| format_err!("results_format option must be a string"))?,
                );
            }
        }

        let results = self.execute_query(query, options)?;
        Ok(match results {
            QueryResults::Solutions(solutions) => {
                if let Some(results_format) = results_format {
                    let mut serializer =
                        QueryResultsSerializer::from_format(query_results_format(&results_format)?)
                            .serialize_solutions_to_writer(Vec::new(), solutions.variables().into())
                            .map_err(JsError::from)?;
                    for solution in solutions {
                        serializer
                            .serialize(&solution.map_err(JsError::from)?)
                            .map_err(JsError::from)?;
                    }
                    JsValue::from_str(
                        &String::from_utf8(serializer.finish().map_err(JsError::from)?)
                            .map_err(JsError::from)?,
                    )
                } else {
                    let results = Array::new();
                    for solution in solutions {
                        let solution = solution.map_err(JsError::from)?;
                        let result = Map::new();
                        for (variable, value) in solution.iter() {
                            result.set(
                                &variable.as_str().into(),
                                &from_term(&self.data_factory, value),
                            );
                        }
                        results.push(&result.into());
                    }
                    results.into()
                }
            }
            QueryResults::Graph(triples) => {
                if let Some(results_format) = results_format {
                    let mut serializer = RdfSerializer::from_format(rdf_format(&results_format)?)
                        .for_writer(Vec::new());
                    for triple in triples {
                        serializer
                            .serialize_triple(&triple.map_err(JsError::from)?)
                            .map_err(JsError::from)?;
                    }
                    JsValue::from_str(
                        &String::from_utf8(serializer.finish().map_err(JsError::from)?)
                            .map_err(JsError::from)?,
                    )
                } else {
                    let results = Array::new();
                    for triple in triples {
                        results.push(&from_triple(
                            &self.data_factory,
                            &triple.map_err(JsError::from)?,
                        ));
                    }
                    results.into()
                }
            }
            QueryResults::Boolean(b) => {
                if let Some(results_format) = results_format {
                    JsValue::from_str(
                        &String::from_utf8(
                            QueryResultsSerializer::from_format(query_results_format(
                                &results_format,
                            )?)
                            .serialize_boolean_to_writer(Vec::new(), b)
                            .map_err(JsError::from)?,
                        )
                        .map_err(JsError::from)?,
                    )
                } else {
                    b.into()
                }
            }
        })
    }

    // Parse the SPARQL query evaluation options (base_iri, default_graph,
    // named_graphs, use_default_graph_as_union) and run it against a storage
    // snapshot. on_store() snapshots rather than borrowing &Store, so the
    // returned results — and any iterator inside them — are 'static and can be
    // handed to a long-lived cursor. Shared by query(), querySolutions() and
    // queryTriples() so they stay consistent.
    fn execute_query(
        &self,
        query: &str,
        options: &JsValue,
    ) -> Result<QueryResults<'static>, JsValue> {
        let mut base_iri = None;
        let mut use_default_graph_as_union = false;
        let mut default_graph = None;
        let mut named_graphs = None;
        if let Some(options) = to_option_ref(options) {
            base_iri = convert_base_iri(&reflect_get(options, &BASE_IRI)?)?;

            default_graph =
                if let Some(default_graph) = to_option(reflect_get(options, &DEFAULT_GRAPH)?) {
                    Some(if let Some(iter) = try_iter(&default_graph)? {
                        iter.map(|term| to_graph_name(&term?))
                            .collect::<Result<Vec<_>, _>>()?
                    } else {
                        vec![to_graph_name(&default_graph)?]
                    })
                } else {
                    None
                };

            named_graphs =
                if let Some(named_graphs) = to_option(reflect_get(options, &NAMED_GRAPHS)?) {
                    Some(
                        try_iter(&named_graphs)?
                            .ok_or_else(|| format_err!("named_graphs option must be iterable"))?
                            .map(|term| to_named_or_blank_node(&term?))
                            .collect::<Result<Vec<_>, _>>()?,
                    )
                } else {
                    None
                };

            use_default_graph_as_union =
                reflect_get(options, &USED_DEFAULT_GRAPH_AS_UNION)?.is_truthy();
        }

        let mut evaluator = SparqlEvaluator::new();
        if let Some(base_iri) = base_iri {
            evaluator = evaluator.with_base_iri(&base_iri).map_err(JsError::from)?;
        }

        let mut prepared_query = evaluator.parse_query(query).map_err(JsError::from)?;
        if use_default_graph_as_union {
            prepared_query.dataset_mut().set_default_graph_as_union();
        }
        if let Some(default_graph) = default_graph {
            prepared_query
                .dataset_mut()
                .set_default_graph(default_graph);
        }
        if let Some(named_graphs) = named_graphs {
            prepared_query
                .dataset_mut()
                .set_available_named_graphs(named_graphs);
        }

        prepared_query
            .on_store(&self.store)
            .execute()
            .map_err(JsError::from)
            .map_err(Into::into)
    }

    // Lazy streaming SELECT. Returns a cursor that holds the QuerySolutionIter
    // alive instead of draining it into an Array, so the caller can pull rows in
    // bounded batches and never materializes the whole result set.
    #[wasm_bindgen(js_name = querySolutions)]
    pub fn query_solutions(
        &self,
        query: &str,
        options: &JsValue,
    ) -> Result<JsQuerySolutions, JsValue> {
        match self.execute_query(query, options)? {
            QueryResults::Solutions(solutions) => Ok(JsQuerySolutions {
                variables: solutions.variables().to_vec(),
                iter: solutions,
                data_factory: default_data_factory(),
            }),
            _ => Err(format_err!("querySolutions only supports SELECT queries")),
        }
    }

    // Lazy streaming CONSTRUCT/DESCRIBE, the triple-producing dual of
    // querySolutions(). Pulls quads in bounded batches.
    #[wasm_bindgen(js_name = queryTriples)]
    pub fn query_triples(&self, query: &str, options: &JsValue) -> Result<JsQueryTriples, JsValue> {
        match self.execute_query(query, options)? {
            QueryResults::Graph(triples) => Ok(JsQueryTriples {
                iter: triples,
                data_factory: default_data_factory(),
            }),
            _ => Err(format_err!(
                "queryTriples only supports CONSTRUCT and DESCRIBE queries"
            )),
        }
    }

    pub fn update(&self, update: &str, options: &JsValue) -> Result<(), JsValue> {
        // Parsing options
        let mut base_iri = None;
        if let Some(options) = to_option_ref(options) {
            base_iri = convert_base_iri(&reflect_get(options, &BASE_IRI)?)?;
        }

        let mut evaluator = SparqlEvaluator::new();
        if let Some(base_iri) = base_iri {
            evaluator = evaluator.with_base_iri(&base_iri).map_err(JsError::from)?;
        }

        Ok(evaluator
            .parse_update(update)
            .map_err(JsError::from)?
            .on_store(&self.store)
            .execute()
            .map_err(JsError::from)?)
    }

    pub fn load(&self, data: &JsValue, options: &JsValue) -> Result<(), JsValue> {
        // Parsing options
        let mut format = None;
        let mut base_iri = None;
        let mut to_graph_name_rs = None;
        let mut lenient = false;
        let mut no_transaction = false;
        if let Some(options) = to_option_ref(options) {
            if let Some(format_str) = reflect_get(options, &FORMAT)?.as_string() {
                format = Some(rdf_format(&format_str)?);
            }
            base_iri = convert_base_iri(&reflect_get(options, &BASE_IRI)?)?;
            to_graph_name_rs = to_option_ref(&reflect_get(options, &TO_GRAPH_NAME)?)
                .map(to_graph_name)
                .transpose()?;
            lenient = reflect_get(options, &LENIENT)?.is_truthy();
            no_transaction = reflect_get(options, &NO_TRANSACTION)?.is_truthy();
        }
        let format = format
            .ok_or_else(|| format_err!("The format option should be provided as a second argument of Store.load like store.load(my_content, {{format: 'nt'}}"))?;

        let mut parser = RdfParser::from_format(format);
        if let Some(to_graph_name) = to_graph_name_rs {
            parser = parser.with_default_graph(to_graph_name);
        }
        if let Some(base_iri) = base_iri {
            parser = parser.with_base_iri(&base_iri).map_err(JsError::from)?;
        }
        if lenient {
            parser = parser.lenient();
        }
        if let Some(buffer) = buffer_from_js_value(data) {
            if no_transaction {
                let mut loader = self.store.bulk_loader();
                loader
                    .load_from_slice(parser, &buffer)
                    .map_err(JsError::from)?;
                loader.commit().map_err(JsError::from)?;
            } else {
                self.store
                    .load_from_slice(parser, &buffer)
                    .map_err(JsError::from)?;
            }
        } else if let Some(iterator) = try_iter(data)? {
            if no_transaction {
                let mut loader = self.store.bulk_loader();
                loader
                    .load_from_reader(parser, BytesInput::from(iterator))
                    .map_err(JsError::from)?;
                loader.commit().map_err(JsError::from)?;
            } else {
                self.store
                    .load_from_reader(parser, BytesInput::from(iterator))
                    .map_err(JsError::from)?;
            }
        } else {
            return Err(format_err!(
                "The input must be a string, Uint8Array or an iterator of string or Uint8Array"
            ));
        }
        Ok(())
    }

    pub fn dump(&self, options: &JsValue) -> Result<String, JsValue> {
        // Serialization options
        let mut format = None;
        let mut from_graph_name_rs = None;
        if let Some(options) = to_option_ref(options) {
            if let Some(format_str) = reflect_get(options, &FORMAT)?.as_string() {
                format = Some(rdf_format(&format_str)?);
            }
            from_graph_name_rs = to_option_ref(&reflect_get(options, &FROM_GRAPH_NAME)?)
                .map(to_graph_name)
                .transpose()?;
        }
        let format = format
            .ok_or_else(|| format_err!("The format option should be provided as a second argument of Store.load like store.dump({{format: 'nt'}}"))?;

        let buffer = if let Some(from_graph_name) = from_graph_name_rs {
            self.store
                .dump_graph_to_writer(&from_graph_name, format, Vec::new())
        } else {
            self.store.dump_to_writer(format, Vec::new())
        }
        .map_err(JsError::from)?;
        Ok(String::from_utf8(buffer).map_err(JsError::from)?)
    }
}

// A JS-exposed cursor over a lazy SELECT iterator. The iterator is
// QuerySolutionIter<'static> because on_store() snapshots the storage rather
// than borrowing &Store, so there is no self-referential borrow. The snapshot
// is pinned until the cursor is dropped (wasm-bindgen's generated free()).
#[wasm_bindgen(js_name = QuerySolutions)]
pub struct JsQuerySolutions {
    iter: QuerySolutionIter<'static>,
    variables: Vec<Variable>,
    data_factory: DataFactory,
}

#[wasm_bindgen(js_class = QuerySolutions)]
impl JsQuerySolutions {
    #[wasm_bindgen(getter)]
    pub fn variables(&self) -> Array {
        self.variables
            .iter()
            .map(|v| JsValue::from_str(v.as_str()))
            .collect()
    }

    // Pull up to `count` rows. An empty Array signals exhaustion, so `count`
    // must be at least 1. One wasm->JS crossing per batch, not per row.
    #[wasm_bindgen(js_name = nextBatch)]
    pub fn next_batch(&mut self, count: usize) -> Result<Array, JsValue> {
        if count == 0 {
            return Err(format_err!("nextBatch requires a batch size of at least 1"));
        }
        let out = Array::new();
        for _ in 0..count {
            let Some(solution) = self.iter.next() else {
                break;
            };
            let solution = solution.map_err(JsError::from)?;
            let result = Map::new();
            for (variable, value) in solution.iter() {
                result.set(
                    &variable.as_str().into(),
                    &from_term(&self.data_factory, value),
                );
            }
            out.push(&result.into());
        }
        Ok(out)
    }
}

// The triple-producing dual of JsQuerySolutions, for CONSTRUCT/DESCRIBE.
#[wasm_bindgen(js_name = QueryTriples)]
pub struct JsQueryTriples {
    iter: QueryTripleIter<'static>,
    data_factory: DataFactory,
}

#[wasm_bindgen(js_class = QueryTriples)]
impl JsQueryTriples {
    // Pull up to `count` quads. An empty Array signals exhaustion, so `count`
    // must be at least 1.
    #[wasm_bindgen(js_name = nextBatch)]
    pub fn next_batch(&mut self, count: usize) -> Result<Array, JsValue> {
        if count == 0 {
            return Err(format_err!("nextBatch requires a batch size of at least 1"));
        }
        let out = Array::new();
        for _ in 0..count {
            let Some(triple) = self.iter.next() else {
                break;
            };
            out.push(&from_triple(
                &self.data_factory,
                &triple.map_err(JsError::from)?,
            ));
        }
        Ok(out)
    }
}

fn query_results_format(format: &str) -> Result<QueryResultsFormat, JsValue> {
    if format.contains('/') {
        QueryResultsFormat::from_media_type(format).ok_or_else(|| {
            format_err!(
                "Not supported SPARQL query results format media type: {}",
                format
            )
        })
    } else {
        QueryResultsFormat::from_extension(format).ok_or_else(|| {
            format_err!(
                "Not supported SPARQL query results format extension: {}",
                format
            )
        })
    }
}
