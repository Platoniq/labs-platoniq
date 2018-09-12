// src/main.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import ApolloClient from "apollo-boost"
import axios from 'axios'
import VueAxios from 'vue-axios'
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
import Initiatives from "./components/Initiatives.vue"
import GoteoApi from "./plugins/GoteoApi/GoteoApi"
import {decidim,goteo} from "../config.json"

// Fontawesome globally (in your main .js file)
Vue.component('v-icon', Icon)
// REST API client
axios.defaults.baseURL = goteo.api_uri
axios.defaults.withCredentials = true
axios.defaults.auth = {
  username: goteo.api_user,
  password: goteo.api_key
}
console.log(axios.defaults)
Vue.use(VueAxios, axios)

// Graphql API client
Vue.use(VueApollo)

// Custom plugin for goteoapi
Vue.use(GoteoApi, axios)

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
    uri: decidim.api_uri
  })
})

// Routes
const router = new VueRouter({
  routes: [{
    name: 'initiatives',
    path: '/initiatives/:id?/:view?/:project?',
    component: Initiatives
  }]
})

Vue.use(VueRouter)

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
  router,
  render: h => h(App)
})
