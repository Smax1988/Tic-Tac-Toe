# `package.json` stays in `src/`, and tests are listed explicitly

The manifest sits at `src/package.json`, not at the repository root, because it describes the
publishable game module — `src/` is the package. Moving it up would be the conventional layout and
would let `npm test` run from the root, but it changes what `npm publish` packs, which is not worth
disturbing for a test suite. `npm test` therefore runs from `src/`, and the tests live in
`src/test/`.

The test script names its files explicitly: `node --test test/*.test.js`. Bare `node --test` treats
**every** `.js` file under a `test/` directory as a test file regardless of its name, so the shared
`helpers.js` would be executed and counted as a passing test file — and any top-level error in it
would fail the suite for the wrong reason.

## Consequences

Anything that needs to run from the repository root — a CI step, a git hook — has to change
directory into `src/` first.

New test files must match `*.test.js` to be picked up. A file named otherwise is silently not run,
which is the trade for keeping `helpers.js` out of the results.
