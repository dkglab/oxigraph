use oxigraph::io::RdfFormat;
use oxigraph::sparql::{QueryResults, SparqlEvaluator};
use oxigraph::store::Store;

fn main() {
    // 1. An in-memory RDF store (no RocksDB needed).
    let store = Store::new().unwrap();

    // 2. Load a small graph written in Turtle.
    let turtle = r#"
        @prefix : <http://example.com/> .
        :alice a :Person ; :name "Alice" ; :age 30 ; :knows :bob, :carol .
        :bob   a :Person ; :name "Bob"   ; :age 24 .
        :carol a :Person ; :name "Carol" ; :age 29 ; :knows :alice .
    "#;
    store.load_from_slice(RdfFormat::Turtle, turtle).unwrap();
    println!("Loaded {} triples.\n", store.len().unwrap());

    // 3. SELECT query: who does Alice know, and how old are they?
    let QueryResults::Solutions(solutions) = SparqlEvaluator::new()
        .parse_query(r#"
            PREFIX : <http://example.com/>
            SELECT ?name ?age WHERE {
                :alice :knows ?p .
                ?p :name ?name ; :age ?age .
            } ORDER BY ?name
        "#).unwrap()
        .on_store(&store).execute().unwrap()
    else { unreachable!() };
    println!("People Alice knows:");
    for solution in solutions {
        let solution = solution.unwrap();
        println!("  - {} (age {})",
            solution.get("name").unwrap(), solution.get("age").unwrap());
    }

    // 4. UPDATE: everyone Alice knows, she now also follows.
    SparqlEvaluator::new()
        .parse_update(r#"
            PREFIX : <http://example.com/>
            INSERT { :alice :follows ?p } WHERE { :alice :knows ?p }
        "#).unwrap()
        .on_store(&store).execute().unwrap();
    println!("\nAfter UPDATE: store now holds {} triples.", store.len().unwrap());

    // 5. ASK: does Alice follow Bob now?
    let QueryResults::Boolean(follows) = SparqlEvaluator::new()
        .parse_query("PREFIX : <http://example.com/> ASK { :alice :follows :bob }").unwrap()
        .on_store(&store).execute().unwrap()
    else { unreachable!() };
    println!("Does Alice follow Bob? {follows}");
}
