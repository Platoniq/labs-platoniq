// This is your plugin object. It can be exported to be used anywhere.
const GoteoApi = {
    // The install method is all that needs to exist on the plugin object.
    // It takes the global Vue object as well as user-defined options.
    install(Vue, axios) {
      Vue.prototype.$goteo = {
        // stopProjects: false,
        // stopInvests: false,
        projectSource: null,

        getProjects(params, callback) {
          callback = typeof callback === 'function' ? callback : () => {}
          params = params || {}
          params.limit = 50
          params.page = params.page || 0
          if(this.projectSource) {
            this.projectSource.cancel('abort sequential project fetch')
          }
          this.projectSource = axios.CancelToken.source()
          axios.get('/projects/',{
            params: params,
            cancelToken: this.projectSource.token
          })
          .then(response => {
            callback(response.data)
            // Check if we need more
            if (response.data.meta.total > (response.data.meta.page + 1) * response.data.meta.limit) {
              params.page++
              this.getProjects(params, callback)
            } else {
              this.projectSource = null
              console.log('finish loading projects')
            }
            console.log('got goteo projects',params, response)
          })
          .catch(error => {
            if (axios.isCancel(error)) {
              console.log('Request canceled', error.message);
            } else {
              console.error('Goteo API error while fetching projects', error)
            }
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