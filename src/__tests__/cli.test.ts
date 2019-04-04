import nock from 'nock'
import * as util from '../util'

it('getRepositoryDetails', async () => {
  nock.disableNetConnect()
  nock('https://api.github.com')
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
  nock('https://api.github.com')
    .get('/repos/facebook/react')
    .replyWithFile(200, __dirname + '/fixtures/react.json')
    .get('/repos/vuejs/vue')
    .replyWithFile(200, __dirname + '/fixtures/vue.json')

  const repos = await Promise.all(
    Array.from(['facebook/react', 'vuejs/vue']).map(util.getRepositoryDetails)
  )
  const table = util.generateTable(repos, true)
  expect(table).toContain('| Repository | facebook/react | vuejs/vue')
  expect(table).toContain('137.22MB       | 26.21MB')
})
