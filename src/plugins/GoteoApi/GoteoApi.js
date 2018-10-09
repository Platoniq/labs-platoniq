
// This is your plugin object. It can be exported to be used anywhere.
const GoteoApi = {
  // The install method is all that needs to exist on the plugin object.
  // It takes the global Vue object as well as user-defined options.
  install(Vue, axios) {
      Vue.prototype.$goteo = {
        sources: {
          project: null,
          invest: null
        },

        cancel(target) {
          let sources = this.sources[target] ? {[target]:this.sources[target]} : {}
          if(target === undefined) sources = this.sources
          console.log('canceling', sources)
          Object.keys(sources).forEach(k => sources[k] && sources[k].cancel('abort sequential ' + k + ' fetch'))
        },

        prepareParams(params) {
          let prepared = new URLSearchParams();
          for (let p in params) {
            if (Array.isArray(params[p])) {
              params[p].forEach(v => prepared.append(p, v))
            } else {
              prepared.append(p, params[p]);
            }
          }
          return prepared
        },

        getProjects(params, callback) {
          callback = typeof callback === 'function' ? callback : () => {}
          params = params || {}
          if(!params.project) {
            params.status = ['in_campaign', 'funded', 'fulfilled']
            // params.from_date = '2013-12-16' // First project with social_commitment
          }
            params.limit = 50
          params.page = params.page || 0
          console.log('preparing projects', params)

          this.cancel('project')
          this.sources.project = axios.CancelToken.source()
          axios
            .get('/projects/',{
              params: this.prepareParams(params),
              cancelToken: this.sources.project.token
            })
            .then(response => {
              callback(response.data)
              // Check if we need more
              if (response.data.meta.total > (response.data.meta.page + 1) * response.data.meta.limit) {
                params.page++
                this.getProjects(params, callback)
              } else {
                this.sources.project = null
                console.log('finish loading projects')
              }
              console.log('got goteo projects',params, response)
            })
            .catch(error => {
              if (axios.isCancel(error)) {
                console.log('Project request canceled', error.message);
              } else {
                console.error('Goteo API error while fetching projects', error)
              }
            })
        },

        getInvests(projects, params, callback) {
          callback = typeof callback === 'function' ? callback : () => {}
          params = params || {}
          params.project = projects
          params.loc_status = 'located'
          params.limit = 50
          params.page = params.page || 0
          // console.log('preparing invests', params)
          this.cancel('invest')
          this.sources.invest = axios.CancelToken.source()
          axios
            .get('/invests/', {
              params: this.prepareParams(params),
              cancelToken: this.sources.invest.token
            })
            .then(response => {
              callback(response.data)
              // Check if we need more
              if (response.data.meta.total > (response.data.meta.page + 1) * response.data.meta.limit) {
                params.page++
                this.getInvests(projects, params, callback)
              } else {
                this.sources.invest = null
                console.log('finish loading invests')
              }
              console.log('got goteo invests',response)
            })
            .catch(error => {
              if (axios.isCancel(error)) {
                console.log('Invest request canceled', error.message);
              } else {
                console.error('Goteo API error while fetching invest', error)
              }
            })
        }
      }
    }
  }

  export default GoteoApi
