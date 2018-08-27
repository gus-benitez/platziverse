'use strict'

const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const http = require('http')
const path = require('path') // Recomendado para hacer operaciones con rutas.
const express = require('express')
const socketio = require('socket.io')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const io = socketio(server) // Creamos la instancia de Socket.io, pasandole la instancia del Servidor.

app.use(express.static(path.join(__dirname, 'public')))

// Socket.io / WebSockets
// Cada vez que un cliente se conecte a nuestro servidor de WebSocket, este evento se ejecuta y entrega un socket.
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  socket.on('agent/message', payload => {
    console.log(payload)
  })

  setInterval(() => {
    socket.emit('agent/message', {agent: 'xxx-yyy'})
  }, 2000)
})

server.listen(port, () => {
  console.log(`${chalk.green('[platziverse-web]')} server listening on port ${port}`)
})

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}
// Manejo de errores global de la la aplicación
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
