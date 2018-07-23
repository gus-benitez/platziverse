'use strict'

// Función para devolver un JSON
function parsePayload (payload) {
  if (payload instanceof Buffer) { // Si el payload es un Buffer
    payload = payload.toString('utf8') // Pasamos el buffer a String
  }

  try {
    payload = JSON.parse(payload)
  } catch (err) {
    payload = {}
  }
  return payload
}

module.exports = {
  parsePayload
}
