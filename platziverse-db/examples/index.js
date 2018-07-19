'use strict'

const db = require('../')

async function run () {
  // Creamos el objeto de configuración para conectarse a la base de datos.
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }
  // Obtenemos los servicios de Agente y Métrica
  const {Agent, Metric} = await db(config).catch(handleFatalError)

  // Creamos un agente
  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'name-test',
    username: 'username-test',
    hostname: 'hostname-test',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  console.log('--agent--')
  console.log(agent)

  // Mostramos todos los agentes.
  const agents = await Agent.findAll().catch(handleFatalError)
  console.log('--agents--')
  console.log(agents)

  // Buscamos el agente por uuid.
  const agentByUuid = await Agent.findByUuid(agent.uuid).catch(handleFatalError)
  console.log('--agentByUuid--')
  console.log(agentByUuid)

  // Creamos una métrica
  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)
  console.log('--metric--')
  console.log(metric)

  // Buscamos los Tipos de metricas por uuid del agente.
  const metricTypeByAgentUuid = await Metric.findTypeByAgentUuid(agent.uuid).catch(handleFatalError)
  console.log('--metricTypeByAgentUuid--')
  console.log(metricTypeByAgentUuid)

  // Buscamos todas las metricas por uuid del agente.
  const metricByTypeAgentUuid = await Metric.findByTypeAgentUuid(metric.type, agent.uuid).catch(handleFatalError)
  console.log('--metricByTypeAgentUuid--')
  console.log(metricByTypeAgentUuid)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  console.exit(1)
}

run()
