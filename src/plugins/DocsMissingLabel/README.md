# Docs Missing

* Repository: core (write), home-assistant.io (read)
* Context: PR

## Purpose

Apply a `docs-missing` label to PRs that need to have an associated docs PR, but currently don't have one.

## Logic

* If a PR is labeled in core with `new-integration` or `new-platform`, check if there is a link in the description linking to docs, if not, add `docs-missing` label.
* If a PR is edited in core and it has label `docs-missing` AND (`new-integration` or `new-platform`), check if it has a link to docs, if so, remove `docs-missing`.
* If a PR is opened/edited in docs and it links to a core PR which has `docs-missing` label, remove the `docs-missing` label.
