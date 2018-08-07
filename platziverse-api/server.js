'use-strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')
const debug = require('debug')('platziverse:api')

const api = require('./api')

const port = process.env.PORT || 3000
const app = express() // Creamos una aplicación de express
const server = http.createServer(app) // Creamos una instancia del servidor http, pasando la aplicación de express app.

app.use('/api', api)

// Express Error Handler, esto es el middleware de manejos de errores.
// Argumentos que recibe err(error), req(request), res(response), next()
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  // Si el mensaje de error contiene 'not found', devolvemos (404), con el mensaje de error.
  if (err.message.match(/not found/)) {
    return res.status(404).send({error: err.message})
  }

  // Si llega un error, devolvemos un server error (500), y devovemos un json con el mensaje de error.
  res.status(500).send({error: err.message})
})

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

if (!module.parent) {
  // Si no es un módulo padre, lanzamos el servidor.
  // O sea si no es requerido server.js, ingresa por esta sección.

  // Manejo de errores global de la la aplicación
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[platziverse-api]')} Server listening on port ${port}`)
  })
}

module.exports = server
