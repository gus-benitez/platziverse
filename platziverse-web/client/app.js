'use strict'

const Vue = require('vue')
const App = require('./app.vue')

const Agent = require('./components/agent.vue')
const Metric = require('./components/metric.vue')
Vue.component('agent', Agent)
Vue.component('metric', Metric)

// eslint-disable-next-line no-unused-vars
const vm = new Vue({
  el: '#app',
  render (createElement) {
    return createElement(App)
  }
})
