# Docs Parenting

* Repository: home-assistant.io (write), all others (read)
* Context: PR

## Purpose

The goal for this bot is to keep track whether documentation PRs have related PRs. This is done by managing the labels `has-parent` and `parent-merged"` on PRs in the home-assistant.io repository.

## Logic

* For PRs against non-docs repositories, if there are up to 2 links to docs PRs in a new or updated PR description, we will add the `has-parent` label to the linked docs PRs.
* If a docs PR is opened or the description is updated, and the description links to PRs for non-docs repositories within the Home Assistant organization, add the `has-parent` label.
* If a parent PR changes state to:
  - `merged`: the docs PR will get label `parent-merged`
  - `closed`: the docs PR will be closed
  - `open`: make sure the docs PR is re-opened
