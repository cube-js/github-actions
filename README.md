# Cube.js GitHub Actions

> Cube.js GitHub Actions to automate things

## Author Detector

> Label issues/prs with labels for core team and community members

## Configuration

| Name              | Description                      | Default                |
|-------------------|----------------------------------|------------------------|
| coreLabel         | Label name for core authors      | core team              |
| addCoreLabel      | Label for for core authors?      | true                   |
| communityLabel    | Label name for community authors | community contribution |
| addCommunityLabel | Label for community authors?     | true                   |

## Supported events:

- issues
- pull_request_target
- pull_request
  
Example of usage:

```yml
name: Detect author for Issues & PRs
on:
  issues:
    types: [opened]
  pull_request_target:
    types: [opened]
  pull_request:
    types: [opened]

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Actions
        uses: actions/checkout@v2
        with:
          repository: 'cube-js/github-actions'
          path: ./actions
          ref: main
      - name: Install Actions
        run: npm install --production --prefix ./actions
      - name: Detect author
        uses: ./actions/author-detector
        with:
          token: ${{secrets.GITHUB_TOKEN}}
          coreLabel: pr:core
          communityLabel: pr:community
```

