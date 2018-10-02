
<template>
  <div>

      <p>
        <b-form-select v-model="selectedInitiativeId" :options="menu" autocomplete="off">
          <template slot="first">
            <!-- this slot appears above the options from 'options' prop -->
            <option :value="null" disabled>-- Please select an initiative --</option>
          </template>
        </b-form-select>
      </p>
      <p v-if="!selectedInitiativeId">Select initiative on the menu to see its best candidates</p>
      <meetings v-else :id="selectedInitiativeId" :view="$route.params.view" :project="$route.params.project" v-on:data-loading="onLoading"  />

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
      // Build a selector with the data
      result({ data, loading, networkStatus }) {
        this.menu = data.initiatives.map( i => {
          return {
            value: i.id,
            text: i.title.translations[0].text
          }
        } )
        console.log("We got some initiatives!", 'title',this.title, 'menu', this.menu, 'raw data', data)
      }
    }
  },
  data() {
    return {
      title: 'Decidim Initiatives',
      menu: []
    }
  },
  methods: {
    onLoading(loading) { //listen the children, pass it to the parent
      this.$emit('data-loading', loading)
    },
    onChangeInitiative() {
      console.log('change', this.selected)
    }
  },
  computed: {
    selectedInitiativeId: {
      get() {
        return this.$route.params.id || null
      },
      set(value) {
        this.$router.push({name: 'decidim-initiatives', params: {id: value, view: 'map'}})
      }
    }
  }
}
</script>