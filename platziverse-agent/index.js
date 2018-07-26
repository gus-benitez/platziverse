'use strict'
// Obtenemos la clase EventEmitter del paquete events
const EventEmitter = require('events')

class PlatziverseAgent extends EventEmitter {
  constructor () {
    super()
  }
}

module.exports = PlatziverseAgent
