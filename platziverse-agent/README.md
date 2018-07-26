# platziverse-agent

## Usage

``` js
const PlatziverseAgent = require('platziverse-agent')

const agent = new Platziverse({
  interval: 2000
})

// Only for this agent
agent.connect()
agent.disconnect()
agent.message()

// For other agents
agent.on('agent/connected')
agent.on('agent/disconnected')
agent.on('agent/message', payload => {
  console.log(payload)
})

setTimeout(() => agent.disconnect(), 20000)
```
