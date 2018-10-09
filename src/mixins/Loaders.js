var LOADING = LOADING || []

export default {
  methods: {
    getLoading() {
      console.log('got loading', LOADING)
      return LOADING;
    },
    addLoading(type) {
      if (LOADING.indexOf(type) == -1)
        LOADING.push(type)
    },
    removeLoading(type) {
      const pos = LOADING.indexOf(type)
      if (pos > -1) LOADING.splice(pos, 1)
    },
    isLoading(type) {
      if (type)
        return LOADING.indexOf(type) > -1
      return LOADING.length > 0
    }
  }
}
