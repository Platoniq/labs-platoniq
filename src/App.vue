
<template>
  <div id="app">
    <header class="header">
      <NavHeader :section="section" :loading="loading" />
    </header>

    <main>
      <b-container>
        <h2 v-if="title">{{ title }}</h2>
        <b-breadcrumb v-if="breadcrumb.length" :items="breadcrumb"/>

        <router-view></router-view>

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
    NavHeader,
  },
  data() {
    return {
      loading: '',
      section: '',
      title: 'Platoniq Labs',
      breadcrumb: []
    }
  },
  methods: {
    onLoading(loading) {
      this.loading = loading
    },
    setBreadcrumb(to) {
      to = to || this.$route
      this.breadcrumb = to.matched.map(m => m.meta && m.meta.text || m.name)
      if(this.breadcrumb.length) title = this.breadcrumb[0]
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

  // watch: {
  //   $route (to, from){
  //     console.log('route change', to, this.breadcrumb)
  //     let menu = this.menu.find(m => to.name === this.section)
  //     if(menu) {
  //       this.breadcrumb[1] = menu.menu.find(m => to.params.id === m.id)
  //     }

  //   }
  // }
}
</script>

<style>

@import "~leaflet/dist/leaflet.css";
@import "~leaflet.markercluster/dist/MarkerCluster.css";
@import "~leaflet.markercluster/dist/MarkerCluster.Default.css";
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
.marker-cluster-payment,.marker-cluster-payment div {
	background-color: rgba(171,0,11,0.6);
  color:#fff;
}

</style>