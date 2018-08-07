'use strict'

const test = require('ava')
const request = require('supertest')

const server = require('../server')

// 'cb' significa callback, se lo usa porque supertest usa callback.
// Si fuera async await, no se usa 'cb'
test.serial.cb('/api/agents', t => {
  // A la fcion de supertest(request), le pasamos una instancia del Servidor.
  // Y le aplicamos métodos encadenados...
  request(server)
    .get('/api/agents') // Hacemos una peticion a la ruta '/api/agents'
    .expect(200) // Espero que esto retorne 200 (exitoso)
    .expect('Content-Type', /json/) // Espero que el tipo de contenido sea JSON
    .end((err, res) => { // Esta sección es cuando termine, hago mas validaciones
      t.falsy(err, 'Should not return an error') // No debe haber un error, el error debe ser falso
      let body = res.body // Obtenemos el body de la respuesta
      t.deepEqual(body, {}, 'Response body should be the expected') // El body es = a un objeto vacío
      t.end() // Indica que la prueba terminó. Esto solo se usa para 'cb' callback
    })
})
