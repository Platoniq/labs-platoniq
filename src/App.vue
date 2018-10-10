
<template>
  <div id="app">
    <header class="header">
      <NavHeader/>
    </header>

    <main>
      <b-container>
        <b-breadcrumb v-if="breadcrumb.length" :items="breadcrumb"/>

        <!-- component matched by the route will render here -->
        <router-view></router-view>

    {{getLoaders}}

      </b-container>
    </main>
  </div>
</template>

<script>
import NavHeader from './components/NavHeader.vue'
import routes from './routes.js'

export default {
  name: 'app',
  components: {
    NavHeader
  },
  data() {
    return {
      breadcrumb: []
    }
  },
  methods: {
    setBreadcrumb(to) {
      to = to || this.$route
      if(to.name == 'home') return
      this.breadcrumb = to.matched.map(m => m.meta && m.meta.text || m.name)
    }
  },
  watch: {
    $route (to, from){
      this.setBreadcrumb(to)
    }
  },
  mounted() {
    this.setBreadcrumb()
  }
}
</script>

<style>

@import "~leaflet/dist/leaflet.css";
@import "~leaflet.markercluster/dist/MarkerCluster.css";
@import "~leaflet.markercluster/dist/MarkerCluster.Default.css";

#map {
  height: 500px;
}
.header {
  margin-bottom: 2rem;
}
table.muted {
  opacity: 0.6 !important;
}
.btn {
  margin:4px;
}
.marker-cluster-signature,.marker-cluster-signature div {
	background-color: rgba(42,129,202,0.6);
}
.marker-cluster-project,.marker-cluster-project div {
	background-color: rgba(43,157,155,0.6);
  /* color:#fff; */
}
.marker-cluster-payment,.marker-cluster-payment div {
	/* background-color: rgba(171,0,11,0.6); */
	background-color: rgba(0,0,0,0.1);
  color:#fff;
  font-weight: 600;
  text-shadow:1px 1px 2px #000;
}
canvas.leaflet-heatmap-layer {
  opacity: 0.6;
}
img.image-project {
  border-radius: 50%;
}
.progress-wrap {
  height:30px;
  padding:8px 0 11px;
}

</style>
