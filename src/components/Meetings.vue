<template>
  <div>

    <div v-if="!components.length && !isLoading('meetings')" class="alert alert-warning">Sorry, no meetings in this component</div>

    <filters v-else :with-projects="false" :sdg-list="sdgs" :footprint-list="footprints" :project-list="projects" v-on:filter="onFilterPush"></filters>
    <hr>
    <div v-for="component in components" :key="component.id">
      <b-row>
        <b-col>
          <h4>{{ component.name.translations[0].text }}</h4>
        </b-col>
        <b-col cols="4">
          <b-nav pills>
            <b-nav-item :active="getView==='table'" :to="{name: $route.name, params: {id: id, view: 'table'}}">Table</b-nav-item>
            <b-nav-item :active="getView==='map'" :to="{name: $route.name, params: {id: id, view: 'map'}}">Map</b-nav-item>
          </b-nav>
        </b-col>
        <b-col cols="2" v-if="project">
          <switches v-model="filters.socialHeat" text-disabled="Amount heat" text-enabled="Social heat" color="info" type-bold="true" theme="bootstrap"></switches>
        </b-col>
      </b-row>

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
          <div class="progress-wrap">
            <b-progress v-if="percent<100" :max="100" animated variant="info">
              <b-progress-bar :value="percent" :label="percent + '%'" ></b-progress-bar>
            </b-progress>
          </div>

          <l-map id="map" ref="map" :options="{scrollWheelZoom:false}" :zoom="zoom" :bounds="bounds">
          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

          <l-marker-cluster :options="clusterOptionsSignature">
            <l-marker v-for="marker in markers" :key="marker.id" :lat-lng="marker.coords" :icon="getIcon('signature')">
              <l-tooltip :content="marker.title"></l-tooltip>
            </l-marker>
          </l-marker-cluster>

          <l-marker-cluster :options="clusterOptionsProject">
            <l-marker v-for="p in projects" :key="p.id" v-if="project===p.id || !project" :lat-lng="[p.latitude,p.longitude]" :zIndexOffset="1000000" @click="gotoProject(p)" :icon="getIcon('project', p)">
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

        <div class="text-muted">
          <b-badge v-if="info.projects" variant="info">{{info.projects.total}} Projects - {{projects.reduce((c,p) => c + p.amount, 0)}} €</b-badge>
          <b-badge v-if="invests.length && info.invests" variant="secondary">{{info.invests.total}} Invests - {{invests.reduce((c,i) => c + i.amount, 0)}} €</b-badge>
        </div>

      </div>

      <h5>Goteo projects:</h5>
      <!-- <div>
        <b-button v-for="p in projects" :key="p.id" size="sm" :variant="statusColor(p.status)" :pressed="project==p.id" :to="{name:'decidim-initiatives', params: {id: id, view:'map', project: p.id}}" :title="p.status">{{p.name}}</b-button>
      </div> -->

      <project-list :projects="projects" :sdgs="sdgs" :footprints="footprints" v-on:goto-project="gotoProject"></project-list>

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
import Switches from 'vue-switches'
import Footprints from '../mixins/Footprints'
import MapUtils from '../mixins/MapUtils'
import Filters from './GoteoFilters.vue'
import ProjectList from './ProjectList.vue'

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
          locale
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
                  locale
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
    LeafletHeatmap,
    Switches,
    Filters,
    ProjectList
  },
  mixins: [Footprints, MapUtils],
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
          // Query goteo, all projects
          this.loadProjects()
        }

      },
      error(error) {
        console.error('We\'ve got an error!', error)
      },
      watchLoading(isLoading, countModifier) {
        if(isLoading) this.addLoading('meetings')
        else this.removeLoading('meetings')
        this.$emit('data-loading', isLoading)
      }
    }
  },
  data() {
    return {
      result: {},
      projects:[],
      invests:[],
      markers: [],
      initiative: {},
      percent: 100,
      components: {},
      filters: {
        // projects: [],
        footprints: [],
        sdgs: [],
        socialHeat: false,
      },
      info:{},
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
      zoom:13
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
      return this.invests.map((i) => [i.latitude, i.longitude, this.filters.socialHeat ? 10 : i.amount])
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
    gotoProject(p) {
      console.log('goto',this.id,p.id)
      this.$router.push({name:'decidim-initiatives', params: {id: this.id, view:'map', project: p.id}})
    },
    pushToRoute() {
      this.$router.push({
        name: this.$route.name,
        query: {
          filters: JSON.stringify(this.filters)
          }
        })
    },
    getFiltersIds(filters) {
      let ret = {}
      for(let i in filters) {
        ret[i] = Array.isArray(filters[i]) ? filters[i].map(v => v.id) : filters[i]
      }
      return ret
    },
    onFilterPush(filters) {
      // apply filters
      this.onFilter(filters)
      // Set to query string, does not redirect
      // this.pushToRoute()
    },
    onFilter(obFilters) {
      this.filters = this.getFiltersIds(obFilters)
      console.log('filter', obFilters, this.filters)
      this.loadProjects(this.filters)
    },
    loadProjects(filters) {
      let radius = Math.max(2, Math.floor(this.bounds.getCenter().distanceTo(new L.latLng(this.bounds.getNorth(), this.bounds.getCenter().lng))/1000))
      let params = {location: this.bounds.getCenter().lat + ',' + this.bounds.getCenter().lng + ',' + radius};
      this.projects = []

      if(filters) {
        if(filters.footprints && filters.footprints.length) {
          params.footprint = filters.footprints
          // Sdgs only if footprints
          if(filters.sdgs && filters.sdgs.length)
            params.sdg = filters.sdgs
        }
      }
      this.addLoading('projects')
      console.log('loading projects, params', params)
      this.$goteo
        .getProjects(params, data => {
          this.info.projects = data.meta
          this.percent = parseInt(100 * (data.items.length + data.meta.limit * data.meta.page) / data.meta.total)
          if(this.percent>=100) this.removeLoading('projects')
          this.projects = [...this.projects, ...data.items]
        })
    },
    loadInvests() {
      this.addLoading('invests')
      this.$goteo.getInvests(this.project,{}, data => {
        console.log('inc invests', data,this.$refs.paymentCluster)
        this.info.invests = data.meta
        this.invests = [...this.invests, ...data.items.filter(i => i.latitude && i.longitude)]
        this.percent = parseInt(100 * (data.items.length + data.meta.limit * data.meta.page) / data.meta.total)
        if(this.percent>=100) this.removeLoading('invests')
      })
    }

  },
  watch: {
    project() {
      // / Query goteo, project (if selected)
      this.invests = [];
      this.removeLoading('invests')
      if(this.project) {
        this.loadInvests()
      }
    }
  },
  mounted() {
    console.log('mounted', this.project)
    if(this.project) {
      this.loadInvests()
    }
  }
}
</script>
