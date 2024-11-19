import Vue from 'vue'
import VueSSE from 'vue-sse'

// using defaults
Vue.use(VueSSE)

// OR specify custom defaults (described below)
/* Vue.use(VueSSE, {
  format: 'json',
  polyfill: true,
  url: '/my-events-server',
  withCredentials: true,
}) */
