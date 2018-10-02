<template>
  <div>

    <v-icon v-if="loading" name="sync" spin/>
    <div v-if="!components.length && !loading" class="alert alert-warning">Sorry, no meetings in this component</div>

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
             <p v-if="project"><input type="checkbox" v-model="socialHeat"> Social Heat (instead of Amount Heat) </p>

             <l-map ref="map" style="height: 500px" :zoom="zoom" :bounds="bounds">
              <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
              
              <l-marker-cluster :options="clusterOptionsSignature">
                <l-marker v-for="marker in markers" :key="marker.id" :lat-lng="marker.coords" :icon="getIcon('signature')">
                  <l-tooltip :content="marker.title"></l-tooltip>
                </l-marker>
              </l-marker-cluster>

              <l-marker-cluster :options="clusterOptionsProject">
                <l-marker v-for="p in projects" :key="p.id" v-if="project===p.id || !project" :lat-lng="[p.latitude,p.longitude]" :zIndexOffset="1000000" @click="gotoProject(p)" :icon="getIcon('project')">
                  <l-tooltip :content="p.name"></l-tooltip>
                </l-marker>
              </l-marker-cluster>

              <l-marker-cluster v-if="project" ref="paymentCluster" :options="clusterOptionsPayment">
                <l-marker v-for="i in invests" :key="i.id" :lat-lng="[i.latitude,i.longitude]" :options="{alt:i.amount}" :icon="getIcon('euro',i.amount)">
                  <l-tooltip :content="i.amount + '€'"></l-tooltip>
                </l-marker>
              </l-marker-cluster>

              <LeafletHeatmap v-if="project" :lat-lngs="investLocations"></LeafletHeatmap>
            </l-map>
          </div>

          <div class="text-muted">{{info}}</div>
          <b-progress v-if="percent<100" :max="100" animated>
            <b-progress-bar :value="percent" :label="percent + '%'" ></b-progress-bar>
          </b-progress>

          <h5>Goteo projects:</h5>
          <div>
            <b-button v-for="p in projects" :key="p.id" size="sm" :variant="statusColor(p.status)" :pressed="project==p.id" :to="{name:'initiatives', params: {id: id, view:'map', project: p.id}}" :title="p.status">{{p.name}}</b-button>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import { LMap, LTileLayer, LMarker,LPopup,LTooltip } from 'vue2-leaflet';
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import LeafletHeatmap from '../plugins/LeafletHeatmap/LeafletHeatmap'
// import Vue2LeafletHeatmap from 'vue2-leaflet-heatmap'

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
  props: ['id', 'view', 'project'],
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    'l-marker-cluster': Vue2LeafletMarkerCluster,
    LeafletHeatmap
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
            this.markers.push({
                id: e.node.id,
                title: e.node.title.translations[0].text,
                coords: L.latLng(e.node.coordinates.latitude, e.node.coordinates.longitude)
              })
            })
          )
          this.bounds = new L.LatLngBounds(this.markers.map(m => m.coords));
          let distance = Math.max(2, Math.floor(this.bounds.getCenter().distanceTo(new L.latLng(this.bounds.getNorth(), this.bounds.getCenter().lng))/1000))
          // Query goteo, all projects

          this.projects = []
          this.$goteo
            .getProjects({location: this.bounds.getCenter().lat + ',' + this.bounds.getCenter().lng + ',' + distance}, data =>
              this.projects = [...this.projects, ...data.items]
            )
        }

      },
      error(error) {
        console.error('We\'ve got an error!', error)
      },
      watchLoading(isLoading, countModifier) {
        this.loading = isLoading
        this.$emit('data-loading', isLoading)
      }
    }
  },
  data() {
    return {
      info: '',
      result: {},
      projects:[],
      invests:[],
      socialHeat: false,
      markers: [],
      initiative: {},
      percent: 0,
      components: {},
      clusterOptionsSignature: {
        disableClusteringAtZoom: 17,
        iconCreateFunction(cluster) {
          let n = cluster.getChildCount()
          return L.divIcon({ html: '<div><span>'+n+'</span></div>', className: 'marker-cluster marker-cluster-signature', iconSize: L.point(40, 40) });
        }
      },
      clusterOptionsProject: {
        iconCreateFunction(cluster) {
          let n = cluster.getChildCount()
          return L.divIcon({ html: '<div><span>'+n+'</span></div>', className: 'marker-cluster marker-cluster-project', iconSize: L.point(40, 40) });
        }
      },
      clusterOptionsPayment: {
        iconCreateFunction(cluster) {
          let n = cluster.getAllChildMarkers().reduce((acc,curr) => acc + parseInt(curr && curr.options && curr.options.alt) || 0, 0)
          return L.divIcon({ html: '<div><span>'+n+'€</span></div>', className: 'marker-cluster marker-cluster-payment', iconSize: L.point(40, 40) });
        }
      },
      loading: false,
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
      url:'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }
  },
  computed: {
    getView() {
      return 'table' === this.$route.params.view ? 'table' : 'map'
    },
    totalAmount() {
      return this.invests.reduce((prev, curr) => curr.amount + prev, 0)
    },
    investLocations() {
      let self = this
      return this.invests.map((i) => [i.latitude, i.longitude, self.socialHeat ? 10 : i.amount])
    }
  },
  methods: {
    statusColor(status) {
      if(status === 'funded') return 'success'
      if(status === 'fulfilled') return 'info'
      if(status === 'unfunded') return 'danger'
      if(status === 'in_campaign') return 'warning'

      return 'default';
    },
    getIcon(type, n) {
      let ops ={
        iconSize: [38, 38]
      }
      if(type === 'signature') ops.iconUrl = 'static/img/pin-signature.svg'
      if(type === 'project') ops.iconUrl = 'static/img/pin-project.svg'
      // if(type === 'euro') ops.iconUrl = 'static/img/pin-payment.svg'
      if(type === 'euro') {
        return L.divIcon({ html: '<div><span>'+n+'€</span></div>', className: 'marker-cluster marker-cluster-payment', iconSize: L.point(40, 40) });
      }
      return L.icon(ops)
    },
    gotoProject(p) {
      console.log('goto',this.id,p.id)
      this.$router.push({name:'initiatives', params: {id: this.id, view:'map', project: p.id}})
    },
    filterInvests(data) {
      console.log('inc invests', data,this.$refs.paymentCluster)
      this.invests = [...this.invests, ...data.items.filter(i => i.latitude && i.longitude)]
      this.percent = parseInt(100 * (data.items.length + data.meta.limit * data.meta.page) / data.meta.total)
      // this.$refs.paymentCluster[0].mapObject.refreshClusters()
    }
  },
  watch: {
    project() {
      // / Query goteo, project (if selected)
      this.invests = [];
      if(this.project) {
        this.$goteo.getInvests(this.project,{},this.filterInvests)
      }
    }
  },
  mounted() {
    console.log('mounted', this.project)
    if(this.project) {
      this.$goteo.getInvests(this.project,{},this.filterInvests)
    }
  }
}
</script>