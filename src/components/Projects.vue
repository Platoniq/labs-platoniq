
<template>
  <div>

      <!-- <h2>Goteo projects</h2> -->

      <filters :sdg-list="sdgs" :footprint-list="footprints" :project-list="projects" v-on:filter="onFilterPush" :loading="isLoading()"></filters>

      <em v-if="invests.length" class="text-danger"><v-icon name="hand-point-right"></v-icon> Moving the map won't update projects list while heat map is active</em>

      <div class="progress-wrap">
        <b-progress v-if="percent<100" :max="100" animated variant="info">
          <b-progress-bar :value="percent" :label="percent + '%'" ></b-progress-bar>
        </b-progress>
      </div>

      <div class="map_container">
        <l-map id="map" ref="map" :zoom=zoom :center="center" :options="{scrollWheelZoom:false}" @move="mapMove">
          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

          <!-- <l-circle v-if="radius<=500" :lat-lng="center" :radius="radius*1000" color="" fill-color="#988" fill-opacity="0.1"></l-circle> -->

          <l-marker-cluster :options="clusterOptionsProject">
            <l-marker v-for="p in projectLocations" :key="p.id" :lat-lng="[p.latitude,p.longitude]" @click="gotoProject(p)" :icon="getIcon('project', p)">
              <l-tooltip :content="p.name"></l-tooltip>
            </l-marker>
          </l-marker-cluster>

          <l-marker-cluster :options="clusterOptionsPayment">
            <l-marker v-for="i in invests" :key="i.id" :lat-lng="[i.latitude,i.longitude]" :options="{alt:i.amount}" :icon="getIcon('euro',i)">
              <l-tooltip :content="i.amount + '€'"></l-tooltip>
            </l-marker>
          </l-marker-cluster>

          <l-leaflet-heatmap :lat-lngs="investLocations"></l-leaflet-heatmap>

        </l-map>
        <img v-if="isLoading('projects')" id="map-radar" src="static/img/radar.svg">
      </div>

      <div class="text-muted">
        <b-badge v-if="info.projects" variant="info">{{info.projects.total}} Projects - {{projects.reduce((c,p) => c + p.amount, 0)}} €</b-badge>
        <b-badge v-if="invests.length && info.invests" variant="secondary">{{info.invests.total}} Invests - {{invests.reduce((c,i) => c + i.amount, 0)}} €</b-badge>
      </div>

      <hr>

      <project-list :projects="projects" :project="filters.projects" :sdgs="sdgs" :footprints="footprints" v-on:goto-project="toggleRouteForProject"></project-list>

    <div>


    </div>

  </div>

</template>

<script>
import L from 'leaflet'
import { LMap,LTileLayer,LCircle,LPolyline,LMarker,LPopup,LTooltip } from 'vue2-leaflet'
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
// import Vue2LeafletHeatmap from "vue2-leaflet-heatmap"
import Vue2LeafletHeatmap from "../plugins/LeafletHeatmap/LeafletHeatmap.vue"
import Filters from './GoteoFilters.vue'
import ProjectList from './ProjectList.vue'
import Footprints from '../mixins/Footprints'
import MapUtils from '../mixins/MapUtils'

export default {
  components: {
    'l-map': LMap,
    'l-tile-layer': LTileLayer,
    'l-marker': LMarker,
    'l-circle': LCircle,
    'l-polyline': LPolyline,
    'l-popup': LPopup,
    'l-tooltip': LTooltip,
    'l-marker-cluster': Vue2LeafletMarkerCluster,
    'l-leaflet-heatmap': Vue2LeafletHeatmap,
    'filters': Filters,
    'project-list': ProjectList
  },
  mixins: [MapUtils, Footprints],
  data() {
    return {
      map: null,
      center: [41.5,-1],
      bounds: null,
      zoom: 7,
      radius: 50,
      projects: [],
      invests: [],
      percent: 100,
      info:{},
      filters: {
        projects: [],
        footprints: [],
        sdgs: [],
        socialHeat: false,
      },
    }
  },
  methods: {
    mapMove(ev) {
      // console.log('move map',ev)
      if(!this.filters.projects || !this.filters.projects.length)
        this.loadProjects(this.filters)
      // Set to query string, does not redirect
      this.pushToRoute()
    },
    toggleRouteForProject(p) {
      let center = []
      const zoom = this.$route.query.zoom
      const pos = this.filters.projects.indexOf(p.id)
      if(pos > -1) this.filters.projects.splice(pos, 1)
      else this.filters.projects.push(p.id)
      try { center = JSON.parse(this.$route.query.center) } catch(e){}
      this.loadProjects(this.filters)
      // Set to query string, does not redirect
      this.pushToRoute()
    },
    loadProjects(filters) {
      if(!this.map) return;
      this.projects = []
      this.invests = []
      this.$goteo.cancel() // Cancel any current loading
      let center = this.map.getCenter()
      this.bounds = this.map.getBounds()
      // Minimal radius:
      this.radius = Math.max(1,Math.round(center.distanceTo(new L.latLng(this.bounds.getNorth(), center.lng)) / 1000))
      // Maximal radius
      // this.radius = Math.max(1,Math.round(center.distanceTo(this.bounds.getNorthWest()) / 1000))
      this.center = [center.lat, center.lng]
      this.zoom = this.map.getZoom()
      let params = {location: center.lat + ',' + center.lng + ',' + this.radius}
      if(this.radius > 500) params = {}
      if(filters) {
        if(filters.footprints && filters.footprints.length) {
          params.footprint = filters.footprints
          // Sdgs only if footprints
          if(filters.sdgs && filters.sdgs.length)
            params.sdg = filters.sdgs
        }
      }
      console.log('load projects from filters',filters, 'params',params)
      this.addLoading('projects')
      this.$goteo
        .getProjects(params, data => {
          this.info.projects = data.meta
          this.percent = parseInt(100 * (data.items.length + data.meta.limit * data.meta.page) / data.meta.total)
          if(this.percent>=100) this.removeLoading('projects')
          this.projects = [...this.projects, ...data.items]
        console.log("curr project", this.projects)
        })

    },
    loadInvests(projects) {
      this.invests = []
      console.log('load invests',projects)
      this.addLoading('invests')
      this.$goteo
        .getInvests(projects, {}, data => {
          this.info.invests = data.meta
          this.percent = parseInt(100 * (data.items.length + data.meta.limit * data.meta.page) / data.meta.total)
          // console.log('step invests', this.percent)
          if(this.percent >= 100) this.removeLoading('invests')
          this.invests = [...this.invests, ...data.items.filter(i => i.latitude && i.longitude)]
        })

    },
    getFiltersIds(filters) {
      let ret = {}
      for(let i in filters) {
        ret[i] = Array.isArray(filters[i]) ? filters[i].map(v => v.id) : filters[i]
      }
      return ret
    },
    pushToRoute() {
      this.$router.push({
        name: this.$route.name,
        query: {
          filters: JSON.stringify(this.filters),
          center: JSON.stringify(this.center),
          zoom: this.zoom
          }
        })
    },
    onFilterPush(filters) {
      // apply filters
      this.onFilter(filters)
      // Set to query string, does not redirect
      this.pushToRoute()
    },
    onFilter(obFilters) {
      this.filters = this.getFiltersIds(obFilters)
      console.log('filter', obFilters, this.filters)
      this.$goteo.cancel('invest') // Cancel current loading requests
      this.percent = 100
      if(this.filters.projects && this.filters.projects.length)
        this.loadInvests(this.filters.projects)
      else
        this.loadProjects(this.filters)
    },
    gotoProject(p) {
      this.filters.projects = this.filters.projects || []
      if(this.filters.projects.indexOf(p.id) > -1) return
      this.filters.projects.push(p.id)
      console.log('goto project', p, this.filters)
      this.loadInvests(this.filters.projects)
      // Set to query string, does not redirect
      this.pushToRoute()
    }
  },
  computed: {
    projectLocations() {
      // console.log('project locations', this.filters.projects, this.projects.filter(p => this.filters.projects.indexOf(p.id) > -1 ), this.projects)
      if(this.filters.projects && this.filters.projects.length)
        return this.projects.filter(p => this.filters.projects.indexOf(p.id) > -1 )
      return this.projects
    },
    investLocations() {
      return this.invests.map((i) => [i.latitude, i.longitude, this.filters.socialHeat ? 10 : i.amount])
    }
  },
  created() {
    // Set map properties from query string before mounting the map
    // it seems to be buggy if we do this on mounted() hook
    if(this.$route.query.filters) {
      try{ this.filters = JSON.parse(this.$route.query.filters) } catch(e){}
    }
    if(this.$route.query.center) {
      try{
        let c = JSON.parse(this.$route.query.center)
        this.center = [parseFloat(c[0]) || 41.5, parseFloat(c[1]) || -1]
        console.log('center', c, this.center)
      } catch(e){}
    }
    if(this.$route.query.zoom) {
      this.zoom = parseInt(this.$route.query.zoom) || 7
    }
  },
  mounted() {
    // mapObject is not available directly in vue's mounted hook.
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject // work as expected
      console.log('mounted', 'center',this.center, 'zoom', this.zoom, 'filters', this.filters)
      // Check querystring
      this.loadProjects(this.filters)
      if(this.filters.projects && this.filters.projects.length)
        this.loadInvests(this.filters.projects)
    })
  }
}
</script>

<style lang="scss">
.map_container {
  position:relative;
  img#map-radar {
    position:absolute;
    top:0;
    left:50%;
    right:0;
    margin:0 -250px;
    height:500px;
    width:500px;
    z-index:1000;
  }
}
</style>
