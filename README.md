# compare-github

[![Build Status](https://travis-ci.com/uetchy/compare-github.svg?branch=master)](https://travis-ci.org/uetchy/compare-github)
[![Coverage Status](https://coveralls.io/repos/github/uetchy/compare-github/badge.svg?branch=master)](https://coveralls.io/github/uetchy/compare-github?branch=master)

Compare GitHub repositories in terminal.

![](https://raw.githubusercontent.com/uetchy/compare-github/gh-pages/screencast.gif)

## Install

```shell
npm install --global @compare/github
```

## Usage

```shell
compare-github vuejs/vue facebook/react
```

```shell
ℹ Compared to 2 repositories
┌────────────┬────────────────┬────────────────┐
│ Repository │ vuejs/vue      │ facebook/react │
├────────────┼────────────────┼────────────────┤
│ Language   │ JavaScript     │ JavaScript     │
├────────────┼────────────────┼────────────────┤
│ Created    │ over 5 years   │ over 5 years   │
├────────────┼────────────────┼────────────────┤
│ Updated    │ about 13 hours │ about 15 hours │
├────────────┼────────────────┼────────────────┤
│ Stars      │ 128024         │ 122485         │
├────────────┼────────────────┼────────────────┤
│ Watches    │ 5783           │ 6644           │
├────────────┼────────────────┼────────────────┤
│ Forks      │ 18232          │ 22202          │
├────────────┼────────────────┼────────────────┤
│ Issues     │ 227            │ 541            │
├────────────┼────────────────┼────────────────┤
│ Size       │ 26.13MB        │ 137.09MB       │
├────────────┼────────────────┼────────────────┤
│ Owner      │ Organization   │ Organization   │
└────────────┴────────────────┴────────────────┘
✔ Generating comparison
```

with markdown table:

```shell
compare-github vuejs/vue facebook/react --markdown
```

```shell
ℹ Compared to 2 repositories
| Repository | vuejs/vue      | facebook/react |
| ---------- | -------------- | -------------- |
| Language   | JavaScript     | JavaScript     |
| Created    | over 5 years   | over 5 years   |
| Updated    | about 13 hours | about 15 hours |
| Stars      | 128024         | 122485         |
| Watches    | 5783           | 6644           |
| Forks      | 18232          | 22202          |
| Issues     | 227            | 541            |
| Size       | 26.13MB        | 137.09MB       |
| Owner      | Organization   | Organization   |
✔ Generating comparison
```

| Repository | vuejs/vue      | facebook/react |
| ---------- | -------------- | -------------- |
| Language   | JavaScript     | JavaScript     |
| Created    | over 5 years   | over 5 years   |
| Updated    | about 13 hours | about 15 hours |
| Stars      | 128024         | 122485         |
| Watches    | 5783           | 6644           |
| Forks      | 18232          | 22202          |
| Issues     | 227            | 541            |
| Size       | 26.13MB        | 137.09MB       |
| Owner      | Organization   | Organization   |

# Contribution

PRs are accepted.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
