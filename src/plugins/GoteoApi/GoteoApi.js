// This is your plugin object. It can be exported to be used anywhere.
const GoteoApi = {
    // The install method is all that needs to exist on the plugin object.
    // It takes the global Vue object as well as user-defined options.
    install(Vue, axios) {
      Vue.prototype.$goteo = {

        getProjects(params, callback) {
          callback = typeof callback === 'function' ? callback : () => {}
          params = params || {}
          params.limit = 50
          params.page = params.page || 0
          axios
          .get('/projects/',{
            params: params
          })
          .then(response => {
            callback(response.data)
            // Check if we need more
            if (response.data.meta.total > (response.data.meta.page + 1) * response.data.meta.limit) {
              params.page++
              this.getProjects(params, callback)
            }
            console.log('got goteo projects',response)
          })
          .catch(error => {
            console.error('Goteo API error while fetching projects', error)
          })
        },

        getInvests(project, params, callback) {
          callback = typeof callback === 'function' ? callback : () => {}
          params = params || {}
          params.project = project
          params.loc_status = 'located'
          params.limit = 50
          params.page = params.page || 0
          axios
            .get('/invests/', {params: params})
            .then(response => {
              callback(response.data)
              // Check if we need more
              if (response.data.meta.total > (response.data.meta.page + 1) * response.data.meta.limit) {
                params.page++
                this.getInvests(project, params, callback)
              }
              console.log('got goteo invests',response)
            })
            .catch(error => {
              console.error('Goteo API error while fetching invest', error)
            })
        }
      }
    }
  }

  export default GoteoApi