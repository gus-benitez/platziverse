'use strict'

const PlatziverseAgent = require('../index')

const agent = new PlatziverseAgent({
  name: 'myapp',
  username: 'admin',
  interval: 2000
})
// Como obtener la métrica rss
agent.addMetric('rss', function getRss () {
  return process.memoryUsage().rss
})
// Mérica obtenida por Promesa
agent.addMetric('promiseMetric', function getRandomPromise () {
  return Promise.resolve(Math.random())
})
// Mérica obtenida por callBack
agent.addMetric('callbackMetric', function getRandomCallback (callback) {
  setTimeout(() => {
    callback(null, Math.random()) // null corresponde a que no hubo error, el segundo param es el random
  }, 1000)
})

agent.connect()

// The following six events are only informative. The real process runs in the main index.js.
// Only for this agent
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)
// For other agents
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', payload => {
  console.log('agent/message: ', payload)
})

// handler es la función que se encarga de manejar los eventos.
function handler (payload) {
  console.log('fn handler: ', payload)
}

setTimeout(() => agent.disconnect(), 4000)
