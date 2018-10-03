
<template>
  <div>

      <h2>Goteo projects</h2>

      <filters></filters>

      <l-map ref="map" style="height: 500px" :zoom="zoom" :center="center" @move="mapMove">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

      <l-marker-cluster :options="clusterOptionsProject">
        <l-marker v-for="p in projects" :key="p.id" v-if="project===p.id || !project" :lat-lng="[p.latitude,p.longitude]" :zIndexOffset="1000000" @click="gotoProject(p)" :icon="getIcon('project', p)">
          <l-tooltip :content="p.name"></l-tooltip>
        </l-marker>
      </l-marker-cluster>

      <l-marker-cluster v-if="project" ref="paymentCluster" :options="clusterOptionsPayment">
        <l-marker v-for="i in invests" :key="i.id" :lat-lng="[i.latitude,i.longitude]" :options="{alt:i.amount}" :icon="getIcon('euro',i)">
          <l-tooltip :content="i.amount + '€'"></l-tooltip>
        </l-marker>
      </l-marker-cluster>

      <LeafletHeatmap v-if="project" :lat-lngs="investLocations"></LeafletHeatmap>
    </l-map>

    <div class="text-muted">{{info}}</div>
    <b-progress v-if="percent<100" :max="100" animated variant="info">
      <b-progress-bar :value="percent" :label="percent + '%'" ></b-progress-bar>
    </b-progress>

  </div>

</template>

<script>
import L from 'leaflet';
import { LMap, LTileLayer, LMarker,LPopup,LTooltip } from 'vue2-leaflet';
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
      percent:0,
      info:'',
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
      project:null,
      url:'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  methods: {
    onLoading(loading) { //listen the children, pass it to the parent
      this.$emit('data-loading', loading)
    },
    mapMove(ev) {
      console.log('move map',ev)
      this.loadProjects()
    },
    loadProjects() {
      this.projects = []
      let center = this.map.getCenter();
      let bounds = this.map.getBounds();
      let distance = Math.min(500,Math.max(1,Math.round(center.distanceTo(bounds.getSouthWest()) / 1000)))
      console.log('load projects',center,distance,this.zoom)
      this.$goteo
        .getProjects({location: center.lat + ',' + center.lng + ',' + distance}, data => {
            console.log(data.meta)
            this.info = data.meta.total + ' Projects'
            this.percent = parseInt(100 * (data.items.length + data.meta.limit * data.meta.page) / data.meta.total)
            return this.projects = [...this.projects, ...data.items]
          }
        )

    },
    getIcon(type, ob) {
      let ops ={
        iconSize: [38, 38]
      }
      if(type === 'signature') ops.iconUrl = 'static/img/pin-signature.svg'
      // if(type === 'project') ops.iconUrl = 'static/img/pin-project.svg'
      if(type === 'project') {
        ops.iconUrl = ob['image-url']
        ops.className = 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive image-project'
      }
      if(type === 'euro') {
        return L.divIcon({ html: '<div><span>' + ob.amount +'€</span></div>', className: 'marker-cluster marker-cluster-payment', iconSize: L.point(40, 40) });
      }
      return L.icon(ops)
    }
  },
  mounted() {
    // mapObject is not available directly in vue's mounted hook.
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject // work as expected
      this.loadProjects()
    })
  }
}
</script>