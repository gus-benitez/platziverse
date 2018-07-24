'use strict'

module.exports = function getConfig (params = null) {
  let config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }

  if (params !== null) {
    Object.assign(config, params)
  }
  return config
}
