
export default {
  data() {
    return {
      footprints: [],
      sdgs: []
    }
  },
  created() {
    // Load footprints from API
    if(!this.footprints.length) {
      this.addLoading('footprints')
      this.axios
      .get('/footprints/?lang=en', {
        cache: {
          maxAge: 30 * 24 * 60 * 60 * 1000 // 1month cache
       }})
      .then(response => {
        this.footprints = response.data.items
        this.removeLoading('footprints')
        // console.log('got goteo footprints', response, this.footprints)
      })
      .catch(error => {
        this.removeLoading('footprints')
        console.error('Goteo API error while fetching footprints', error)
      })
    }
    // Load sdgs
    if(!this.sdgs.length) {
      this.addLoading('sdgs')
      this.axios
      .get('/sdgs/?lang=en', {
        cache: {
          maxAge: 30 * 24 * 60 * 60 * 1000 // 1month cache
      }})
      .then(response => {
        // console.log('got goteo sdgs', response)
        this.sdgs = response.data.items
        this.removeLoading('sdgs')
      })
      .catch(error => {
        this.removeLoading('sdgs')
        console.error('Goteo API error while fetching SDGs', error)
      })
    }
  },
  watch: {
    sdgs() {
      if (!this.sdgs.length) {
        this.removeLoading('sdgs')
      }
    },
    footprints() {
      if (!this.footprints.length) {
        this.removeLoading('footprints')
      }
    }
  }
}
