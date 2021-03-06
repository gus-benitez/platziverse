'use strict'

module.exports = function setupAgent (agentModel) {
  function findById (id) {
    return agentModel.findById(id)
  }
  function findByUuid (uuid) {
    return agentModel.findOne({
      where: { uuid }
    })
  }
  function findAll () {
    return agentModel.findAll()
  }
  function findConnected () {
    const cond = {
      where: {
        connected: true
      }
    }
    return agentModel.findAll(cond)
  }
  function findByUsername (username) {
    const cond = {
      where: {
        username: username,
        connected: true
      }
    }
    return agentModel.findAll(cond)
  }
  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }

    const existingAgent = await agentModel.findOne(cond) // No es necesario await

    if (existingAgent) {
      const update = await agentModel.update(agent, cond) // No es necesario await
      return update ? agentModel.findOne(cond) : existingAgent
    }

    const result = await agentModel.create(agent)
    return result.toJSON()
  }

  return {
    findById,
    findByUuid,
    findAll,
    findConnected,
    findByUsername,
    createOrUpdate
  }
}
