'use-strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')

const port = process.env.PORT || 3000
const app = express() // Creamos una aplicación de express
const server = http.createServer(app) // Creamos una instancia del servidor http, pasando la aplicación de express app.

server.listen(port, () => {
  console.log(`${chalk.green('[platziverse-api]')} Server listening on port ${port}`)
})
