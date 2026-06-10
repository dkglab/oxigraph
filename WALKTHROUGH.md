# Oxigraph: A Walkthrough

*2026-06-10T18:01:33Z by Showboat 0.6.1*
<!-- showboat-id: f9bfdbc0-e8c7-470b-be82-e33525e2940b -->

[Oxigraph](https://github.com/oxigraph/oxigraph) is a graph database implementing the
[SPARQL](https://www.w3.org/TR/sparql11-overview/) standard, written in Rust. It stores
[RDF](https://www.w3.org/TR/rdf11-concepts/) data — statements of the form *(subject, predicate, object)*
— and lets you query it with SPARQL, the SQL of the graph world.

This document is **executable**: every code block below is run by [showboat](https://pypi.org/project/showboat/)
and its real output is captured inline. You can re-run `showboat verify WALKTHROUGH.md` to confirm the
outputs still hold.

We'll cover three things:

1. **What's in the repo** — the workspace and how its crates are layered.
2. **The core idea** — RDF + SPARQL, demonstrated live against an in-memory store.
3. **Where to go next** — the CLI, Python, and JavaScript front-ends.

## 1. What's in the repo

Oxigraph is a Cargo **workspace**. The `lib/` directory holds the database and a stack of
focused crates that each own one slice of the RDF/SPARQL problem; the front-ends (`cli/`,
`python/`, `js/`) wrap that core for different audiences. Here are the workspace members:

```bash
sed -n '/members = \[/,/\]/p' Cargo.toml
```

```output
members = [
  "cli",
  "js",
  "lib/oxigraph",
  "lib/oxjsonld",
  "lib/oxrdf",
  "lib/oxrdfio",
  "lib/oxrdfxml",
  "lib/oxsdatatypes",
  "lib/oxttl",
  "lib/sparesults",
  "lib/spareval",
  "lib/spargebra",
  "lib/spargeo",
  "lib/sparopt",
  "lib/sparql-smith",
  "oxrocksdb-sys",
  "python",
  "testsuite",
]
```

These crates are **layered**: each depends only on the ones below it. The `oxigraph` crate
ties them together into a database; everything beneath it is independently usable. The repo
ships an ASCII version of this diagram (`r` = Rust crate, `p` = Python, `j` = JavaScript):

```bash
sed -n '1,28p' docs/arch-diagram.txt
```

```output
+------------------+                  +-----------------+                  +-----------------+
+ oxigraph CLI {r} +                  + pyoxigraph {p}  +                  + oxigraph JS {j} +
+------------------+                  +-----------------+                  +-----------------+

+------------------------------------------------------------------------------------------------------------+
+ oxigraph (Rust) {r}                                                                                        +
+------------------------------------------------------------------------------------------------------------+

        +---------------------------------------------+ +----------------------------+
        + oxrdfio {r}                                 + + spareval {r}               +
        +---------------------------------------------+ +----------------------------+

        +---------------------------------------------+     +-------------+
        + oxrdfio {r}                                 +     + sparopt {r} +
        +---------------------------------------------+     +-------------+

        +-----------+ +--------------+ +--------------+ +-----------------+ +----------------+ +-------------+
        + oxttl {r} + + oxrdfxml {r} + + oxjsonld {r} + + spargebra {r}   + + sparesults {r} + + spargeo {r} +
        +-----------+ +--------------+ +--------------+ +-----------------+ +----------------+ +-------------+

    +--------------------------------------------------------------------------------------------------------+
    + oxrdf {r}                                                                                              +
    +--------------------------------------------------------------------------------------------------------+

+------------------+
+ oxsdatatypes {r} +
+------------------+

```

Reading bottom-up, the foundational crates are:

| Crate | Responsibility |
|-------|----------------|
| `oxsdatatypes` | XML Schema datatypes (numbers, dates, durations) used as RDF literal values |
| `oxrdf` | The core RDF data model: IRIs, blank nodes, literals, triples, quads |
| `oxttl` / `oxrdfxml` / `oxjsonld` | Parsers & serializers for Turtle/TriG/N-Triples/N-Quads, RDF/XML, and JSON-LD |
| `oxrdfio` | One unified parser/serializer API over all the RDF syntaxes above |
| `spargebra` | SPARQL query & update **parser** (produces an algebra) |
| `sparopt` | SPARQL query **optimizer** |
| `spareval` | SPARQL **evaluator** |
| `sparesults` | Readers/writers for SPARQL result formats (JSON, XML, CSV, TSV) |
| `spargeo` | Partial GeoSPARQL support |
| `oxigraph` | The database: an on-disk (RocksDB) or in-memory `Store` wiring it all together |

The standalone-Rust crates above are also published separately on crates.io, so you can pull
in just the Turtle parser, or just the SPARQL algebra, without the whole database.

## 2. The core idea, demonstrated live

Enough description — let's actually use it. The headline entry point is `oxigraph::store::Store`.
We'll spin up an **in-memory** store (the `rocksdb` feature is off, so there's nothing to install),
load a few people in Turtle, and then query and mutate them with SPARQL.

The full example lives in [`examples/in-memory-sparql/`](examples/in-memory-sparql). Its
`Cargo.toml` depends on this repo's `oxigraph` crate with the on-disk `rocksdb` backend turned
**off** (`oxigraph = { path = "../../lib/oxigraph", default-features = false }`), so it builds
with no extra system dependencies. Here is the whole program — it loads the Turtle, runs a
`SELECT`, applies an `UPDATE`, and finishes with an `ASK`:

```bash
cat examples/in-memory-sparql/src/main.rs
```

```output
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
```

Now build and run it straight from the repo root:

```bash
cargo run --quiet --manifest-path examples/in-memory-sparql/Cargo.toml
```

```output
Loaded 12 triples.

People Alice knows:
  - "Bob" (age "24"^^<http://www.w3.org/2001/XMLSchema#integer>)
  - "Carol" (age "29"^^<http://www.w3.org/2001/XMLSchema#integer>)

After UPDATE: store now holds 14 triples.
Does Alice follow Bob? true
```

That single run exercised the whole pipeline: the Turtle text was **parsed** (`oxttl`) into
12 triples, a SPARQL `SELECT` was **parsed** (`spargebra`), **optimized** (`sparopt`) and
**evaluated** (`spareval`) to find Alice's contacts, a SPARQL `UPDATE` mutated the graph
(12 → 14 triples), and an `ASK` confirmed the new `:follows` edges — all transactionally,
all in memory. Swap `Store::new()` for `Store::open(path)` (with the default `rocksdb` feature
on) and the exact same code becomes a durable, on-disk database.

## 3. Where to go next

The same engine is shipped behind three front-ends, each living in its own top-level directory:

- **`cli/`** — the `oxigraph` command-line tool. It bulk-loads RDF files and runs a SPARQL
  HTTP server (the [SPARQL 1.1 Protocol](https://www.w3.org/TR/sparql11-protocol/) plus a
  YASGUI web UI) — `oxigraph serve --location ./data`. Building it compiles RocksDB from the
  `oxrocksdb-sys/` submodule, so clone with `--recursive`.
- **`python/`** — [`pyoxigraph`](https://pyoxigraph.readthedocs.io/), the Python binding
  (`pip install pyoxigraph`), built with PyO3.
- **`js/`** — the WebAssembly/Node package published to npm as `oxigraph`.

Other useful entry points in the repo:

- **`testsuite/`** — runs the official W3C RDF & SPARQL conformance test suites (Git submodules).
- **`bench/`** — a preliminary benchmark harness; see `bench/README.md`.
- **`fuzz/`** — fuzz targets for the parsers and evaluator.
- **`CHANGELOG.md`** — release history (the workspace is at version 0.5.7).

To work on the core engine, start in `lib/oxigraph/src/store.rs` (the `Store` API you saw
above) and follow the layering down through `spareval`, `spargebra`, and `oxrdf`.

To re-prove everything in this document, re-run `showboat verify WALKTHROUGH.md` — it
re-executes every block above and diffs the captured output against what's recorded here.
