#!/usr/bin/env node

const { argv } = require('yargs')
const Table = require('cli-table')
const chalk = require('chalk')
const ora = require('ora')
const bytes = require('bytes')
const fetch = require('node-fetch')
const parse = require('date-fns/parse')
const distanceInWordsToNow = require('date-fns/distance_in_words_to_now')

const getRepositoryDetails = fullname => {
  const url = `https://api.github.com/repos/${fullname}`
  return fetch(url)
    .then(res => {
      if (parseInt(res.headers.get('x-ratelimit-remaining'), 10) == 0) {
        const resetFrom = new Date(
          parseInt(res.headers.get('x-ratelimit-reset'), 10) * 1000
        )
        return Promise.reject(
          `Rate limit exceeded. It will be reset in ${distanceInWordsToNow(
            resetFrom
          )}`
        )
      }
      if (res.status === 404) {
        throw new Error(`Repository not found for ${fullname}`)
      }
      return res.json()
    })
    .then(json => ({
      fullname: json.full_name,
      language: json.language,
      created: parse(json.created_at).getTime(),
      updated: parse(json.pushed_at).getTime(),
      stars: json.stargazers_count,
      watches: json.subscribers_count,
      forks: json.forks_count,
      issues: json.open_issues_count, // issues + PRs
      size: json.size,
      owner: json.owner.type,
    }))
}

const argminmax = arr => {
  let deltaMin = arr[0]
  let deltaMax = arr[0]
  let deltaMinIdx = 0
  let deltaMaxIdx = 0
  arr.forEach((el, idx) => {
    if (el < deltaMin) {
      deltaMin = el
      deltaMinIdx = idx
    }
    if (el > deltaMax) {
      deltaMax = el
      deltaMaxIdx = idx
    }
  })
  return { minIdx: deltaMinIdx, maxIdx: deltaMaxIdx }
}

const printResult = repos => {
  const table = new Table()
  const keys = Object.keys(repos[0])

  keys.forEach(key => {
    let values = repos.map(repo => repo[key])
    if (['stars', 'watches', 'forks', 'issues'].includes(key)) {
      const minmax = argminmax(values)
      values[minmax.maxIdx] = chalk.green(values[minmax.maxIdx])
      values[minmax.minIdx] = chalk.red(values[minmax.minIdx])
    }
    if (['size'].includes(key)) {
      const minmax = argminmax(values)
      values = values.map(kb => bytes(kb * 1024))
      values[minmax.minIdx] = chalk.green(values[minmax.minIdx])
      values[minmax.maxIdx] = chalk.red(values[minmax.maxIdx])
    }
    if (['updated'].includes(key)) {
      const minmax = argminmax(values)
      values = values.map(distanceInWordsToNow)
      values[minmax.maxIdx] = chalk.green(values[minmax.maxIdx])
      values[minmax.minIdx] = chalk.red(values[minmax.minIdx])
    }
    if (['created'].includes(key)) {
      values = values.map(distanceInWordsToNow)
    }

    table.push({ [key]: values })
  })

  spinner.info(
    `Compared to ${repos.length} repositor${repos.length > 1 ? 'ies' : 'y'}`
  )
  console.log(table.toString())
}

const repoFullnames = argv._

const init = () => {
  if (repoFullnames.length == 0) {
    console.log('Usage: $ gh-compare vuejs/vue facebook/react')
    return Promise.reject('Give repo name')
  }
  return Promise.all(
    Array.from(new Set(repoFullnames)).map(getRepositoryDetails)
  )

    .then(printResult)
    .catch(err => {
      spinner.fail(err)
      return Promise.reject(err)
    })
}

const spinner = ora.promise(init(), 'Generating comparison')
