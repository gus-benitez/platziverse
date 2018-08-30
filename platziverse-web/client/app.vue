<template>
  <div>
    <H2>Agents</H2>

    <p v-for="agent in agents">
      Name: {{agent.name}}
      <br>Username: {{agent.username}}
      <br>Pid: {{agent.pid}}
      <br>Uuid: {{agent.uuid}}
      <br>Hostname: {{agent.hostname}}
      <hr>
    </p>
<!--
    <agent
      v-for="agent in agents"
      :uuid="agent.uuid"
      :key="agent.uuid"
      :socket="socket">
    </agent>
-->
    <p v-if="error">{{error}}</p>
  </div>
</template>

<script>
  const request = require('request-promise-native')
  const io = require('socket.io-client')
  const socket = io()

  module.exports = {
    data () {
      return {
        agents: [],
        error: null,
        socket
      }
    },
    mounted () {
      this.initialize()
    },
    methods: {
      async initialize () {
        const options = {
          method: 'GET',
          url: `http://localhost:8080/agents`,
          json: true
        }

        let agents
        try {
          agents = await request(options)
        } catch (err) {
          this.error = err.error.error
          return
        }
        this.agents = agents
        console.log(agents);
        
      }
    }
  }
</script>

<style>
  body {
    font-family: Arial;
    background: #f8f8f8;
    margin: 0;
  }
</style>