'use strict'

const debug = require('debug')('platziverse:agent')
const os = require('os')
const util = require('util')
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
    this._clientMqtt = null // Referencia del cliente mqtt.
    this._agentId = null // Referencia al agentId.
    this._metrics = new Map() // Almacenamos el nombre de la metrica y la funcion con la que obtenemos el valor
  }

  addMetric (type, fn) {
    this._metrics.set(type, fn)
  }
  removeMetric (type) {
    this._metrics.delete(type)
  }

  connect () {
    if (!this._started) {
      const opts = this._options
      this._started = true
      this._clientMqtt = mqtt.connect(opts.mqtt.host) // Nos conectamos con el cliente mqtt, pasando el host.

      // Nos suscribimos a los mensajes que queremos escuchar.
      this._clientMqtt.subscribe('agent/connected')
      this._clientMqtt.subscribe('agent/disconnected')
      this._clientMqtt.subscribe('agent/message')

      // El cliente mqtt se conecte exitosamente al servidor Mqtt.
      this._clientMqtt.on('connect', () => {
        this._agentId = uuid.v4() // Generamos el uuid
        this.emit('connected', this._agentId) // Enviamos el agente

        this._timer = setInterval(async () => {
          if (this._metrics.size > 0) { // Solo hacemos la transmisión si tengo metricas
            let message = { // mensaje a transmitir
              agent: {
                uuid: this._agentId,
                username: opts.username,
                name: opts.name,
                hostname: os.hostname() || 'localhost', // 'os' es el modulo de sistema operativo de node
                pid: process.pid
              },
              metrics: [],
              timestamp: new Date().getTime()
            }

            // Agregamos las metricas, en función de lo definido en _metrics.
            for (let [metric, fn] of this._metrics) {
              if (fn.length === 1) { // Si esta fn tiene un argumento es callback
                // promisify, transforma una función callback a una promesa. Definida en el modulo util de node.js
                fn = util.promisify(fn)
              }

              message.metrics.push({
                type: metric,
                value: await Promise.resolve(fn())
              })
            }

            debug('Sending', message)

            this._clientMqtt.publish('agent/message', JSON.stringify(message))
            this.emit('message', message) // Emitimos el mensaje internamente.
          }
        }, opts.interval)
      })

      // Sección cuando el cliente reciba un mensaje.
      this._clientMqtt.on('message', (topic, payload) => {
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
          this.emit(topic, payload) // Mensaje recibido de otro agente, lo emitimos internamente.
        }
      })

      // Con eventEmitter hay que manejar el error.
      this._clientMqtt.on('error', () => this.disconnect())
    }
  }

  disconnect () {
    if (this._started) {
      this._started = false
      clearInterval(this._timer)
      this.emit('disconnected', this._agentId) // Emitimos la desconexión del agente.
      this._clientMqtt.end() // Nos desconectamos del cliente mqtt
    }
  }
}

module.exports = PlatziverseAgent
