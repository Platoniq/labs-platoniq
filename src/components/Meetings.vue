<template>
  <div>
    <b-row v-for="component in components">
      <h4>{{ component.name.translations[0].text }}</h4>

      <b-table v-bind:class="{muted: $apollo.loading }" bordered hover :items="component.meetings.edges" :fields="fields">
      <template slot="id" slot-scope="data">
        {{ data.item.node.id }}
      </template>
      <template slot="title" slot-scope="data">
        {{ data.item.node.title.translations[0].text }}
      </template>
      <template slot="address" slot-scope="data">
        {{ data.item.node.address }}
      </template>
      <template slot="coordinates" slot-scope="data">
        {{ data.item.node.coordinates.latitude }},
        {{ data.item.node.coordinates.longitude }}
      </template>
    </b-table>
    </b-row>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const query = gql`
query getInitiative($initiativeId: ID!) {
  initiative(id: $initiativeId) {
    id
    title {
      translations {
        text
      }
    }
    components {
      id
      name {
        translations {
          text
        }
      }
      ... on Meetings {
        meetings(after:"") {
          edges {
            node {
              id
              address
              title {
                translations {
                  text
                }
              }
              coordinates {
                latitude
                longitude
              }
            }

          }
        }

      }
    }
  }
}
`

export default {
  props: ['initiativeId'],
  apollo: {
    initiative: {
      query,
      variables() {
        return {
          initiativeId: this.initiativeId
        }
      },
      // We are interested in the meetings array present only in some components
      // creates a new variable meeting from the relevant components
      result({ data, loading, networkStatus }) {
        this.components = data.initiative.components.filter( c => c.meetings )
        console.log("We got some result!", data, this.components)
      },
      error(error) {
        console.error('We\'ve got an error!', error)
      },
      watchLoading(isLoading, countModifier) {
        this.$emit('data-loading', isLoading)
      }
    }
  },
  data() {
    return {
        initiative: {},
        components: {},
        fields: [
            {
              key: 'id',
              label: 'ID',
              sortable: true
            },
            {
              key: 'title',
              label: 'Title',
              sortable: true
            },
            {
              key: 'address',
              label: 'Address'
            },
            {
              key: 'coordinates',
              label: 'GEOLOC',
              sortable: true
            }
        ]
    }
  }
}
</script>