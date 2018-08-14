'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')

let sandbox = null // sandbox es un ambiente específico de Sinon
let server = null
let dbStub = null // Stub del objeto de base de datos
let AgentStub = {}
let MetricStub = {}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox() // Creamos el sandbox (Ambiente específico de Sinon).

  // Stub de base de datos.
  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))
  // Stub de base de datos.
  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

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

test.serial.todo('api/agent/:uuid')
test.serial.todo('api/agent/:uuid - not found')

test.serial.todo('api/metrics/:uuid')
test.serial.todo('api/metrics/:uuid - not found')

test.serial.todo('api/metrics/:uuid/:type')
test.serial.todo('api/metrics/:uuid/:type - not found')
