# Cube.js GitHub Actions

> Cube.js GitHub Actions to automate things

## Author Detector

> Add label for core team and community members

Example of usage:

```yml
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

# LICENSE
