
<template>
  <div>

      <!-- <h2>Goteo projects</h2> -->

      <filters :project-list="projects" v-on:filter="onFilterPush" v-on:filter-list="onList"></filters>

      <div class="progress-wrap">
        <b-progress v-if="percent<100" :max="100" animated variant="info">
          <b-progress-bar :value="percent" :label="percent + '%'" ></b-progress-bar>
        </b-progress>
      </div>

      <l-map ref="map" style="height: 500px" :zoom="zoom" :center="center" :scroll-wheel-zoom="false" @move="mapMove">
        <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

        <l-circle :lat-lng="center" :radius="radius*1000" color="" fill-color="#988" :fill-opacity="0.10"></l-circle>

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
          <b-row>
            <b-col cols="7">
              <img class="icon-footprint" v-for="sdg in getFootprintsFromSocialCommitment(item['social-commitment-id'])" :key="sdg.id" :src="sdg['icon-url']" :title="sdg.name">
            </b-col>
            <b-col>
              <img class="icon-sdg" v-for="sdg in getSdgsFromSocialCommitment(item['social-commitment-id'])" :key="sdg.id" :src="sdg['icon-url']" :title="sdg.name">
            </b-col>
          </b-row>
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
import { LMap,LTileLayer,LCircle,LMarker,LPopup,LTooltip } from 'vue2-leaflet'
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
import LeafletHeatmap from '../plugins/LeafletHeatmap/LeafletHeatmap'
import Filters from './GoteoFilters.vue'

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    'l-circle': LCircle,
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
      zoom:7,
      radius:50,
      projects: [],
      invests: [],
      social_commitments: {
        sdgs: {},
        footprints: {}
      },
      percent:100,
      info:'',
      filters: {
        projects: [],
        footprints: [],
        sdgs: [],
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
      url:'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
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
      // Set to query string, does not redirect
      this.pushToRoute()
    },
    loadProjects(filters) {
      if(!this.map) return;
      this.projects = []
      this.invests = []
      this.$goteo.cancel() // Cancel any current loading
      let center = this.map.getCenter()
      let bounds = this.map.getBounds()
      // Minimal radius:
      this.radius = Math.min(500,Math.max(1,Math.round(center.distanceTo(new L.latLng(bounds.getNorth(), center.lng)) / 1000)))
      // Maximal radius
      // this.radius = Math.max(1,Math.round(center.distanceTo(bounds.getNorthWest()) / 1000))
      this.center = [center.lat, center.lng]
      this.zoom = this.map.getZoom()
      let params = {location: center.lat + ',' + center.lng + ',' + this.radius}
      if(this.radius > 500) params = {}
      if(filters) {
        if(filters.footprints && filters.footprints.length)
          params.footprint = filters.footprints
        if(filters.sdgs && filters.sdgs.length)
          params.sdg = filters.sdgs
      }
      console.log('load projects from filters',filters, 'params',params)
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
        .getInvests(projects, {}, data => {
            this.info = data.meta.total + ' Invests'
            this.percent = parseInt(100 * (data.items.length + data.meta.limit * data.meta.page) / data.meta.total)
            return this.invests = [...this.invests, ...data.items.filter(i => i.latitude && i.longitude)]
          }
        )

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
          zoom: JSON.stringify(this.zoom)
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
    onList(type, list) {
      list.forEach( it => {
        if(!it.social_commitments || !it.social_commitments.length) return
        it.social_commitments.forEach(s => {
          this.social_commitments[type][s.id] = this.social_commitments[type][s.id] || []
          if(this.social_commitments[type][s.id].find(v => v.id == s.id)) return
          this.social_commitments[type][s.id].push(it)
        })
      })
      console.log('onfilterlist', type,list, this.social_commitments[type])
    },
    getSdgsFromSocialCommitment(sid) {
      return this.social_commitments.sdgs && this.social_commitments.sdgs[sid]
    },
    getFootprintsFromSocialCommitment(sid) {
      return this.social_commitments.footprints && this.social_commitments.footprints[sid]
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
      console.log('project locations', this.filters.projects, this.projects.filter(p => this.filters.projects.indexOf(p.id) > -1 ), this.projects)
      if(this.filters.projects && this.filters.projects.length)
        return this.projects.filter(p => this.filters.projects.indexOf(p.id) > -1 )
      return this.projects
    },
    investLocations() {
      return this.invests.map((i) => [i.latitude, i.longitude, this.filters.socialHeat ? 10 : i.amount])
    }
  },
  mounted() {
    if(this.$route.query.filters) {
      try{ this.filters = JSON.parse(this.$route.query.filters) } catch(e){}
    }
    if(this.$route.query.center) {
      try{ this.center = JSON.parse(this.$route.query.center) } catch(e){}
    }
    if(this.$route.query.zoom) {
      try{ this.zoom = JSON.parse(this.$route.query.zoom) } catch(e){}
    }
    console.log('mounted', 'center',this.center, 'zoom', this.zoom)
    // mapObject is not available directly in vue's mounted hook.
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject // work as expected
      // Check querystring
      this.loadProjects(this.filters)
      if(this.filters.projects && this.filters.projects.length)
        this.loadInvests(this.filters.projects)

    })
  }
}
</script>

<style>
.progress-wrap {
  height:30px;
  padding:8px 0 11px;
}
.icon-sdg {
    width: 32px;
    height: 32px;
    margin: 0 2px 2px 0;
}
.icon-footprint {
    width: auto;
    height: 32px;
    margin: 0 2px 2px 0;
}
</style>