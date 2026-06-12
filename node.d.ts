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
