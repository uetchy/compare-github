import bytes from 'bytes'
import chalk from 'chalk'
import Table from 'cli-table'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import parse from 'date-fns/parse'
import MarkdownTable from 'markdown-table'
import fetch from 'node-fetch'

interface IRepo {
  repository: string
  language: string
  created: number
  updated: number
  stars: string
  watches: string
  forks: string
  issues: string
  size: string
  owner: string
  [index: string]: any
}

export async function getRepositoryDetails(fullname: string): Promise<IRepo> {
  const res = await fetch(`https://api.github.com/repos/${fullname}`)
  if (parseInt(res.headers.get('x-ratelimit-remaining') as string, 10) === 0) {
    const resetFrom = new Date(
      parseInt(res.headers.get('x-ratelimit-reset') as string, 10) * 1000
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
    created: parse(json.created_at).getTime(),
    forks: json.forks_count,
    issues: json.open_issues_count, // issues + PRs
    language: json.language,
    owner: json.owner.type,
    repository: json.full_name,
    size: json.size,
    stars: json.stargazers_count,
    updated: parse(json.pushed_at).getTime(),
    watches: json.subscribers_count,
  }
}

export function generateTable(repos: IRepo[], markdownTable: boolean) {
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

function CLITable(arr: any[]) {
  const table = new Table()
  table.push(...arr)
  return table.toString()
}

function argminmax(arr: number[]) {
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

function injectValues(
  values: any[],
  minBest = true,
  color = true,
  mapper?: (value: any) => any
) {
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

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
