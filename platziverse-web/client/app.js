'use strict'

const Vue = require('vue')
const App = require('./app.vue')

const Agent = require('./components/agent.vue')

Vue.component('agent', Agent)

// eslint-disable-next-line no-unused-vars
const vm = new Vue({
  el: '#app',
  render (createElement) {
    return createElement(App)
  }
})
