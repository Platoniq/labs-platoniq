// src/main.js
import Vue from 'vue'
import ApolloClient from "apollo-boost"
import VueApollo from "vue-apollo"
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App.vue'
import {IntrospectionFragmentMatcher} from 'apollo-cache-inmemory';
import { InMemoryCache } from 'apollo-cache-inmemory';
import introspectionQueryResultData from './fragmentTypes.json';
// or import all icons if you don't care about bundle size
import 'vue-awesome/icons'
/* Register component with one of 2 methods */
import Icon from 'vue-awesome/components/Icon'

// Fontawesome globally (in your main .js file)
Vue.component('v-icon', Icon)

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
});
const cache = new InMemoryCache({
  fragmentMatcher
});

const apolloProvider = new VueApollo({
  defaultClient: new ApolloClient({
    cache,
    connectToDevTools: true,
    uri: 'https://www.decidim.barcelona/api'
  })
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
