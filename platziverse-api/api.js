'use-strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const {AgentNotFoundError, MetricsNotFoundError} = require('./custom-error')
const db = require('platziverse-db')
const getConfig = require('../platziverse-db/lib/config')

const api = express.Router() // Creamos una instancia de la Clase Router de Express

let services, Agent, Metric

// Usamos un middleware de intersección. Se ejecuta cada vez que se haga una petición.
api.use('*', async (req, res, next) => { // '*' significa para todas las rutas.
  // Este middleware se usa para obtener la conexión a la Base de Datos, solo una única vez
  if (!services) {
    debug('Connecting to database')
    try {
      const config = getConfig({
        logging: s => debug(s)
      })
      services = await db(config)
    } catch (err) {
      return next(err) // El error le pasamos al manejador de errores de Express
    }
    Agent = services.Agent
    Metric = services.Metric
  }
  next() // Indica que tiene que se continúa la ejecución.
})

// Definimos las rutas
// Retorna los agentes conectados en nuestro servidor
api.get('/agents', async (req, res, next) => {
  debug('A request has come to /agents')

  let agents = []
  try {
    agents = await Agent.findConnected()
  } catch (err) {
    return next(err)
  }

  res.send(agents)
})

// Retorna un agente en particular
api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`Request has come to /agents/${uuid}`)

  let agent // indica que es indefinido
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (err) {
    return next(err)
  }

  if (!agent) {
    // return next(new Error('Agent not found'))
    const errorAgent = new AgentNotFoundError(uuid)
    return next(errorAgent)
  }

  res.send(agent) // Respondemos con el Agente
})

// Retorna que metricas tiene reportadas un agente específico
api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`Request has come to /metrics/${uuid}`)

  let metricTypes = []
  try {
    metricTypes = await Metric.findTypeByAgentUuid(uuid)
  } catch (err) {
    return next(err)
  }

  if (!metricTypes || metricTypes.length === 0) {
    return next(new Error(`Metrics not found for agent ${uuid}`))
  }

  res.send(metricTypes)
})

// De un agente específico, traigame todas las métricas con un tipo en particular
api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params
  debug(`Request has come to /metrics/${uuid}/${type}`)

  let metrics = []
  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (err) {
    return next(err)
  }

  if (!metrics || metrics.length === 0) {
    const errormetrics = new MetricsNotFoundError(uuid, type)
    return next(errormetrics)
  }

  res.send(metrics)
})

module.exports = api
