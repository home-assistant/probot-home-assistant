# Docs Parenting

Repositories: \*

The goal fo this bot is to keep track if documentation PRs have related PRs. This is done by managing the labels "has-parent" and "parent-merged" labels on PRs in the `home-assistant.io` repository.

## Implemented Rules

- PRs against non-HA repo's, if there are up to 2 links to doc PRs in a new or updated PR description, we will add the `has-parent` label to the linked doc PRs.
- If a doc PRs is opened or the description is updated, and the description links to PRs to non-doc repositories within the Home Assistant organization, add the `has-parent` label.
