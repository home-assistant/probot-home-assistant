# Code Owners Mention

* Repository: core, home-assistant.io
* Context: issue, PR

## Purpose

Mention and assign the code owners of the integration labels attached to a PR/issue.

## Logic

* Find codeowners for each applied integration label.
* Assign them, except the author, to the PR/issue.
* Post a comment mentioning all codeowners, except the author, not already involved in the PR/issue.
