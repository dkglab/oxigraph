import assert from "node:assert";
import { webcrypto } from "node:crypto";
import dataModel from "@rdfjs/data-model";
import type { Quad, Term } from "@rdfjs/types";
import { describe, it, vi } from "vitest";
import { Store } from "../pkg";

// thread_rng: Node.js ES modules are not directly supported, see https://docs.rs/getrandom#nodejs-es-module-support
vi.stubGlobal("crypto", webcrypto);

const ex = dataModel.namedNode("http://example.com");
const ex2 = dataModel.namedNode("http://example.com/2");
const triple = dataModel.quad(
    dataModel.blankNode("s"),
    dataModel.namedNode("http://example.com/p"),
    dataModel.literal("o"),
);

describe("Store", () => {
    describe("#add()", () => {
        it("an added quad should be in the store", () => {
            const store = new Store();
            store.add(dataModel.quad(ex, ex, triple));
            assert(store.has(dataModel.quad(ex, ex, triple)));
        });
    });

    describe("#delete()", () => {
        it("a removed quad should not be in the store anymore", () => {
            const store = new Store([dataModel.quad(ex, ex, triple, ex)]);
            assert(store.has(dataModel.quad(ex, ex, triple, ex)));
            store.delete(dataModel.quad(ex, ex, triple, ex));
            assert(!store.has(dataModel.quad(ex, ex, triple, ex)));
        });
    });

    describe("#has()", () => {
        it("an added quad should be in the store", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            assert(store.has(dataModel.quad(ex, ex, ex)));
        });
    });

    describe("#size()", () => {
        it("A store with one quad should have 1 for size", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            assert.strictEqual(1, store.size);
        });
    });

    describe("#match_quads()", () => {
        it("blank pattern should return all quads", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            const results = store.match();
            assert.strictEqual(1, results.length);
            assert(dataModel.quad(ex, ex, ex).equals(results[0]));
        });
    });

    describe("#query()", () => {
        it("ASK true", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            assert.strictEqual(true, store.query("ASK { ?s ?s ?s }"));
        });

        it("ASK false", () => {
            const store = new Store();
            assert.strictEqual(false, store.query("ASK { FILTER(false)}"));
        });

        it("CONSTRUCT", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            const results = store.query("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }") as Quad[];
            assert.strictEqual(1, results.length);
            assert(dataModel.quad(ex, ex, ex).equals(results[0]));
        });

        it("SELECT", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            const results = store.query("SELECT ?s WHERE { ?s ?p ?o }") as Map<string, Term>[];
            assert.strictEqual(1, results.length);
            assert(ex.equals(results[0]?.get("s")));
        });

        it("SELECT with NOW()", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            const results = store.query(
                "SELECT * WHERE { FILTER(2022 <= YEAR(NOW()) && YEAR(NOW()) <= 2100) }",
            ) as Map<string, Term>[];
            assert.strictEqual(1, results.length);
        });

        it("SELECT with RAND()", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            const results = store.query("SELECT (RAND() AS ?y) WHERE {}") as Map<string, Term>[];
            assert.strictEqual(1, results.length);
        });

        it("SELECT with base IRI", () => {
            const store = new Store();
            const results = store.query("SELECT * WHERE { BIND(<t> AS ?t) }", {
                base_iri: "http://example.com/",
            }) as Map<string, Term>[];
            assert.strictEqual(1, results.length);
        });

        it("SELECT with union graph", () => {
            const store = new Store([dataModel.quad(ex, ex, ex, ex)]);
            const results = store.query("SELECT * WHERE { ?s ?p ?o }", {
                use_default_graph_as_union: true,
            }) as Map<string, Term>[];
            assert.strictEqual(1, results.length);
        });

        it("SELECT with explicit default graph", () => {
            const store = new Store([dataModel.quad(ex, ex, ex, ex)]);
            const results = store.query("SELECT * WHERE { ?s ?p ?o }", {
                default_graph: ex,
            }) as Map<string, Term>[];
            assert.strictEqual(1, results.length);
        });

        it("SELECT with explicit default graph list", () => {
            const store = new Store([dataModel.quad(ex, ex, ex), dataModel.quad(ex, ex, ex, ex)]);
            const results = store.query("SELECT * WHERE { ?s ?p ?o }", {
                default_graph: [dataModel.defaultGraph(), ex],
            }) as Map<string, Term>[];
            assert.strictEqual(2, results.length);
        });

        it("SELECT with explicit named graphs list", () => {
            const store = new Store([
                dataModel.quad(ex, ex, ex, ex),
                dataModel.quad(ex, ex, ex, ex2),
            ]);
            const results = store.query("SELECT * WHERE { GRAPH ?g { ?s ?p ?o } }", {
                named_graphs: [ex],
            }) as Map<string, Term>[];
            assert.strictEqual(1, results.length);
        });

        it("SELECT with results format", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            const results = store.query("SELECT ?s ?p ?o WHERE { ?s ?p ?o }", {
                results_format: "json",
            });
            assert.strictEqual(
                '{"head":{"vars":["s","p","o"]},"results":{"bindings":[{"s":{"type":"uri","value":"http://example.com"},"p":{"type":"uri","value":"http://example.com"},"o":{"type":"uri","value":"http://example.com"}}]}}',
                results,
            );
        });

        it("CONSTRUCT with results format", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            const results = store.query("CONSTRUCT WHERE { ?s ?p ?o }", {
                results_format: "text/turtle",
            });
            assert.strictEqual(
                "<http://example.com> <http://example.com> <http://example.com> .\n",
                results,
            );
        });

        it("ASK with results format", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            const results = store.query("ASK { ?s ?p ?o }", {
                results_format: "csv",
            });
            assert.strictEqual("true", results);
        });
    });

    // Three distinct quads in the default graph, for batching tests.
    const q1 = dataModel.quad(ex, ex, ex);
    const q2 = dataModel.quad(ex, ex, ex2);
    const q3 = dataModel.quad(ex2, ex, ex);

    // Pull every row out of a cursor, batchSize rows at a time, until exhausted.
    function drainSolutions(
        cursor: { nextBatch(count: number): Map<string, Term>[] },
        batchSize = 2,
    ): Map<string, Term>[] {
        const all: Map<string, Term>[] = [];
        for (;;) {
            const batch = cursor.nextBatch(batchSize);
            if (batch.length === 0) break;
            all.push(...batch);
        }
        return all;
    }

    describe("#querySolutions()", () => {
        it("exposes variables up front", () => {
            const store = new Store([q1]);
            const cursor = store.querySolutions("SELECT ?s ?p ?o WHERE { ?s ?p ?o }");
            assert.deepStrictEqual(["s", "p", "o"], cursor.variables);
        });

        it("streams in bounded batches, empty batch signals exhaustion", () => {
            const store = new Store([q1, q2, q3]);
            const cursor = store.querySolutions("SELECT ?s ?p ?o WHERE { ?s ?p ?o }");
            assert.strictEqual(2, cursor.nextBatch(2).length);
            assert.strictEqual(1, cursor.nextBatch(2).length);
            assert.strictEqual(0, cursor.nextBatch(2).length);
        });

        it("a batch larger than the result returns everything, then exhausts", () => {
            const store = new Store([q1, q2, q3]);
            const cursor = store.querySolutions("SELECT ?s ?p ?o WHERE { ?s ?p ?o }");
            assert.strictEqual(3, cursor.nextBatch(100).length);
            assert.strictEqual(0, cursor.nextBatch(100).length);
        });

        it("exhaustion is stable across repeated pulls", () => {
            const store = new Store([q1]);
            const cursor = store.querySolutions("SELECT ?s WHERE { ?s ?p ?o }");
            assert.strictEqual(1, cursor.nextBatch(10).length);
            assert.strictEqual(0, cursor.nextBatch(10).length);
            assert.strictEqual(0, cursor.nextBatch(10).length);
        });

        it("an empty result set yields an empty batch but still has variables", () => {
            const store = new Store([q1]);
            const cursor = store.querySolutions("SELECT ?s WHERE { ?s ?p <http://nope> }");
            assert.deepStrictEqual(["s"], cursor.variables);
            assert.strictEqual(0, cursor.nextBatch(10).length);
        });

        it("yields faithful RDF/JS terms", () => {
            const lit = dataModel.literal("hi", "en");
            const store = new Store([dataModel.quad(ex, ex2, lit)]);
            const rows = store.querySolutions("SELECT ?s ?o WHERE { ?s ?p ?o }").nextBatch(10);
            assert.strictEqual(1, rows.length);
            assert(ex.equals(rows[0]?.get("s")));
            assert(lit.equals(rows[0]?.get("o")));
        });

        it("honours the base_iri option", () => {
            const store = new Store();
            const rows = store
                .querySolutions("SELECT * WHERE { BIND(<t> AS ?t) }", {
                    base_iri: "http://example.com/",
                })
                .nextBatch(10);
            assert.strictEqual(1, rows.length);
            assert(dataModel.namedNode("http://example.com/t").equals(rows[0]?.get("t")));
        });

        it("honours use_default_graph_as_union", () => {
            const store = new Store([dataModel.quad(ex, ex, ex, ex)]);
            const cursor = store.querySolutions("SELECT * WHERE { ?s ?p ?o }", {
                use_default_graph_as_union: true,
            });
            assert.strictEqual(1, drainSolutions(cursor).length);
        });

        it("honours an explicit default_graph", () => {
            const store = new Store([dataModel.quad(ex, ex, ex, ex)]);
            const cursor = store.querySolutions("SELECT * WHERE { ?s ?p ?o }", {
                default_graph: ex,
            });
            assert.strictEqual(1, drainSolutions(cursor).length);
        });

        it("honours a named_graphs list", () => {
            const store = new Store([
                dataModel.quad(ex, ex, ex, ex),
                dataModel.quad(ex, ex, ex, ex2),
            ]);
            const cursor = store.querySolutions("SELECT * WHERE { GRAPH ?g { ?s ?p ?o } }", {
                named_graphs: [ex],
            });
            assert.strictEqual(1, drainSolutions(cursor).length);
        });

        it("rejects non-SELECT queries", () => {
            const store = new Store([q1]);
            assert.throws(() => store.querySolutions("ASK { ?s ?p ?o }"), /SELECT/);
            assert.throws(
                () => store.querySolutions("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }"),
                /SELECT/,
            );
            assert.throws(() => store.querySolutions("DESCRIBE <http://example.com>"), /SELECT/);
        });

        it("rejects a zero-sized batch (the empty batch is reserved for exhaustion)", () => {
            const store = new Store([q1]);
            const cursor = store.querySolutions("SELECT ?s WHERE { ?s ?p ?o }");
            assert.throws(() => cursor.nextBatch(0));
        });

        it("is isolated from concurrent mutation (MVCC snapshot)", () => {
            const store = new Store([q1, q2, q3]);
            const cursor = store.querySolutions("SELECT ?s ?p ?o WHERE { ?s ?p ?o }");
            assert.strictEqual(1, cursor.nextBatch(1).length);
            store.update("DELETE WHERE { ?s ?p ?o }");
            assert.strictEqual(0, store.size);
            // The open cursor still sees the snapshot taken at query time.
            assert.strictEqual(2, drainSolutions(cursor, 10).length);
        });

        it("can no longer be used after free()", () => {
            const store = new Store([q1]);
            const cursor = store.querySolutions("SELECT ?s WHERE { ?s ?p ?o }");
            cursor.free();
            assert.throws(() => cursor.nextBatch(1));
        });
    });

    describe("#queryTriples()", () => {
        it("streams triples in bounded batches, empty batch signals exhaustion", () => {
            const store = new Store([q1, q2, q3]);
            const cursor = store.queryTriples("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }");
            assert.strictEqual(2, cursor.nextBatch(2).length);
            assert.strictEqual(1, cursor.nextBatch(2).length);
            assert.strictEqual(0, cursor.nextBatch(2).length);
        });

        it("yields faithful RDF/JS quads", () => {
            const store = new Store([q1]);
            const rows = store
                .queryTriples("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }")
                .nextBatch(10);
            assert.strictEqual(1, rows.length);
            assert(dataModel.quad(ex, ex, ex).equals(rows[0]));
        });

        it("supports DESCRIBE", () => {
            const store = new Store([q1]);
            const rows = store.queryTriples("DESCRIBE <http://example.com>").nextBatch(10);
            assert(rows.length >= 1);
            assert(dataModel.quad(ex, ex, ex).equals(rows[0]));
        });

        it("an empty result set yields an empty batch", () => {
            const store = new Store([q1]);
            const cursor = store.queryTriples(
                "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p <http://nope> }",
            );
            assert.strictEqual(0, cursor.nextBatch(10).length);
        });

        it("rejects non-CONSTRUCT/DESCRIBE queries", () => {
            const store = new Store([q1]);
            assert.throws(() => store.queryTriples("SELECT ?s WHERE { ?s ?p ?o }"), /CONSTRUCT/);
            assert.throws(() => store.queryTriples("ASK { ?s ?p ?o }"), /CONSTRUCT/);
        });

        it("rejects a zero-sized batch", () => {
            const store = new Store([q1]);
            const cursor = store.queryTriples("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }");
            assert.throws(() => cursor.nextBatch(0));
        });

        it("is isolated from concurrent mutation (MVCC snapshot)", () => {
            const store = new Store([q1, q2, q3]);
            const cursor = store.queryTriples("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }");
            assert.strictEqual(1, cursor.nextBatch(1).length);
            store.update("DELETE WHERE { ?s ?p ?o }");
            assert.strictEqual(0, store.size);
            let seen = 1;
            for (;;) {
                const batch = cursor.nextBatch(10);
                if (batch.length === 0) break;
                seen += batch.length;
            }
            assert.strictEqual(3, seen);
        });

        it("can no longer be used after free()", () => {
            const store = new Store([q1]);
            const cursor = store.queryTriples("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }");
            cursor.free();
            assert.throws(() => cursor.nextBatch(1));
        });
    });

    describe("#update()", () => {
        it("INSERT DATA", () => {
            const store = new Store();
            store.update(
                "INSERT DATA { <http://example.com> <http://example.com> <http://example.com> }",
            );
            assert.strictEqual(1, store.size);
        });

        it("DELETE DATA", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            store.update(
                "DELETE DATA { <http://example.com> <http://example.com> <http://example.com> }",
            );
            assert.strictEqual(0, store.size);
        });

        it("DELETE WHERE", () => {
            const store = new Store([dataModel.quad(ex, ex, ex)]);
            store.update("DELETE WHERE { ?v ?v ?v }");
            assert.strictEqual(0, store.size);
        });
    });

    describe("#load()", () => {
        it("load NTriples in the default graph", () => {
            const store = new Store();
            store.load("<http://example.com> <http://example.com> <http://example.com> .", {
                format: "application/n-triples",
            });
            assert(store.has(dataModel.quad(ex, ex, ex)));
        });

        it("load NTriples in an other graph", () => {
            const store = new Store();
            store.load(["<http://example.com> <http://example.com> <http://example.com> ."], {
                format: "application/n-triples",
                to_graph_name: ex,
            });
            assert(store.has(dataModel.quad(ex, ex, ex, ex)));
        });

        it("load Turtle with a base IRI", () => {
            const store = new Store();
            store.load(Buffer.from("<http://example.com> <http://example.com> <> ."), {
                base_iri: "http://example.com",
                format: "text/turtle",
            });
            assert(store.has(dataModel.quad(ex, ex, ex)));
        });

        it("load NQuads", () => {
            const store = new Store();
            store.load(
                [
                    Buffer.from(
                        "<http://example.com> <http://example.com> <http://example.com> <http://example.com> .",
                    ),
                ],
                { format: "application/n-quads" },
            );
            assert(store.has(dataModel.quad(ex, ex, ex, ex)));
        });

        it("load TriG with a base IRI", () => {
            const store = new Store();
            store.load("GRAPH <> { <http://example.com> <http://example.com> <> }", {
                format: "application/trig",
                base_iri: "http://example.com",
            });
            assert(store.has(dataModel.quad(ex, ex, ex, ex)));
        });

        it("load TriG with options", () => {
            const store = new Store();
            store.load("GRAPH <> { <http://example.com> <http://example.com> <> }", {
                format: "application/trig",
                base_iri: "http://example.com",
                unchecked: true,
                no_transaction: true,
            });
            assert(store.has(dataModel.quad(ex, ex, ex, ex)));
        });
    });

    describe("#dump()", () => {
        it("dump dataset content", () => {
            const store = new Store([dataModel.quad(ex, ex, ex, ex)]);
            assert.strictEqual(
                "<http://example.com> <http://example.com> <http://example.com> <http://example.com> .\n",
                store.dump({ format: "application/n-quads" }),
            );
        });

        it("dump named graph content", () => {
            const store = new Store([dataModel.quad(ex, ex, ex, ex)]);
            assert.strictEqual(
                "<http://example.com> <http://example.com> <http://example.com> .\n",
                store.dump({ format: "application/n-triples", from_graph_name: ex }),
            );
        });

        it("dump named graph content with options", () => {
            const store = new Store([dataModel.quad(ex, ex, ex, ex)]);
            assert.strictEqual(
                "<http://example.com> <http://example.com> <http://example.com> .\n",
                store.dump({ format: "application/n-triples", from_graph_name: ex }),
            );
        });

        it("dump default graph content", () => {
            const store = new Store([dataModel.quad(ex, ex, ex, ex)]);
            assert.strictEqual(
                "",
                store.dump({
                    format: "application/n-triples",
                    from_graph_name: dataModel.defaultGraph(),
                }),
            );
        });
    });
});
