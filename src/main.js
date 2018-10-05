// src/main.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import ApolloClient from "apollo-boost"
import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'
import localforage from 'localforage'
import memoryDriver from 'localforage-memoryStorageDriver'
import VueAxios from 'vue-axios'
import VueApollo from "vue-apollo"
import BootstrapVue from 'bootstrap-vue'
import {IntrospectionFragmentMatcher} from 'apollo-cache-inmemory';
import { InMemoryCache } from 'apollo-cache-inmemory';
import introspectionQueryResultData from './fragmentTypes.json';
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App.vue'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import SocialSharing from 'vue-social-sharing'
import routes from './routes.js'
import GoteoApi from "./plugins/GoteoApi/GoteoApi"
const conf = require("../config" + (process.env.NODE_ENV === 'production' ? '.production' : '') + ".json")

// Fontawesome globally (in your main .js file)
Vue.component('v-icon', Icon)
Vue.use(SocialSharing);

// REST API client
axios.defaults.baseURL = conf.goteo.api_uri
axios.defaults.withCredentials = true
axios.defaults.auth = {
  username: conf.goteo.api_user,
  password: conf.goteo.api_key
}
const store = localforage.createInstance({
  // List of drivers used
  driver: [
    localforage.INDEXEDDB,
    localforage.LOCALSTORAGE,
    memoryDriver
  ],
  // Prefix all storage keys to prevent conflicts
  name: 'platoniq-labs'
})

axios.defaults.adapter = setupCache({
  maxAge: (conf.cacheTtl || 8) * 60 * 1000,
  exclude: { query: false },
  key: req => {
    let serialized = req.params instanceof URLSearchParams ? req.params.toString() : JSON.stringify(req.params) || ''
    return req.url + serialized
  },
  store
}).adapter

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
    uri: conf.decidim.api_uri
  })
})

// Routes
const router = new VueRouter({
  routes: routes
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
