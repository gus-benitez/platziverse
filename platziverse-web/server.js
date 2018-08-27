'use strict'

const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const http = require('http')
const path = require('path') // Recomendado para hacer operaciones con rutas.
const express = require('express')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)

app.use(express.static(path.join(__dirname, 'public')))

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
