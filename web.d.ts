/* tslint:disable */
/* eslint-disable */

import { BaseQuad, BlankNode, DataFactory, Literal, NamedNode, DefaultGraph, Term } from "@rdfjs/types";

interface Quad extends BaseQuad {
    subject: NamedNode | BlankNode;
    predicate: NamedNode;
    object: NamedNode | BlankNode | Literal | Quad;
    graph: NamedNode | BlankNode | DefaultGraph;
}

export class Store {
    readonly size: number;

    constructor(quads?: Iterable<Quad>);

    add(quad: Quad): void;

    delete(quad: Quad): void;

    dump(
    options: {
        format: string;
        from_graph_name?: BlankNode | DefaultGraph | NamedNode;
    }
    ): string;

    has(quad: Quad): boolean;

    load(
    input: string | UInt8Array | Iterable<string | UInt8Array>,
    options: {
        base_iri?: NamedNode | string;
        format: string;
        no_transaction?: boolean;
        to_graph_name?: BlankNode | DefaultGraph | NamedNode;
        unchecked?: boolean;
        lenient?: boolean;
    }
    ): void;

    match(subject?: Term | null, predicate?: Term | null, object?: Term | null, graph?: Term | null): Quad[];

    query(
    query: string,
    options?: {
        base_iri?: NamedNode | string;
        results_format?: string;
        default_graph?: BlankNode | DefaultGraph | NamedNode | Iterable<BlankNode | DefaultGraph | NamedNode>;
        named_graphs?: Iterable<BlankNode | NamedNode>;
        use_default_graph_as_union?: boolean;
    }
    ): boolean | Map<string, Term>[] | Quad[] | string;

    querySolutions(
    query: string,
    options?: {
        base_iri?: NamedNode | string;
        default_graph?: BlankNode | DefaultGraph | NamedNode | Iterable<BlankNode | DefaultGraph | NamedNode>;
        named_graphs?: Iterable<BlankNode | NamedNode>;
        use_default_graph_as_union?: boolean;
    }
    ): QuerySolutions;

    queryTriples(
    query: string,
    options?: {
        base_iri?: NamedNode | string;
        default_graph?: BlankNode | DefaultGraph | NamedNode | Iterable<BlankNode | DefaultGraph | NamedNode>;
        named_graphs?: Iterable<BlankNode | NamedNode>;
        use_default_graph_as_union?: boolean;
    }
    ): QueryTriples;

    update(
    update: string,
    options?: {
        base_iri?: NamedNode | string;
    }
    ): void;
}

export class QuerySolutions {
    readonly variables: string[];

    nextBatch(count: number): Map<string, Term>[];

    free(): void;
}

export class QueryTriples {
    nextBatch(count: number): Quad[];

    free(): void;
}

function parse(
input: string | UInt8Array,
options: {
    base_iri?: NamedNode | string;
    format: string;
    to_graph_name?: BlankNode | DefaultGraph | NamedNode;
    lenient?: boolean;
    data_factory?: DataFactory;
}
): Quad[];

function parse(
input: Iterable<string | UInt8Array>,
options: {
    base_iri?: NamedNode | string;
    format: string;
    to_graph_name?: BlankNode | DefaultGraph | NamedNode;
    lenient?: boolean;
    data_factory?: DataFactory;
}
): IterableIterator<Quad>;

function parse(
input: AsyncIterable<string | UInt8Array>,
options: {
    base_iri?: NamedNode | string;
    format: string;
    to_graph_name?: BlankNode | DefaultGraph | NamedNode;
    lenient?: boolean;
    data_factory?: DataFactory;
}
): AsyncIterableIterator<Quad>;



export class QuerySolutions {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    nextBatch(count: number): Array<any>;
    readonly variables: Array<any>;
}

export class QueryTriples {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    nextBatch(count: number): Array<any>;
}

export function main(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_asyncparseriterator_free: (a: number, b: number) => void;
    readonly __wbg_parseriterator_free: (a: number, b: number) => void;
    readonly __wbg_parseriteratorresult_free: (a: number, b: number) => void;
    readonly __wbg_querysolutions_free: (a: number, b: number) => void;
    readonly __wbg_querytriples_free: (a: number, b: number) => void;
    readonly __wbg_store_free: (a: number, b: number) => void;
    readonly asyncparseriterator_Symbol_asyncIterator: (a: number) => number;
    readonly asyncparseriterator_next: (a: number) => any;
    readonly main: () => void;
    readonly parse: (a: any, b: any) => [number, number, number];
    readonly parseriterator_Symbol_iterator: (a: number) => number;
    readonly parseriterator_next: (a: number) => [number, number, number];
    readonly parseriteratorresult_done: (a: number) => number;
    readonly parseriteratorresult_value: (a: number) => any;
    readonly querysolutions_nextBatch: (a: number, b: number) => [number, number, number];
    readonly querysolutions_variables: (a: number) => any;
    readonly querytriples_nextBatch: (a: number, b: number) => [number, number, number];
    readonly store_add: (a: number, b: any) => [number, number];
    readonly store_delete: (a: number, b: any) => [number, number];
    readonly store_dump: (a: number, b: any) => [number, number, number, number];
    readonly store_has: (a: number, b: any) => [number, number, number];
    readonly store_load: (a: number, b: any, c: any) => [number, number];
    readonly store_match: (a: number, b: any, c: any, d: any, e: any) => [number, number, number, number];
    readonly store_new: (a: any) => [number, number, number];
    readonly store_query: (a: number, b: number, c: number, d: any) => [number, number, number];
    readonly store_querySolutions: (a: number, b: number, c: number, d: any) => [number, number, number];
    readonly store_queryTriples: (a: number, b: number, c: number, d: any) => [number, number, number];
    readonly store_size: (a: number) => [number, number, number];
    readonly store_update: (a: number, b: number, c: number, d: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h64e802d339b4498d: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h462f8c2ae7c79c79: (a: number, b: number, c: any, d: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
