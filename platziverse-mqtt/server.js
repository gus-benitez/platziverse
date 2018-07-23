'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db')

const { parsePayload } = require('./utils')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}
const settings = {
  port: 1883,
  backend
}
const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

const server = new mosca.Server(settings)
const clients = new Map()

let Agent, Metric

server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)
  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[platziverse-mqtt]')} Server is running`)
})

// Evento que indica cuando un cliente mqtt se Conecta al servidor.
server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

// Evento que indica cuando un cliente mqtt se Desconecta al servidor.
server.on('clientDisconnected', client => {
  debug(`Client Disconnected: ${client.id}`)
})

// Evento que indica que hay un mensaje publicado en nuestro servidor.
// packet, es el paquete recibido / client, es el cliente que lo envió
server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`) // Topic, es el tipo de mensaje (agent/connected, agent/disconnected, agent/message).
  debug(`Payload: ${packet.payload}`) // Payload, es la información.

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      break
    case 'agent/message':
      const payload = parsePayload(packet.payload)
      if (payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (err) {
          return handleError(err)
        }
        debug(`Agent ${agent.uuid} saved`)

        // Notify Agent is Connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)

          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })

          })
        }
      }
      break
    default:
      debug(`Unknown packet.topic: ${packet.topic}`)
  }
})

server.on('error', handleFatalError)

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}
function handleError (err) {
  console.error(`${chalk.red('[Error]')} ${err.message}`)
  console.error(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
