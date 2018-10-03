
<template>
  <div>

      <!-- <h2>Goteo projects</h2> -->

      <filters :project-list="projects" :filters="filters" :to-query-string="true" v-on:filter="onFilter"></filters>

      <div class="progress-wrap">
        <b-progress v-if="percent<100" :max="100" animated variant="info">
          <b-progress-bar :value="percent" :label="percent + '%'" ></b-progress-bar>
        </b-progress>
      </div>

      <l-map ref="map" style="height: 500px" :zoom="zoom" :center="center" @move="mapMove">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

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

      <LeafletHeatmap :lat-lngs="investLocations"></LeafletHeatmap>
    </l-map>

    <div class="text-muted">{{info}}</div>

    <hr>

    <div>

      <b-table v-if="projects.length" bordered hover :items="projects" :fields="fields">
        <template slot="name" slot-scope="{item}">
          {{ item.name }}
        </template>
        <template slot="description" slot-scope="{item}">
          <p class="text-muted">{{ item['description-short'] }}</p>
        </template>
        <template slot="amount" slot-scope="{item}">
          {{ item.amount }} €
        </template>
        <template slot="links" slot-scope="{item}">
          <a :href="item['project-url']" target="_blank"><v-icon alt="Project page" name="link"/></a>
        </template>
      </b-table>

    </div>

  </div>

</template>

<script>
import L from 'leaflet'
import { LMap, LTileLayer, LMarker,LPopup,LTooltip } from 'vue2-leaflet'
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import LeafletHeatmap from '../plugins/LeafletHeatmap/LeafletHeatmap'
import Filters from './GoteoFilters.vue'

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    'l-marker-cluster': Vue2LeafletMarkerCluster,
    LeafletHeatmap,
    'filters': Filters
  },
  data() {
    return {
      map: null,
      center: [41.5,-1],
      projects: [],
      invests: [],
      percent:100,
      info:'',
      filters: {
        projects:null,
        footprints:null,
        sdgs:null,
        socialHeat: false,
      },
      fields: [
        {
          key: 'name',
          label: 'Name',
          sortable: true
        },
        {
          key: 'description',
          label: 'Description'
        },
        {
          key: 'amount',
          label: 'Amount',
          sortable: true
        },
        {
          key: 'links',
          label: 'Links'
        }
      ],
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
      zoom:7,
      url:'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  methods: {
    onLoading(loading) { //listen the children, pass it to the parent
      this.$emit('data-loading', loading)
    },
    mapMove(ev) {
      // console.log('move map',ev)
      if(!this.filters.projects || !this.filters.projects.length)
        this.loadProjects(this.filters)
    },
    loadProjects(filters) {
      this.projects = []
      this.invests = []
      this.$goteo.cancel() // Cancel any current loading
      let center = this.map.getCenter();
      let bounds = this.map.getBounds();
      // let distance = Math.min(500,Math.max(1,Math.round(center.distanceTo(new L.latLng(bounds.getNorth(), center.lng)) / 1000)))
      let distance = Math.max(1,Math.round(center.distanceTo(bounds.getNorthWest()) / 1000))
      let params = {location: center.lat + ',' + center.lng + ',' + distance}
      if(distance > 500) params = {}
      if(filters) {
        if(filters.footprints)
          params.footprint = filters.footprints.map(f => f.id)
        if(filters.sdgs)
          params.sdg = filters.sdgs.map(f => f.id)
      }
      console.log('load projects',params)
      this.$goteo
        .getProjects(params, data => {
            this.info = data.meta.total + ' Projects'
            this.percent = parseInt(100 * (data.items.length + data.meta.limit * data.meta.page) / data.meta.total)
            return this.projects = [...this.projects, ...data.items]
          }
        )

    },
    loadInvests(projects) {
      this.invests = []
      console.log('load invests',projects)
      this.$goteo
        .getInvests(projects.map(p => p.id), {}, data => {
            this.info = data.meta.total + ' Invests'
            this.percent = parseInt(100 * (data.items.length + data.meta.limit * data.meta.page) / data.meta.total)
            return this.invests = [...this.invests, ...data.items.filter(i => i.latitude && i.longitude)]
          }
        )

    },
    onFilter(filters) {
      this.filters = filters
      console.log('filter', filters, filters.sdgs, filters.projects)
      this.$goteo.cancel('invest') // Cancel current loading requests
      this.percent = 100
      if(this.filters.projects && this.filters.projects.length)
        this.loadInvests(this.filters.projects)
      else
        this.loadProjects(this.filters)
    },
    getIcon(type, ob) {
      let ops ={
        iconSize: [38, 38]
      }
      if(type === 'project') {
        ops.iconUrl = ob['image-url']
        ops.className = 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive image-project'
      }
      if(type === 'euro') {
        return L.divIcon({ html: '<div><span>' + ob.amount +'€</span></div>', className: 'marker-cluster marker-cluster-payment', iconSize: L.point(40, 40) });
      }
      return L.icon(ops)
    },
    gotoProject(p) {
      console.log('goto project', p)
    }
  },
  computed: {
    projectLocations() {
      if(this.filters.projects && this.filters.projects.length)
        return this.filters.projects
      return this.projects
    },
    investLocations() {
      return this.invests.map((i) => [i.latitude, i.longitude, this.filters.socialHeat ? 10 : i.amount])
    }
  },
  mounted() {
    // mapObject is not available directly in vue's mounted hook.
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject // work as expected
      // Check querystring
      this.loadProjects()
      if(this.$route.query && this.$route.query.filters) {
        this.onFilter( JSON.parse(this.$route.query.filters) )
        console.log('query', this.$route.query, this.filters, this.filters.sdgs)
      }
    })
  }
}
</script>

<style>
.progress-wrap {
  height:30px;
  padding:8px 0 11px;
}
</style>