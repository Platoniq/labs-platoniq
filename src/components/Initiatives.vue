
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
    </b-col>
  </b-row>
</template>

<script>
import gql from 'graphql-tag'

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
  apollo: {
    initiatives: query
  },
  data() {
    return {
      initiatives: [],
      selectedInitiativeId: null
    }
  },
  methods: {
    selectInitiative(initiative) {
      this.selectedInitiativeId = initiative.id
    }
  }
}
</script>