// This is your plugin object. It can be exported to be used anywhere.
const GoteoApi = {
    // The install method is all that needs to exist on the plugin object.
    // It takes the global Vue object as well as user-defined options.
    install(Vue, axios) {
      console.log('goteo plugin', axios)
      Vue.prototype.$goteo = {

        getProjects(params) {
          params = params || {}
          params.limit = 50
          return new Promise((resolve, reject) => {
            axios
            .get('/projects/',{
              params: params
            })
            .then(response => {
              console.log('got goteo projects',response)
              resolve(response.data.items) // TODO: paginate
            })
            .catch(error => {
              console.error('Goteo API error while fetching projects', error)
              reject(error)
            })
          })
        },
        
        getInvests(project, params) {
          params = params || {}
          params.project = project
          params.loc_status = 'located'
          params.limit = 50
          console.log('get instests',params)
          return new Promise((resolve, reject) => {
            axios
            .get('/invests/', {params: params})
            .then(response => {
              console.log('got goteo invests',response)
              resolve(response.data.items.filter(i => i.latitude && i.longitude)) // TODO: paginate
            })
            .catch(error => {
              console.error('Goteo API error while fetching invest', error)
              reject(error)
            })
          })
        }
      }
    }
  }
  
  export default GoteoApi