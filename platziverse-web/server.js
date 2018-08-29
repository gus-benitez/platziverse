'use strict'

const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const http = require('http')
const path = require('path') // Recomendado para hacer operaciones con rutas.
const express = require('express')
const asyncify = require('express-asyncify')
const socketio = require('socket.io')
const PlatziverseAgent = require('platziverse-agent')

const proxy = require('./proxy')
const {pipe} = require('./utils')

const port = process.env.PORT || 8080
const app = asyncify(express())
const server = http.createServer(app)
const io = socketio(server) // Creamos la instancia de Socket.io, pasandole la instancia del Servidor.
const agent = new PlatziverseAgent() // Creamos la instancia del agente

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy) // Montamos proxy en '/', como si fueran rutas nativas de nuestra aplicación.

// Express Error Handler, esto es el middleware de manejos de errores.
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({error: err.message})
  }

  res.status(500).send({error: err.message})
})

// Socket.io / WebSockets
// Cada vez que un cliente se conecte a nuestro servidor de WebSocket, este evento se ejecuta y entrega un socket.
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  pipe(agent, socket)
})

server.listen(port, () => {
  console.log(`${chalk.green('[platziverse-web]')} server listening on port ${port}`)
  // Inicializamos el agente
  agent.connect()
})

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}
// Manejo de errores global de la la aplicación
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
