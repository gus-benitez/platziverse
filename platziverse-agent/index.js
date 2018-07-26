'use strict'

const debug = require('debug')('platziverse:agent')
const defaults = require('defaults')
const mqtt = require('mqtt')
const uuid = require('uuid')
const { parsePayload } = require('./utils')
// Obtenemos la clase EventEmitter del paquete events
const EventEmitter = require('events')

const options = { // Opciones por defecto
  name: 'untitled',
  username: 'platzi',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost' // Lugar donde se encuentra el servidor mqtt
  }
}
class PlatziverseAgent extends EventEmitter {
  constructor (opts) {
    super()

    this._options = defaults(opts, options) // Seteamos las opciones definidas.
    this._started = false
    this._timer = null
    this._client = null // Referencia del cliente.
    this._agentId = null // Referencia al agentId.
  }

  connect () {
    if (!this._started) {
      const opts = this._options
      this._started = true
      this._client = mqtt.connect(opts.mqtt.host) // Nos conectamos con el cliente, pasando el host.

      // Nos suscribimos a los mensajes que queremos escuchar.
      this._client.subscribe('agent/message')
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')

      this._client.on('connect', () => {
        this._agentId = uuid.v4() // Generamos el uuid
        this.emit('connected', this._agentId) // Enviamos el agente

        this._timer = setInterval(() => {
          this.emit('agent/message', 'this is a message')
        }, opts.interval)
      })

      this._client.on('message', (topic, payload) => {
        payload = parsePayload(payload)

        let broadcast = false
        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            broadcast = payload && payload.agent && payload.agent.uuid !== this._agentId
            break
        }
        if (broadcast) {
          this.emit(topic, payload)
        }
      })

      // Con eventEmitter hay que manejar el error.
      this._client.on('error', () => this.disconnect())
    }
  }

  disconnect () {
    if (this._started) {
      this._started = false
      clearInterval(this._timer)
      this.emit('disconnected')
    }
  }
}

module.exports = PlatziverseAgent
