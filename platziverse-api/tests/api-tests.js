'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')
const {AgentNotFoundError} = require('../custom-error')

let sandbox = null // sandbox es un ambiente específico de Sinon
let server = null
let dbStub = null // Stub del objeto de base de datos
let AgentStub = {}
let MetricStub = {}
let uuid = 'yyy-yyy-yyy'
let uuidNotFound = 'zzz'
const errorAgent = new AgentNotFoundError(uuidNotFound)

test.beforeEach(async () => {
  sandbox = sinon.createSandbox() // Creamos el sandbox (Ambiente específico de Sinon).

  // Stub de base de datos.
  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  MetricStub.findTypeByAgentUuid = sandbox.stub()
  MetricStub.findTypeByAgentUuid.withArgs(uuid).returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)))

  const api = proxyquire('../api', {
    'platziverse-db': dbStub // Cada vez que se requiera 'platziverse-db', se debe retornar dbStub
  })
  server = proxyquire('../server', {
    './api': api // Cuando se requiera 'api', se debe retornar el api que contiene dbStub
  })
})

// recreamos el sandbox, cada vez que ejecutamos el test.
test.afterEach(() => sandbox && sandbox.restore())

// 'cb' significa callback, se lo usa porque supertest usa callback.
// Si fuera async await, no se usa 'cb'
test.serial.cb('/api/agents', t => {
  // A la fcion de supertest(request), le pasamos una instancia del Servidor.
  // Y le aplicamos métodos encadenados...
  request(server)
    .get('/api/agents') // Hacemos una peticion a la ruta '/api/agents'
    .expect(200) // Espero que esto retorne 200 (exitoso)
    .expect('Content-Type', /json/) // Espero que el tipo de contenido sea JSON
    .end((err, res) => { // Esta sección es cuando termine, hago mas validaciones
      t.falsy(err, 'Should not return an error') // No debe haber un error, el error debe ser falso
      let body = JSON.stringify(res.body) // Obtenemos el body de la respuesta y lo llevamos a String
      let expected = JSON.stringify(agentFixtures.connected)
      t.deepEqual(body, expected, 'Response body should be the expected')
      t.end() // Indica que la prueba terminó. Esto solo se usa para 'cb' callback
    })
})

test.serial.cb('/api/agent/:uuid', t => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(agentFixtures.byUuid(uuid))
      t.deepEqual(body, expected, 'Response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid - not found', t => {
  request(server)
    .get(`/api/agent/${uuidNotFound}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        console.log(err)
      }
      t.truthy(res.body.error, 'Should return an error')
      t.regex(res.body.error, /not found/, 'Error should contains not found')
      let body = JSON.stringify(res.body.error)
      let expected = JSON.stringify(errorAgent.message)
      t.deepEqual(body, expected, 'Response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(metricFixtures.byAgentUuid(uuid))
      t.deepEqual(body, expected, 'Response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid - not found', t => {
  request(server)
    .get(`/api/metrics/${uuidNotFound}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        console.log(err)
      }
      t.truthy(res.body.error, 'Should return an error')
      t.regex(res.body.error, /not found/, 'Error should contains not found')
      t.end()
    })
})

test.serial.todo('api/metrics/:uuid/:type')
test.serial.todo('api/metrics/:uuid/:type - not found')
