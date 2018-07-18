'use strict'

module.exports = function setupMetric (metricModel, agentModel) {
  async function findTypeByAgentUuid (uuid) {
    return metricModel.findAll({
      attributes: [ 'type' ],
      group: [ 'type' ],
      include: [{
        attributes: [],
        model: agentModel,
        where: { uuid }
      }],
      raw: true
    })
  }

  async function findByTypeAgentUuid (type, uuid) {
    return metricModel.findAll({
      attributes: [ 'id', 'type', 'value', 'createdAt' ],
      where: { type },
      limit: 20,
      order: [[ 'createdAt', 'DESC' ]],
      include: [{
        attributes: [],
        model: agentModel,
        where: { uuid }
      }],
      raw: true
    })
  }

  return {
    findTypeByAgentUuid,
    findByTypeAgentUuid
  }
}
