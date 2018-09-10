<template>
  <div>

    <div v-if="!components.length" class="alert alert-warning">Sorry, no meetings in this component</div>

    <div v-for="component in components" :key="component.id">
      <b-row>
        <b-col cols="8">
          <h4>{{ component.name.translations[0].text }}</h4>
        </b-col>
        <b-col cols="4">
          <b-nav pills>
            <b-nav-item :active="getView==='table'" :to="{name: $route.name, params: {id: id, view: 'table'}}">Table</b-nav-item>
            <b-nav-item :active="getView==='map'" :to="{name: $route.name, params: {id: id, view: 'map'}}">Map</b-nav-item>
          </b-nav>
        </b-col>
        </b-row>
        <hr/>
        <div>
          <b-table v-if="getView==='table'" v-bind:class="{muted: $apollo.loading }" bordered hover :items="component.meetings.edges" :fields="fields">
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

          <div v-else>
             <l-map ref="map" style="height: 500px" :zoom="zoom" :bounds="bounds">
              <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
              <l-marker v-for="(marker,i) in markers" :key="i" :lat-lng="marker"></l-marker>
            </l-map>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import gql from 'graphql-tag'

const query = gql`
query getInitiative($id: ID!) {
  initiative(id: $id) {
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
  props: ['id', 'view'],
  components: {
    LMap,
    LTileLayer,
    LMarker
  },
  apollo: {
    initiative: {
      query,
      variables() {
        return {
          id: this.id
        }
      },
      // We are interested in the meetings array present only in some components
      // creates a new variable meeting from the relevant components
      result({ data, loading, networkStatus }) {
        this.components = data.initiative.components.filter( c => c.meetings )
        this.markers = [];
        if(this.components) {
          console.log("We got some meetings!", data, this.components)
          this.components.forEach(c => c.meetings.edges.forEach(e => {
              let marker = L.latLng(e.node.coordinates.latitude, e.node.coordinates.longitude)
              this.markers.push(marker)
            })
          )
          this.bounds = new L.LatLngBounds(this.markers);
        }

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
      bounds:[],
      markers: [],
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
      ],
      zoom:13,
      url:'https://{s}.tile.openstreetmaps.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="https://openstreetmaps.org/copyright">OpenStreetMap</a> contributors',
    }
  },
  computed: {
    getView() {
      return 'table' === this.$route.params.view ? 'table' : 'map'
    }
  }
}
</script>