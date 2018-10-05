<script>
export default {
  data() {
    return {
      footprints: [],
      sdgs: [],
      loading: []
    }
  },
  methods: {
    addLoading(type) {
      if(this.loading.indexOf(type) == -1)
        this.loading.push(type)
    },
    removeLoading(type) {
      const pos = this.loading.indexOf(type)
      if(pos > -1) this.loading.splice(pos, 1)
    },
    isLoading(type) {
      if(type)
        return this.loading.indexOf(type) > -1
      return this.loading.length > 0
    }
  },
  created() {
    // Load footprints from API
    if(!this.footprints.length) {
      this.addLoading('footprints')
      this.axios
      .get('/footprints/')
      .then(response => {
        this.footprints = response.data.items
        this.removeLoading('footprints')
        console.log('got goteo footprints', response, this.footprints)
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
      .get('/sdgs/')
      .then(response => {
        console.log('got goteo sdgs', response)
        this.sdgs = response.data.items
        this.removeLoading('sdgs')
      })
      .catch(error => {
        this.removeLoading('sdgs')
        console.error('Goteo API error while fetching SDGs', error)
      })
    }
  }

}
</script>
