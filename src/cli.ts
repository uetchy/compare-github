#!/usr/bin/env node
// tslint:disable:no-console

import minimist from 'minimist'
import ora from 'ora'
import { generateTable, getRepositoryDetails } from './util'

async function init(names: string[], enableMarkdown: boolean) {
  if (names.length === 0) {
    console.log('Usage: $ gh-compare vuejs/vue facebook/react')
    throw new Error('no repos given')
  }
  try {
    const repos = await Promise.all(
      Array.from(new Set(names)).map(getRepositoryDetails)
    )
    const result = generateTable(repos, enableMarkdown)
    spinner.info(
      `Compared to ${repos.length} repositor${repos.length > 1 ? 'ies' : 'y'}`
    )
    console.log(result)
  } catch (err) {
    spinner.fail(err)
    throw new Error(err)
  }
}

const argv = minimist(process.argv.slice(2), {
  alias: { markdown: ['md', 'm'] },
  boolean: ['markdown'],
})
const repoFullnames = argv._
const markdownMode = argv.markdown
const spinner = ora.promise(
  init(repoFullnames, markdownMode),
  'Generating comparison'
)
