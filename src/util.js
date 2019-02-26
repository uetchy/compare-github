import chalk from 'chalk'
import fetch from 'node-fetch'
import parse from 'date-fns/parse'
import Table from 'cli-table'
import bytes from 'bytes'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import MarkdownTable from 'markdown-table'

export async function getRepositoryDetails(fullname) {
  const res = await fetch(`https://api.github.com/repos/${fullname}`)
  if (parseInt(res.headers.get('x-ratelimit-remaining'), 10) === 0) {
    const resetFrom = new Date(
      parseInt(res.headers.get('x-ratelimit-reset'), 10) * 1000
    )
    throw new Error(
      `Rate limit exceeded. It will be reset in ${distanceInWordsToNow(
        resetFrom
      )}`
    )
  }
  if (res.status === 404) {
    throw new Error(`Repository not found for ${fullname}`)
  }

  const json = await res.json()
  return {
    repository: json.full_name,
    language: json.language,
    created: parse(json.created_at).getTime(),
    updated: parse(json.pushed_at).getTime(),
    stars: json.stargazers_count,
    watches: json.subscribers_count,
    forks: json.forks_count,
    issues: json.open_issues_count, // issues + PRs
    size: json.size,
    owner: json.owner.type,
  }
}

export function generateTable(repos, markdownTable) {
  const contents = Object.keys(repos[0]).map((key) => {
    let values = repos.map((repo) => repo[key])
    if (['stars', 'watches', 'forks', 'issues'].includes(key)) {
      values = injectValues(values, false, !markdownTable)
    } else if (key === 'size') {
      values = injectValues(values, true, !markdownTable, (kb) =>
        bytes(kb * 1024)
      )
    } else if (key === 'updated') {
      values = injectValues(values, false, !markdownTable, distanceInWordsToNow)
    } else if (key === 'created') {
      values = injectValues(values, false, false, distanceInWordsToNow)
    }
    return [capitalize(key), ...values]
  })

  const table = markdownTable ? MarkdownTable(contents) : CLITable(contents)
  return table
}

function CLITable(arr) {
  const table = new Table()
  table.push(...arr)
  return table.toString()
}

function argminmax(arr) {
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

function injectValues(values, minBest = true, color = true, mapper) {
  const { minIdx, maxIdx } = argminmax(values)
  if (mapper) {
    values = values.map(mapper)
  }
  if (color) {
    const minColor = minBest ? chalk.green : chalk.red
    const maxColor = minBest ? chalk.red : chalk.green
    values[minIdx] = minColor(values[minIdx])
    values[maxIdx] = maxColor(values[maxIdx])
  }
  return values
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
