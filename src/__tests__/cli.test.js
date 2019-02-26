import nock from 'nock'
import * as util from '../util'

it('getRepositoryDetails', async () => {
  nock.disableNetConnect()
  const scope = nock('https://api.github.com')
    .get('/repos/facebook/react')
    .replyWithFile(200, __dirname + '/fixtures/react.json')
    .get('/repos/vuejs/vue')
    .replyWithFile(200, __dirname + '/fixtures/vue.json')

  expect((await util.getRepositoryDetails('facebook/react')).repository).toBe(
    'facebook/react'
  )
  expect((await util.getRepositoryDetails('vuejs/vue')).repository).toBe(
    'vuejs/vue'
  )
})

it('generateTable', async () => {
  nock.disableNetConnect()
  const scope = nock('https://api.github.com')
    .get('/repos/facebook/react')
    .replyWithFile(200, __dirname + '/fixtures/react.json')
    .get('/repos/vuejs/vue')
    .replyWithFile(200, __dirname + '/fixtures/vue.json')

  const fixture = `| Repository | facebook/react | vuejs/vue     |
| ---------- | -------------- | ------------- |
| Language   | JavaScript     | JavaScript    |
| Created    | almost 6 years | over 5 years  |
| Updated    | about 7 hours  | about 4 hours |
| Stars      | 123178         | 128899        |
| Watches    | 6636           | 5781          |
| Forks      | 22348          | 18376         |
| Issues     | 542            | 237           |
| Size       | 137.22MB       | 26.21MB       |
| Owner      | Organization   | Organization  |`
  const repos = await Promise.all(
    Array.from(['facebook/react', 'vuejs/vue']).map(util.getRepositoryDetails)
  )
  const table = util.generateTable(repos, true)
  expect(table).toBe(fixture)
})
