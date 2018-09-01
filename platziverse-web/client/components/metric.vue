<template>
  <div class="metric">
    <h3 class="metric-type">{{ type }}</h3>

    <h2>Labels: {{ labels }} - Data: {{ data }}</h2>

    <p v-if="error">{{error}}</p>
  </div>
</template>

<script>
  const request = require('request-promise-native')
  const moment = require('moment')

  module.exports = {
    name: 'metric',
    props: [ 'uuid', 'type' ],

    data() {
      return {
        datacollection: {},
        error: null,
        color: null,
        labels: null,
        data: null
      }
    },

    mounted() {
      this.initialize()
    },

    methods: {
      async initialize() {
        const {uuid, type} = this
        
        const options = {
          method: 'GET',
          url: `http://localhost:8080/metrics/${uuid}/${type}`,
          json: true
        }

        let result
        try {
          result = await request(options)
        } catch (err) {
          this.error = err.error.error
          return
        }

        const labels = []
        const data = []

        if (Array.isArray(result)) {
          result.forEach(m => {
            labels.push(moment(m.createdAt).format('HH:mm:ss'))
            data.push(m.value)
          })
        }
        this.labels = labels
        this.data = data
      },

      handleError (err) {
        this.error = err.message
      }
    }
  }
</script>

<style>
  .metric {
    border: 1px solid white;
    margin: 0 auto;
  }
  .metric-type {
    font-size: 28px;
    font-weight: normal;
    font-family: 'Roboto', sans-serif;
  }
  canvas {
    margin: 0 auto;
  }
</style>
