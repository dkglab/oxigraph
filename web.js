// node_modules/@rdfjs/data-model/lib/BlankNode.js
var BlankNode = class {
  constructor(id) {
    this.value = id;
  }
  equals(other) {
    return !!other && other.termType === this.termType && other.value === this.value;
  }
};
BlankNode.prototype.termType = "BlankNode";
var BlankNode_default = BlankNode;

// node_modules/@rdfjs/data-model/lib/DefaultGraph.js
var DefaultGraph = class {
  equals(other) {
    return !!other && other.termType === this.termType;
  }
};
DefaultGraph.prototype.termType = "DefaultGraph";
DefaultGraph.prototype.value = "";
var DefaultGraph_default = DefaultGraph;

// node_modules/@rdfjs/data-model/lib/fromTerm.js
function fromTerm(factory2, original) {
  if (!original) {
    return null;
  }
  if (original.termType === "BlankNode") {
    return factory2.blankNode(original.value);
  }
  if (original.termType === "DefaultGraph") {
    return factory2.defaultGraph();
  }
  if (original.termType === "Literal") {
    return factory2.literal(original.value, original.language || factory2.namedNode(original.datatype.value));
  }
  if (original.termType === "NamedNode") {
    return factory2.namedNode(original.value);
  }
  if (original.termType === "Quad") {
    const subject = factory2.fromTerm(original.subject);
    const predicate = factory2.fromTerm(original.predicate);
    const object = factory2.fromTerm(original.object);
    const graph = factory2.fromTerm(original.graph);
    return factory2.quad(subject, predicate, object, graph);
  }
  if (original.termType === "Variable") {
    return factory2.variable(original.value);
  }
  throw new Error(`unknown termType ${original.termType}`);
}
var fromTerm_default = fromTerm;

// node_modules/@rdfjs/data-model/lib/Literal.js
var Literal = class {
  constructor(value, language, datatype, direction = "") {
    this.value = value;
    this.language = language;
    this.datatype = datatype;
    this.direction = direction;
  }
  equals(other) {
    return !!other && other.termType === this.termType && other.value === this.value && other.language === this.language && other.datatype.equals(this.datatype) && (other.direction || "") === this.direction;
  }
};
Literal.prototype.termType = "Literal";
var Literal_default = Literal;

// node_modules/@rdfjs/data-model/lib/NamedNode.js
var NamedNode = class {
  constructor(iri) {
    this.value = iri;
  }
  equals(other) {
    return !!other && other.termType === this.termType && other.value === this.value;
  }
};
NamedNode.prototype.termType = "NamedNode";
var NamedNode_default = NamedNode;

// node_modules/@rdfjs/data-model/lib/Quad.js
var Quad = class {
  constructor(subject, predicate, object, graph) {
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
    this.graph = graph;
  }
  equals(other) {
    return !!other && (other.termType === "Quad" || !other.termType) && other.subject.equals(this.subject) && other.predicate.equals(this.predicate) && other.object.equals(this.object) && other.graph.equals(this.graph);
  }
};
Quad.prototype.termType = "Quad";
Quad.prototype.value = "";
var Quad_default = Quad;

// node_modules/@rdfjs/data-model/lib/Variable.js
var Variable = class {
  constructor(name) {
    this.value = name;
  }
  equals(other) {
    return !!other && other.termType === this.termType && other.value === this.value;
  }
};
Variable.prototype.termType = "Variable";
var Variable_default = Variable;

// node_modules/@rdfjs/data-model/Factory.js
var dirLangStringDatatype = new NamedNode_default("http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString");
var langStringDatatype = new NamedNode_default("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
var stringDatatype = new NamedNode_default("http://www.w3.org/2001/XMLSchema#string");
var DataFactory = class {
  constructor() {
    this.init();
  }
  init() {
    this._data = {
      blankNodeCounter: 0,
      defaultGraph: new DefaultGraph_default()
    };
  }
  namedNode(value) {
    return new NamedNode_default(value);
  }
  blankNode(value) {
    value = value || "b" + ++this._data.blankNodeCounter;
    return new BlankNode_default(value);
  }
  literal(value, languageOrDatatype) {
    if (typeof languageOrDatatype === "string") {
      return new Literal_default(value, languageOrDatatype, langStringDatatype);
    } else if (typeof languageOrDatatype?.language === "string") {
      return new Literal_default(
        value,
        languageOrDatatype.language,
        languageOrDatatype.direction ? dirLangStringDatatype : langStringDatatype,
        languageOrDatatype.direction
      );
    } else {
      return new Literal_default(value, "", languageOrDatatype || stringDatatype);
    }
  }
  variable(value) {
    return new Variable_default(value);
  }
  defaultGraph() {
    return this._data.defaultGraph;
  }
  quad(subject, predicate, object, graph = this.defaultGraph()) {
    return new Quad_default(subject, predicate, object, graph);
  }
  fromTerm(original) {
    return fromTerm_default(this, original);
  }
  fromQuad(original) {
    return fromTerm_default(this, original);
  }
};
DataFactory.exports = [
  "blankNode",
  "defaultGraph",
  "fromQuad",
  "fromTerm",
  "literal",
  "namedNode",
  "quad",
  "variable"
];
var Factory_default = DataFactory;

// node_modules/@rdfjs/data-model/index.js
var factory = new Factory_default();
var data_model_default = factory;

// npm-dist/web.js
var AsyncParserIterator = class _AsyncParserIterator {
  static __wrap(ptr) {
    const obj = Object.create(_AsyncParserIterator.prototype);
    obj.__wbg_ptr = ptr;
    AsyncParserIteratorFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AsyncParserIteratorFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_asyncparseriterator_free(ptr, 0);
  }
  /**
   * @returns {AsyncParserIterator}
   */
  [Symbol.asyncIterator]() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.asyncparseriterator_Symbol_asyncIterator(ptr);
    return _AsyncParserIterator.__wrap(ret);
  }
  /**
   * @returns {Promise<ParserIteratorResult>}
   */
  next() {
    const ret = wasm.asyncparseriterator_next(this.__wbg_ptr);
    return ret;
  }
};
if (Symbol.dispose) AsyncParserIterator.prototype[Symbol.dispose] = AsyncParserIterator.prototype.free;
var ParserIterator = class _ParserIterator {
  static __wrap(ptr) {
    const obj = Object.create(_ParserIterator.prototype);
    obj.__wbg_ptr = ptr;
    ParserIteratorFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ParserIteratorFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_parseriterator_free(ptr, 0);
  }
  /**
   * @returns {ParserIterator}
   */
  [Symbol.iterator]() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.parseriterator_Symbol_iterator(ptr);
    return _ParserIterator.__wrap(ret);
  }
  /**
   * @returns {ParserIteratorResult}
   */
  next() {
    const ret = wasm.parseriterator_next(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ParserIteratorResult.__wrap(ret[0]);
  }
};
if (Symbol.dispose) ParserIterator.prototype[Symbol.dispose] = ParserIterator.prototype.free;
var ParserIteratorResult = class _ParserIteratorResult {
  static __wrap(ptr) {
    const obj = Object.create(_ParserIteratorResult.prototype);
    obj.__wbg_ptr = ptr;
    ParserIteratorResultFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ParserIteratorResultFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_parseriteratorresult_free(ptr, 0);
  }
  /**
   * @returns {boolean}
   */
  get done() {
    const ret = wasm.parseriteratorresult_done(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * @returns {any | undefined}
   */
  get value() {
    const ret = wasm.parseriteratorresult_value(this.__wbg_ptr);
    return ret;
  }
};
if (Symbol.dispose) ParserIteratorResult.prototype[Symbol.dispose] = ParserIteratorResult.prototype.free;
var QuerySolutions = class _QuerySolutions {
  static __wrap(ptr) {
    const obj = Object.create(_QuerySolutions.prototype);
    obj.__wbg_ptr = ptr;
    QuerySolutionsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    QuerySolutionsFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_querysolutions_free(ptr, 0);
  }
  /**
   * @param {number} count
   * @returns {Array<any>}
   */
  nextBatch(count) {
    const ret = wasm.querysolutions_nextBatch(this.__wbg_ptr, count);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @returns {Array<any>}
   */
  get variables() {
    const ret = wasm.querysolutions_variables(this.__wbg_ptr);
    return ret;
  }
};
if (Symbol.dispose) QuerySolutions.prototype[Symbol.dispose] = QuerySolutions.prototype.free;
var QueryTriples = class _QueryTriples {
  static __wrap(ptr) {
    const obj = Object.create(_QueryTriples.prototype);
    obj.__wbg_ptr = ptr;
    QueryTriplesFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    QueryTriplesFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_querytriples_free(ptr, 0);
  }
  /**
   * @param {number} count
   * @returns {Array<any>}
   */
  nextBatch(count) {
    const ret = wasm.querytriples_nextBatch(this.__wbg_ptr, count);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
};
if (Symbol.dispose) QueryTriples.prototype[Symbol.dispose] = QueryTriples.prototype.free;
var Store = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    StoreFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_store_free(ptr, 0);
  }
  /**
   * @param {any} quad
   */
  add(quad) {
    const ret = wasm.store_add(this.__wbg_ptr, quad);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {any} quad
   */
  delete(quad) {
    const ret = wasm.store_delete(this.__wbg_ptr, quad);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {any} options
   * @returns {string}
   */
  dump(options) {
    let deferred2_0;
    let deferred2_1;
    try {
      const ret = wasm.store_dump(this.__wbg_ptr, options);
      var ptr1 = ret[0];
      var len1 = ret[1];
      if (ret[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
  /**
   * @param {any} quad
   * @returns {boolean}
   */
  has(quad) {
    const ret = wasm.store_has(this.__wbg_ptr, quad);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
  /**
   * @param {any} data
   * @param {any} options
   */
  load(data, options) {
    const ret = wasm.store_load(this.__wbg_ptr, data, options);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {any} subject
   * @param {any} predicate
   * @param {any} object
   * @param {any} graph_name
   * @returns {any[]}
   */
  match(subject, predicate, object, graph_name) {
    const ret = wasm.store_match(this.__wbg_ptr, subject, predicate, object, graph_name);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
  }
  /**
   * @param {any} quads
   */
  constructor(quads) {
    const ret = wasm.store_new(quads);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0];
    StoreFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @param {string} query
   * @param {any} options
   * @returns {any}
   */
  query(query, options) {
    const ptr0 = passStringToWasm0(query, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.store_query(this.__wbg_ptr, ptr0, len0, options);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {string} query
   * @param {any} options
   * @returns {QuerySolutions}
   */
  querySolutions(query, options) {
    const ptr0 = passStringToWasm0(query, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.store_querySolutions(this.__wbg_ptr, ptr0, len0, options);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return QuerySolutions.__wrap(ret[0]);
  }
  /**
   * @param {string} query
   * @param {any} options
   * @returns {QueryTriples}
   */
  queryTriples(query, options) {
    const ptr0 = passStringToWasm0(query, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.store_queryTriples(this.__wbg_ptr, ptr0, len0, options);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return QueryTriples.__wrap(ret[0]);
  }
  /**
   * @returns {number}
   */
  get size() {
    const ret = wasm.store_size(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] >>> 0;
  }
  /**
   * @param {string} update
   * @param {any} options
   */
  update(update, options) {
    const ptr0 = passStringToWasm0(update, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.store_update(this.__wbg_ptr, ptr0, len0, options);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
};
if (Symbol.dispose) Store.prototype[Symbol.dispose] = Store.prototype.free;
function main() {
  wasm.main();
}
function parse(input, options) {
  const ret = wasm.parse(input, options);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg_Error_9dc85fe1bc224456: function(arg0, arg1) {
      const ret = Error(getStringFromWasm0(arg0, arg1));
      return ret;
    },
    __wbg___wbindgen_debug_string_56c147eb1a51f0c4: function(arg0, arg1) {
      const ret = debugString(arg1);
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_is_falsy_b42b20cdf083ea22: function(arg0) {
      const ret = !arg0;
      return ret;
    },
    __wbg___wbindgen_is_function_147961669f068cd4: function(arg0) {
      const ret = typeof arg0 === "function";
      return ret;
    },
    __wbg___wbindgen_is_null_ced4761460071341: function(arg0) {
      const ret = arg0 === null;
      return ret;
    },
    __wbg___wbindgen_is_object_3a2c414391dbf751: function(arg0) {
      const val = arg0;
      const ret = typeof val === "object" && val !== null;
      return ret;
    },
    __wbg___wbindgen_is_undefined_4410e3c20a99fa97: function(arg0) {
      const ret = arg0 === void 0;
      return ret;
    },
    __wbg___wbindgen_string_get_fa2687d531ed17a5: function(arg0, arg1) {
      const obj = arg1;
      const ret = typeof obj === "string" ? obj : void 0;
      var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_throw_bbadd78c1bac3a77: function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbg__wbg_cb_unref_c2301a3c9b78104b: function(arg0) {
      arg0._wbg_cb_unref();
    },
    __wbg_asyncIterator_fd795bd1a6890c3e: function() {
      const ret = Symbol.asyncIterator;
      return ret;
    },
    __wbg_asyncparseriterator_new: function(arg0) {
      const ret = AsyncParserIterator.__wrap(arg0);
      return ret;
    },
    __wbg_blankNode_3613c3ec76a3c660: function(arg0, arg1, arg2) {
      const ret = arg0.blankNode(getStringFromWasm0(arg1, arg2));
      return ret;
    },
    __wbg_call_91f00ddc43e01490: function() {
      return handleError(function(arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
      }, arguments);
    },
    __wbg_call_ec09a4cf93377d3a: function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
      }, arguments);
    },
    __wbg_defaultGraph_d2e4b97ae6929165: function(arg0) {
      const ret = arg0.defaultGraph();
      return ret;
    },
    __wbg_done_6a8439e544ec6206: function(arg0) {
      const ret = arg0.done;
      return ret;
    },
    __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
      let deferred0_0;
      let deferred0_1;
      try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
      } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
      }
    },
    __wbg_getRandomValues_76dfc69825c9c552: function() {
      return handleError(function(arg0, arg1) {
        globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
      }, arguments);
    },
    __wbg_get_44e98e27bda25b5b: function() {
      return handleError(function(arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
      }, arguments);
    },
    __wbg_get_52a8a619f7b88df6: function() {
      return handleError(function(arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
      }, arguments);
    },
    __wbg_instanceof_Uint8Array_b6fe1ac89eba107e: function(arg0) {
      let result;
      try {
        result = arg0 instanceof Uint8Array;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_iterator_9b36cebf3be7b7cd: function() {
      const ret = Symbol.iterator;
      return ret;
    },
    __wbg_length_68a9d5278d084f4f: function(arg0) {
      const ret = arg0.length;
      return ret;
    },
    __wbg_literal_2fd89599ffd70ba4: function(arg0, arg1, arg2) {
      const ret = arg0.literal(getStringFromWasm0(arg1, arg2));
      return ret;
    },
    __wbg_literal_5c8ba7170a52997b: function(arg0, arg1, arg2, arg3) {
      const ret = arg0.literal(getStringFromWasm0(arg1, arg2), arg3);
      return ret;
    },
    __wbg_literal_75c439a936edeff2: function(arg0, arg1, arg2, arg3, arg4) {
      const ret = arg0.literal(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
      return ret;
    },
    __wbg_namedNode_d56f9cd7562fb61c: function(arg0, arg1, arg2) {
      const ret = arg0.namedNode(getStringFromWasm0(arg1, arg2));
      return ret;
    },
    __wbg_new_0b303268aa395a38: function() {
      const ret = new Array();
      return ret;
    },
    __wbg_new_20b778a4c5c691c3: function() {
      const ret = new Object();
      return ret;
    },
    __wbg_new_227d7c05414eb861: function() {
      const ret = new Error();
      return ret;
    },
    __wbg_new_5fae30e6b23db8df: function(arg0, arg1) {
      const ret = new Error(getStringFromWasm0(arg0, arg1));
      return ret;
    },
    __wbg_new_883c0db065f06efd: function() {
      const ret = /* @__PURE__ */ new Map();
      return ret;
    },
    __wbg_new_e21a762c613d3c26: function(arg0, arg1) {
      const ret = new URIError(getStringFromWasm0(arg0, arg1));
      return ret;
    },
    __wbg_new_typed_90c3f6c29ba36d19: function(arg0, arg1) {
      try {
        var state0 = { a: arg0, b: arg1 };
        var cb0 = (arg02, arg12) => {
          const a = state0.a;
          state0.a = 0;
          try {
            return wasm_bindgen__convert__closures_____invoke__h462f8c2ae7c79c79(a, state0.b, arg02, arg12);
          } finally {
            state0.a = a;
          }
        };
        const ret = new Promise(cb0);
        return ret;
      } finally {
        state0.a = 0;
      }
    },
    __wbg_next_8cb028b6ba50743f: function() {
      return handleError(function(arg0) {
        const ret = arg0.next();
        return ret;
      }, arguments);
    },
    __wbg_next_cfd0b146c9538df8: function(arg0) {
      const ret = arg0.next;
      return ret;
    },
    __wbg_next_e20315f96c63b581: function() {
      return handleError(function(arg0) {
        const ret = arg0.next();
        return ret;
      }, arguments);
    },
    __wbg_now_bce4dc999095ea77: function() {
      const ret = Date.now();
      return ret;
    },
    __wbg_parseriterator_new: function(arg0) {
      const ret = ParserIterator.__wrap(arg0);
      return ret;
    },
    __wbg_parseriteratorresult_new: function(arg0) {
      const ret = ParserIteratorResult.__wrap(arg0);
      return ret;
    },
    __wbg_prototypesetcall_956c7493c68e29b4: function(arg0, arg1, arg2) {
      Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
    },
    __wbg_push_ceb8ef046afb2041: function(arg0, arg1) {
      const ret = arg0.push(arg1);
      return ret;
    },
    __wbg_quad_183d2f9b015aea7b: function(arg0, arg1, arg2, arg3, arg4) {
      const ret = arg0.quad(arg1, arg2, arg3, arg4);
      return ret;
    },
    __wbg_quad_d3c6f40ef4b26224: function(arg0, arg1, arg2, arg3) {
      const ret = arg0.quad(arg1, arg2, arg3);
      return ret;
    },
    __wbg_queueMicrotask_4698f900840e3286: function(arg0) {
      queueMicrotask(arg0);
    },
    __wbg_queueMicrotask_477a5533c7100338: function(arg0) {
      const ret = arg0.queueMicrotask;
      return ret;
    },
    __wbg_resolve_0183de2e8c6b1d54: function(arg0) {
      const ret = Promise.resolve(arg0);
      return ret;
    },
    __wbg_set_5f806304fb633ab3: function(arg0, arg1, arg2) {
      const ret = arg0.set(arg1, arg2);
      return ret;
    },
    __wbg_set_a6ba3ac0e634b822: function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
      }, arguments);
    },
    __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
      const ret = arg1.stack;
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg_static_accessor_FACTORY_d285f170653f78e5: function() {
      const ret = data_model_default;
      return ret;
    },
    __wbg_static_accessor_GLOBAL_60a4124bab7dcc9a: function() {
      const ret = typeof global === "undefined" ? null : global;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_GLOBAL_THIS_95ca6460658b5d13: function() {
      const ret = typeof globalThis === "undefined" ? null : globalThis;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_SELF_4c95f759a91e9aae: function() {
      const ret = typeof self === "undefined" ? null : self;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_WINDOW_44b435597f9e9ee7: function() {
      const ret = typeof window === "undefined" ? null : window;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_string_BASE_IRI_2d8e7abd66d4de9f: function() {
      const ret = `base_iri`;
      return ret;
    },
    __wbg_string_DATATYPE_a85bb587b048ac36: function() {
      const ret = `datatype`;
      return ret;
    },
    __wbg_string_DATA_FACTORY_d9143568d5fb1782: function() {
      const ret = `data_factory`;
      return ret;
    },
    __wbg_string_DEFAULT_GRAPH_ad208a468111cd28: function() {
      const ret = `default_graph`;
      return ret;
    },
    __wbg_string_DIRECTION_4c38ff8c7bc054fd: function() {
      const ret = `direction`;
      return ret;
    },
    __wbg_string_FORMAT_e5420ac6e1041f3e: function() {
      const ret = `format`;
      return ret;
    },
    __wbg_string_FROM_GRAPH_NAME_407daaafeac69f8f: function() {
      const ret = `from_graph_name`;
      return ret;
    },
    __wbg_string_GRAPH_a3c5bc7f4246d27c: function() {
      const ret = `graph`;
      return ret;
    },
    __wbg_string_LANGUAGE_8eccbddce3f53185: function() {
      const ret = `language`;
      return ret;
    },
    __wbg_string_LENIENT_faf2c0e456a9c47e: function() {
      const ret = `lenient`;
      return ret;
    },
    __wbg_string_LTR_0079f1fdfb674f4e: function() {
      const ret = `ltr`;
      return ret;
    },
    __wbg_string_NAMED_GRAPHS_24b67778a3d84c28: function() {
      const ret = `named_graphs`;
      return ret;
    },
    __wbg_string_NO_TRANSACTION_2c1034506f9a80d7: function() {
      const ret = `no_transaction`;
      return ret;
    },
    __wbg_string_OBJECT_02abd0d6dc63427b: function() {
      const ret = `object`;
      return ret;
    },
    __wbg_string_PREDICATE_5adda76711f4ac41: function() {
      const ret = `predicate`;
      return ret;
    },
    __wbg_string_RESULTS_FORMAT_253c840fbfb238be: function() {
      const ret = `results_format`;
      return ret;
    },
    __wbg_string_RTL_3416963831e549b3: function() {
      const ret = `rtl`;
      return ret;
    },
    __wbg_string_SUBJECT_fef4f6f09df99a6c: function() {
      const ret = `subject`;
      return ret;
    },
    __wbg_string_TERM_TYPE_ce6ed074f81ca2af: function() {
      const ret = `termType`;
      return ret;
    },
    __wbg_string_TO_GRAPH_NAME_0e53d4e6aa26f7ad: function() {
      const ret = `to_graph_name`;
      return ret;
    },
    __wbg_string_USED_DEFAULT_GRAPH_AS_UNION_c8a4144b23aa2610: function() {
      const ret = `use_default_graph_as_union`;
      return ret;
    },
    __wbg_string_VALUE_bfbccf2cbfbcbdba: function() {
      const ret = `value`;
      return ret;
    },
    __wbg_then_254bab9b266a77a5: function(arg0, arg1, arg2) {
      const ret = arg0.then(arg1, arg2);
      return ret;
    },
    __wbg_then_3ea18602c6a5123b: function(arg0, arg1) {
      const ret = arg0.then(arg1);
      return ret;
    },
    __wbg_value_3d3defe09fb1ffca: function(arg0) {
      const ret = arg0.value;
      return ret;
    },
    __wbindgen_cast_0000000000000001: function(arg0, arg1) {
      const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h64e802d339b4498d);
      return ret;
    },
    __wbindgen_cast_0000000000000002: function(arg0, arg1) {
      const ret = getStringFromWasm0(arg0, arg1);
      return ret;
    },
    __wbindgen_cast_0000000000000003: function(arg0, arg1) {
      var v0 = getArrayJsValueFromWasm0(arg0, arg1).slice();
      wasm.__wbindgen_free(arg0, arg1 * 4, 4);
      const ret = v0;
      return ret;
    },
    __wbindgen_init_externref_table: function() {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, void 0);
      table.set(offset + 0, void 0);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    }
  };
  return {
    __proto__: null,
    "./web_bg.js": import0
  };
}
function wasm_bindgen__convert__closures_____invoke__h64e802d339b4498d(arg0, arg1, arg2) {
  const ret = wasm.wasm_bindgen__convert__closures_____invoke__h64e802d339b4498d(arg0, arg1, arg2);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function wasm_bindgen__convert__closures_____invoke__h462f8c2ae7c79c79(arg0, arg1, arg2, arg3) {
  wasm.wasm_bindgen__convert__closures_____invoke__h462f8c2ae7c79c79(arg0, arg1, arg2, arg3);
}
var AsyncParserIteratorFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_asyncparseriterator_free(ptr, 1));
var ParserIteratorFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_parseriterator_free(ptr, 1));
var ParserIteratorResultFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_parseriteratorresult_free(ptr, 1));
var QuerySolutionsFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_querysolutions_free(ptr, 1));
var QueryTriplesFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_querytriples_free(ptr, 1));
var StoreFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_store_free(ptr, 1));
function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}
var CLOSURE_DTORS = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((state) => wasm.__wbindgen_destroy_closure(state.a, state.b));
function debugString(val) {
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    return toString.call(val);
  }
  if (className == "Object") {
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  if (val instanceof Error) {
    return `${val.name}: ${val.message}
${val.stack}`;
  }
  return className;
}
function getArrayJsValueFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  const mem = getDataViewMemory0();
  const result = [];
  for (let i = ptr; i < ptr + 4 * len; i += 4) {
    result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
  }
  wasm.__externref_drop_slice(ptr, len);
  return result;
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
var cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
function getStringFromWasm0(ptr, len) {
  return decodeText(ptr >>> 0, len);
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}
function isLikeNone(x) {
  return x === void 0 || x === null;
}
function makeMutClosure(arg0, arg1, f) {
  const state = { a: arg0, b: arg1, cnt: 1 };
  const real = (...args) => {
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      state.a = a;
      real._wbg_cb_unref();
    }
  };
  real._wbg_cb_unref = () => {
    if (--state.cnt === 0) {
      wasm.__wbindgen_destroy_closure(state.a, state.b);
      state.a = 0;
      CLOSURE_DTORS.unregister(state);
    }
  };
  CLOSURE_DTORS.register(real, state, state);
  return real;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
var wasmModule;
var wasmInstance;
var wasm;
function __wbg_finalize_init(instance, module) {
  wasmInstance = instance;
  wasm = instance.exports;
  wasmModule = module;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && expectedResponseType(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
function initSync(module) {
  if (wasm !== void 0) return wasm;
  if (module !== void 0) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = new URL("web_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}
export {
  QuerySolutions,
  QueryTriples,
  Store,
  __wbg_init as default,
  initSync,
  main,
  parse
};
