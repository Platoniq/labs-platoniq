
<template>
  <b-row>
    <b-col cols="4">
      <b-list-group>
        <b-list-group-item v-for="initiative in initiatives"
          :key="initiative.id"
          href="#"
          :active="selectedInitiativeId == initiative.id" @click="selectInitiative(initiative)">
            {{ initiative.title.translations[0].text }}
        </b-list-group-item>
      </b-list-group>
    </b-col>
    <b-col>
      <p v-if="!selectedInitiativeId">Select initiative on the sidebar to see its best candidates</p>
      <meetings v-else :initiativeId="selectedInitiativeId" v-on:data-loading="onLoading"  />
    </b-col>
  </b-row>
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
      }
    }
  },
  data() {
    return {
      section:'Decidim Initiatives',
      initiatives: [],
      selectedInitiativeId: null
    }
  },
  methods: {
    selectInitiative(initiative) {
      this.selectedInitiativeId = initiative.id
    },
    onLoading(loading) { //listen the children, pass it to the parent
      this.$emit('data-loading', loading)
    }
  },
  mounted() {
    console.log('created',this.section, this)
    this.$emit('section-loaded', this.section)
  }
}
</script>