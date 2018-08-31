<template>
  <div class="metric">
    <h3 class="metric-type">{{ type }}</h3>

    <h2>Uuid: {{ uuid }} - Type: {{ type }}</h2>

    <p v-if="error">{{error}}</p>
  </div>
</template>

<script>
  module.exports = {
    name: 'metric',
    props: [ 'uuid', 'type' ],

    data() {
      return {
        datacollection: {},
        error: null,
        color: null
      }
    },

    mounted() {
      this.initialize()
    },

    methods: {
      initialize() {
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
