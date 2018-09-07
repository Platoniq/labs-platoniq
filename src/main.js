// src/main.js
import Vue from 'vue'
import {
  ApolloClient,
  createNetworkInterface
} from 'apollo-client'
import BootstrapVue from 'bootstrap-vue'
import VueApollo from 'vue-apollo'

import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App.vue'

const apolloClient = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'https://www.decidim.barcelona/api'
  }),
  connectToDevTools: true
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

Vue.use(VueApollo)

// Fix for compatibility issue with Vue 2.5.1
// https://github.com/bootstrap-vue/bootstrap-vue/issues/1201
let originalVueComponent = Vue.component
Vue.component = function (name, definition) {
  if (name === 'bFormCheckboxGroup' || name === 'bCheckboxGroup' ||
    name === 'bCheckGroup' || name === 'bFormRadioGroup') {
    definition.components = {
      bFormCheckbox: definition.components[0]
    }
  }
  originalVueComponent.apply(this, [name, definition])
}
Vue.use(BootstrapVue)
Vue.component = originalVueComponent

new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App)
})
