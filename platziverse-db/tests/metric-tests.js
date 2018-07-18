'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyequire = require('proxyquire')
const metricFixtures = require('./fixtures/metric')

let config = {
  logging: function () {}
}

let agentStub = {
  hasMany: sinon.spy()
}
let uuid = 'yyy-yyy-yyy'
let type = 'Type BBB'
let metricStub = null
let db = null
let sandbox = null

let agentArgs = {
  attributes: [ 'type' ],
  group: [ 'type' ],
  include: [{
    attributes: [],
    model: agentStub,
    where: { uuid }
  }],
  raw: true
}
let typeAgentArgs = {
  attributes: [ 'id', 'type', 'value', 'createdAt' ],
  where: { type },
  limit: 20,
  order: [[ 'createdAt', 'DESC' ]],
  include: [{
    attributes: [],
    model: agentStub,
    where: { uuid }
  }],
  raw: true
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  metricStub = {
    belongsTo: sandbox.spy()
  }

  // Model findAll Stub
  metricStub.findAll = sandbox.stub()
  metricStub.findAll.withArgs(agentArgs).returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)))
  metricStub.findAll.withArgs(typeAgentArgs).returns(Promise.resolve(metricFixtures.ByTypeAgentUuid(type, uuid)))

  const setupDatabase = proxyequire('../', {
    './models/agent': () => agentStub,
    './models/metric': () => metricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => sandbox && sandbox.restore())

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('SetupMetric', t => {
  t.true(agentStub.hasMany.called, 'agentModel.hasMany was executed')
  t.true(agentStub.hasMany.calledWith(metricStub), 'Argument should be the metricModel')
  t.true(metricStub.belongsTo.called, 'metricModel.belongsTo was executed')
  t.true(metricStub.belongsTo.calledWith(agentStub), 'Argument should be the agentModel')
})

test.serial('Metric#findTypeByAgentUuid', async t => {
  let metric = await db.Metric.findTypeByAgentUuid(uuid)

  t.true(metricStub.findAll.called, 'findAll should be called on model')
  t.true(metricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(metricStub.findAll.calledWith(agentArgs), 'findAll should be called with specified agentArgs')

  t.deepEqual(metric, metricFixtures.byAgentUuid(uuid), 'It should be the same in search by uuid')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  let metric = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(metricStub.findAll.called, 'findAll should be called on model')
  t.true(metricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(metricStub.findAll.calledWith(typeAgentArgs), 'findAll should be called with specified typeAgentArgs')

  t.deepEqual(metric, metricFixtures.ByTypeAgentUuid(type, uuid), 'It should be the same in search by type,uuid')
})
