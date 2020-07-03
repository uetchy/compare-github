import bytes from 'bytes';
import chalk from 'chalk';
import Table from 'cli-table';
import { formatDistanceToNow, parseISO } from 'date-fns';
import MarkdownTable from 'markdown-table';
import fetch from 'node-fetch';

interface Repository {
  repository: string;
  language: string;
  created: number;
  updated: number;
  stars: number;
  watches: number;
  forks: number;
  issues: number;
  size: number;
  owner: string;
}

function argminmax<T>(arr: T[]): { minIdx: number; maxIdx: number } {
  let deltaMin = arr[0];
  let deltaMax = arr[0];
  let deltaMinIdx = 0;
  let deltaMaxIdx = 0;

  arr.forEach((el, idx): void => {
    if (el < deltaMin) {
      deltaMin = el;
      deltaMinIdx = idx;
    }
    if (el > deltaMax) {
      deltaMax = el;
      deltaMaxIdx = idx;
    }
  });

  return { minIdx: deltaMinIdx, maxIdx: deltaMaxIdx };
}

function injectValues<T>(
  values: T[],
  minBest = true,
  color = true,
  mapper?: (value: T) => string,
): string[] {
  const { minIdx, maxIdx } = argminmax<T>(values);
  const result: string[] = mapper ? values.map(mapper) : values.map(String);
  if (color) {
    const minColor = minBest ? chalk.green : chalk.red;
    const maxColor = minBest ? chalk.red : chalk.green;
    result[minIdx] = minColor(result[minIdx]);
    result[maxIdx] = maxColor(result[maxIdx]);
  }
  return result;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function getRepositoryDetails(
  fullname: string,
): Promise<Repository> {
  const res = await fetch(`https://api.github.com/repos/${fullname}`);
  if (parseInt(res.headers.get('x-ratelimit-remaining') as string, 10) === 0) {
    const resetFrom = new Date(
      parseInt(res.headers.get('x-ratelimit-reset') as string, 10) * 1000,
    );
    throw new Error(
      `Rate limit exceeded. It will be reset in ${formatDistanceToNow(
        resetFrom,
      )}`,
    );
  }
  if (res.status === 404) {
    throw new Error(`Repository not found for ${fullname}`);
  }

  const json = await res.json();

  // tslint:disable:object-literal-sort-keys
  return {
    repository: json.full_name,
    language: json.language,
    stars: json.stargazers_count,
    issues: json.open_issues_count, // issues + PRs
    forks: json.forks_count,
    watches: json.subscribers_count,
    size: json.size,
    updated: parseISO(json.pushed_at).getTime(),
    created: parseISO(json.created_at).getTime(),
    owner: json.owner.type,
  };
  // tslint:enable:object-literal-sort-keys
}

function CLITable(arr: unknown[]): string {
  const table = new Table();
  table.push(...arr);
  return table.toString();
}

export function generateTable(
  repos: Repository[],
  markdownMode: boolean,
): string {
  const keys = Object.keys(repos[0]) as (keyof Repository)[];
  const contents = keys.map((propKey: keyof Repository): string[] => {
    const extractedValues: Repository[typeof propKey][] = repos.map(
      (repo): Repository[typeof propKey] => repo[propKey],
    );

    let result: string[] = [];
    if (['stars', 'watches', 'forks', 'issues'].includes(propKey)) {
      result = injectValues(extractedValues, false, !markdownMode);
    } else if (propKey === 'size') {
      result = injectValues(
        extractedValues as number[],
        true,
        !markdownMode,
        (kb: number): string => bytes(kb * 1024),
      );
    } else if (propKey === 'updated') {
      result = injectValues(
        extractedValues as number[],
        false,
        !markdownMode,
        formatDistanceToNow,
      );
    } else if (propKey === 'created') {
      result = injectValues(
        extractedValues as number[],
        false,
        false,
        formatDistanceToNow,
      );
    } else {
      result = extractedValues as string[];
    }
    return [capitalize(propKey), ...result];
  });

  const table = markdownMode ? MarkdownTable(contents) : CLITable(contents);
  return table;
}
