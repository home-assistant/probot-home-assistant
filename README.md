# Probot app to do Home Assistant things

## Installation

- Go to https://github.com/organizations/home-assistant/settings/apps and create new GitHub app
- Generate Webhook secret by running `openssl rand -base64 32` and fill in on the form.
- Create the app
- Download the private key and put in the root, name it `github-app-probot-home-assistant-key.pem`
- Copy `config.yml.template` to `config.yml` and enter the app ID and webhook secret.
- Deploy this repo with `yarn deploy` and get a HTTP url
- Update GitHub app to set HTTP url to the deployed url
- Install the GitHub app

## Permissions

- Issues: Read & write
- Pull requests: Read & write
- Single file: Read-only, `CODEOWNERS`
- Commit statuses: Read & Write
- Organizaiton memebers: Read only

## Subscribe to events

- Issue comment
- Issues
- Label
- Milestone
- Pull request review
- Pull request
- Pull request review comment
- Status
