'use strict'
// Obtenemos la clase EventEmitter del paquete events
const EventEmitter = require('events')

class PlatziverseAgent extends EventEmitter {
  constructor (opts) {
    super()

    this._options = opts
    this._started = false
    this._timer = null
  }

  connect () {
    if (!this._started) {
      this._started = true
      const opts = this._options
      this._timer = setInterval(() => {
        this.emit('agent/message', 'this is a message')
      }, opts.interval)
      this.emit('connected')
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
