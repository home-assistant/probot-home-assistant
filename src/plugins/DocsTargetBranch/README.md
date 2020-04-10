# Docs Target Branch

Repositories: home-assistant.io

The goal of this bot is to determine if the documentation PRs have the correct target branch.

## Implemented Rules

<!-- https://github.com/home-assistant/probot-home-assistant/issues/6 -->

- When a PR on the repo `home-assistant/home-assistant.io` is edited or created and (now) contains a reference to a parent PR in any of the `home-assistant/*` repositories, ensure it is targeted against the `next` branch, if not:
  - Add the `needs-rebase` label
  - Add the `in-progress` label
  - Assign the PR author
  - Leave the user a message:
    > It seems that this PR is targeted against an incorrect branch since it has a parent PR on one of our codebases. Documentation that needs to be updated for an upcoming release should target the `next` branch. Please change the target branch of this PR to `next` and rebase if needed.
- When a PR on the repo `home-assistant/home-assistant.io` is edited or created and (now) does not have a reference to a parent PR in any of the `home-assistant/*` repositories, ensure it is targeted against the `current` branch, if not:

  - Add the needs-rebase label
  - Add the in-progress label
  - Assign the PR author
  - Leave the user a message:
    > It seems that this PR is targeted against an incorrect branch. Documentation updates which apply to our current stable release should target the `current` branch. Please change the target branch of this PR to `current` and rebase if needed. If this is documentation for a new feature, please add a link to that PR in your description.

**Links for the following repositories does not count:**

- brands
- developers.home-assistant
