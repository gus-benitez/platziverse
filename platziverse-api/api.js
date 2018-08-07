'use-strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const {AgentNotFoundError, MetricsNotFoundError, NotAuthorizedError, NotAuthenticatedError} = require('./custom-error')

const api = express.Router() // Creamos una instancia de la Clase Router de Express

// Definimos las rutas
// Retorna los agentes conectados en nuestro servidor
api.get('/agents', (req, res) => {
  debug('A request has come to /agents')
  res.send({}) // Envíamos como respuesta un objeto vacio
})

// Retorna un agente en particular
api.get('/agent/:uuid', (req, res, next) => {
  const { uuid } = req.params

  // Ejemplo para forzar el error
  if (uuid !== 'yyy') {
    // return next(new Error('Agent not found'))
    const errorAgent = new AgentNotFoundError(uuid)
    return next(errorAgent)
  }

  res.send({ uuid }) // Respondemos con el uuid que obtuvimos
})

// Retorna que metricas tiene reportadas un agente específico
api.get('/metrics/:uuid', (req, res) => {
  const { uuid } = req.params
  res.send({uuid}) // Respondemos con el uuid que obtuvimos
})

// De un agente específico, traigame todas las métricas con un tipo en particular
api.get('/metrics/:uuid/:type', (req, res) => {
  const { uuid, type } = req.params
  res.send({uuid, type}) // Respondemos con el uuid y type que obtuvimos
})

module.exports = api
