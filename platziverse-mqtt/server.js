'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}
const settings = {
  port: 1883,
  backend
}

const server = new mosca.Server(settings)

server.on('ready', () => {
  console.log(`${chalk.green('[platziverse-mqtt]')} Server is running`)
})
// Evento que indica cuando un cliente mqtt se Conecta al servidor.
server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
})
// Evento que indica cuando un cliente mqtt se Desconecta al servidor.
server.on('clientDisconnected', client => {
  debug(`Client Disconnected: ${client.id}`)
})
// Evento que indica que hay un mensaje publicado en nuestro servidor.
// packet, es el paquete recibido / client, es el cliente que lo envió
server.on('published', (packet, client) => {
  debug(`Received: ${packet.topic}`) // Topic, es el tipo de mensaje (agent/connected, agent/disconnected, agent/message).
  debug(`Payload: ${packet.payload}`) // Payload, es la información.
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
