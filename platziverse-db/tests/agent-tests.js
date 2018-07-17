'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyequire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () {}
}

let metricStub = {
  belongsTo: sinon.spy()
}
let single = Object.assign({}, agentFixtures.single)
let id = 1
let uuid = 'yyy-yyy-yyy'
let agentStub = null
let db = null
let sandbox = null

let uuidArgs = {
  where: {
    uuid
  }
}
let connectedArgs = {
  where: {
    connected: true
  }
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  agentStub = {
    hasMany: sandbox.spy()
  }

  // Model findById Stub
  agentStub.findById = sandbox.stub()
  agentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.ById(id)))
  // Model findOne Stub
  agentStub.findOne = sandbox.stub()
  agentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  // Model findAll Stub
  agentStub.findAll = sandbox.stub()
  agentStub.findAll.returns(Promise.resolve(agentFixtures.all))
  // Model findAll Stub, for the function findConnected
  agentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  // Model update Stub
  agentStub.update = sandbox.stub()
  agentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  const setupDatabase = proxyequire('../', {
    './models/agent': () => agentStub,
    './models/metric': () => metricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => sandbox && sandbox.restore())

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', t => {
  t.true(agentStub.hasMany.called, 'agentModel.hasMany was executed')
  t.true(agentStub.hasMany.calledWith(metricStub), 'Argument should be the metricModel')
  t.true(metricStub.belongsTo.called, 'metricModel.belongsTo was executed')
  t.true(metricStub.belongsTo.calledWith(agentStub), 'Argument should be the agentModel')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)

  t.true(agentStub.findById.called, 'findById should be called on model')
  t.true(agentStub.findById.calledOnce, 'findById should be called once')
  t.true(agentStub.findById.calledWith(id), 'findById should be called with specified id')

  t.deepEqual(agent, agentFixtures.ById(id), 'It should be the same in search by id')
})

test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)
  t.true(agentStub.findOne.called, 'findOne should be called on model')
  t.true(agentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(agentStub.findOne.calledWith(uuidArgs), 'findOne should be called with specified uuid')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'It should be the same in search by uuid')
})

test.serial('Agent#findAll', async t => {
  let agent = await db.Agent.findAll()
  t.true(agentStub.findAll.called, 'findAll should be called on model')
  t.true(agentStub.findAll.calledOnce, 'findAll should be called once')

  t.deepEqual(agent, agentFixtures.all, 'It should be the same in search by all')
})

test.serial('Agent#findConnected', async t => {
  let agent = await db.Agent.findConnected()
  t.true(agentStub.findAll.called, 'findAll should be called on model')
  t.true(agentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(agentStub.findAll.calledWith(connectedArgs), 'findAll should be called with specified connected True')

  t.deepEqual(agent, agentFixtures.connected, 'It should be the same in search of connected')
})

test.serial('Agent#createOrUpdate - exists', async t => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(agentStub.findOne.called, 'findOne should be called on model')
  t.true(agentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(agentStub.update.calledOnce, 'update should be called once')

  t.deepEqual(agent, single, 'Agent should be the same')
})
