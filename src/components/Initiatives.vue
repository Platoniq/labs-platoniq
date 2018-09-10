
<template>
  <div>

      <p v-if="!selectedInitiativeId">Select initiative on the menu to see its best candidates</p>
      <meetings v-else :id="selectedInitiativeId" v-on:data-loading="onLoading"  />

  </div>
</template>

<script>
import gql from 'graphql-tag'
import meetings from './Meetings.vue'


const query = gql`
{
  initiatives {
    id
    title {
      translations {
        text
      }
    }
  }
}
`

export default {
  components: {
    meetings
  },
  apollo: {
    initiatives: {
      query,
      watchLoading(isLoading, countModifier) {
        this.$emit('data-loading', isLoading)
      },
      // Build a menu with the data
      result({ data, loading, networkStatus }) {
        this.menu = data.initiatives.map( i => {
          return {
            id: i.id,
            text: i.title.translations[0].text,
            to: {name: this.section, params: {id: i.id}}
          }
        } )
        console.log("We got some initiatives!", 'title',this.title, 'menu', this.menu, 'raw data', data)
        this.$emit('section-loaded', this.section, null, this.menu)
      },

    }
  },
  data() {
    return {
      section:'initiatives',
      title: 'Decidim Initiatives',
      menu: [],
    }
  },
  methods: {
    onLoading(loading) { //listen the children, pass it to the parent
      this.$emit('data-loading', loading)
    }
  },
  mounted() {
    console.log('mount', this.section, this.title)
    this.$emit('section-loaded', this.section, this.title)
  },
  computed: {
    selectedInitiativeId() {
      return this.$route.params.id
    }
  }
}
</script>