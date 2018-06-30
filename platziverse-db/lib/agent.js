'use strict'

module.exports = function setupAgent (agentModel) {
  function findById (id) {
    return agentModel.findById(id)
  }

  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }

    const existingAgent = await agentModel.findOne(cond)

    if (existingAgent) {
      const update = await agentModel.update(agent, cond)
      return update ? agentModel.findOne(cond) : existingAgent
    }

    const result = await agentModel.create(agent)
    return result.toJSON()
  }

  return {
    findById,
    createOrUpdate
  }
}
