# Tests run on `node --test`, with no dependencies

This project has no runtime and no build dependencies, and a test suite is the usual place that
changes. Jest or Vitest would each pull in a tree of packages and a config file for a suite that
only needs to call pure functions and compare values. Node's built-in test runner and `node:assert`
cover that completely, so `npm test` works on a clean checkout with no `npm install` at all.

**Requires Node 22 or newer**, not 18. The test script names its files as `node --test
test/*.test.js`, and it is Node's test runner — not the shell — that expands that pattern; cmd.exe
does not glob at all. Runner-side glob support arrived in the Node 22 line, so on Node 18 or 20 the
script silently works on POSIX and fails on Windows. `package.json` carries an `engines.node` entry
saying so. Development happens on Node 24.

## Consequences

No jsdom, so nothing that touches `document` can be tested this way — `HtmlCreator`,
`RandomColorAnimation`, the `Board` constructor and every `display*` method stay uncovered. That is
accepted: all game logic is already pure, and the modules left out are presentation.

Adding DOM coverage later means adding a dependency and revisiting this decision, not working
around it.
