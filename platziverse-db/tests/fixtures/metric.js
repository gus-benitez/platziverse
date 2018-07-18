'use strict'
const agentFixtures = require('./agent')

const metric = {
  id: 1,
  type: 'Type AAA',
  value: 'Value 01',
  agentUuid: agentFixtures.single.uuid,
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, { id: 2, value: 'Value 02', agentUuid: 'yyy-yyy-yyw' }),
  extend(metric, { id: 3, type: 'Type BBB', value: 'Value 03', agentUuid: 'yyy-yyy-yyx' }),
  extend(metric, { id: 4, type: 'Type BBB', value: 'Value 04', agentUuid: 'yyy-yyy-yyz' }),
  extend(metric, { id: 5, type: 'Type BBB', value: 'Value 05', agentUuid: agentFixtures.single.uuid, createdAt: new Date(2018, 1, 1) }),
  extend(metric, { id: 6, type: 'Type BBB', value: 'Value 06', agentUuid: agentFixtures.single.uuid })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  all: metrics,
  byAgentUuid: uuid => {
    let metricUuid = metrics.filter(metric => metric.agentUuid === uuid)
    let metricUuidType = metricUuid.map((metric) => {
      return metric.type
    })
    return metricUuidType.filter((currentValue, index, array) => {
      const indexFind = array.indexOf(currentValue)
      return !(index > indexFind)
    })
  },
  ByTypeAgentUuid: (type, uuid) => {
    let metricTypeUuid = metrics.filter(metric => {
      return metric.agentUuid === uuid && metric.type === type
    })
    // Ordenamos el array por createdAt, Desc
    metricTypeUuid.sort(function (a, b) {
      if (a.createdAt > b.createdAt) {
        return -1
      }
      if (a.createdAt < b.createdAt) {
        return 1
      }
      // a must be equal to b
      return 0
    })
    // Limitamos a 20 metricas
    if (metricTypeUuid.length > 20) {
      metricTypeUuid.splice(20, metricTypeUuid.length + 1)
    }
    return metricTypeUuid
  }
}
