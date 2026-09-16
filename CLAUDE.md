# Tic Tac Toe

A browser game in plain JavaScript, no dependencies and no build step. The game logic
(`GameResult`, `Computer`, `Board.writeToBoard`) is DOM-free; everything else is presentation.

Tests: `npm test` from `src/`, running on `node --test` with nothing to install.

## Ubiquitous language

This project's binding terms live in @CONTEXT.md.

**Use them.** In conversation as much as in code, identifiers, commits and
documentation. When you explain or describe something, reach for the canonical
name, not a synonym.

**Code is English.** Without exception: identifiers, types, functions, file
names, comments. Another language belongs only in strings a person reads on
screen. Where a canonical term is not English, its glossary entry carries the
English code name in backticks — use that one, not a translation of your own.
When I ask "what is X called in the code?", the answer is in there.

**If a code name is missing, we decide one.** No term is exempt, product names
and legal terms included. Where no obvious English word exists, put two or
three to me and record the one chosen in the glossary — do not leave the
foreign word standing, and do not quietly translate it yourself.

**Understand mine.** The variants listed under `_Avoid_` mean the same thing —
translate silently and answer canonically. Do not correct me every time I say
one; that belongs in a modelling session, not in everyday work.

**Ask about the unknown.** If I use a term that is neither canonical nor listed
under `_Avoid_`, do not guess. Say it is missing from the glossary and ask —
either an entry is missing, or we are talking about something new.

## Decisions

`docs/decisions/` holds the decisions this project has already made — one file
`NNNN-slug.md` each. They record where this code deliberately departs from the
obvious path.

**The filename is the index.** Run `ls docs/decisions/` to see what exists,
judge by the title, and open only what bears on the task at hand — as a rule
none to two files.

**Never read the whole directory.** It grows without bound. Loading all of it
burns context on decisions unrelated to the task and crowds out what is
actually needed.

**When to look:** before settling an architecture or design question; before
"fixing" something that looks oddly built; when the shape of a place you are
changing surprises you. Not for typos, formatting or obvious bug fixes — there
even the `ls` is pure friction.

**Never disagree silently.** If your proposal runs against a decision, say so
by filename before you act on it. Overturning a decision is a legitimate
outcome; bypassing one is not. Entries marked `superseded` or `deprecated` no
longer bind.
