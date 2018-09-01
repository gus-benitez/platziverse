'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
const request = require('request-promise-native')
// Usamos express para generar el enrutador
// usamos asyncify para hacer el wrap de nuestras rutas y darle soporte async-await
const api = asyncify(express.Router())
const {endpoint, apiToken} = require('./config')

// Definimos las rutas
api.get('/agents', async (req, res, next) => {
  const options = {
    method: 'GET',
    url: `${endpoint}/api/agents`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (err) {
    return next(err)
  }

  res.send(result)
})

api.get('/agent/:uuid', async (req, res, next) => {
  const {uuid} = req.params

  const options = {
    method: 'GET',
    url: `${endpoint}/api/agent/${uuid}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (err) {
    return next(err)
  }

  res.send(result)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const {uuid} = req.params

  const options = {
    method: 'GET',
    url: `${endpoint}/api/metrics/${uuid}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (err) {
    return next(err)
  }

  res.send(result)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const {uuid, type} = req.params

  const options = {
    method: 'GET',
    url: `${endpoint}/api/metrics/${uuid}/${type}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`
    },
    json: true
  }

  let result
  try {
    result = await request(options)
  } catch (err) {
    return next(err)
  }

  res.send(result)
})

module.exports = api
