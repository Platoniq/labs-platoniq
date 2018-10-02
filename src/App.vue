
<template>
  <div id="app">
    <header class="header">
      <NavHeader :menu="menu" :section="section" :loading="loading" />
    </header>

    <main>
      <b-container>
        <b-breadcrumb :items="breadcrumb"/>
        <initiatives v-on:section-loaded="onChangeSection" v-on:data-loading="onLoading" />
      </b-container>
    </main>
  </div>
</template>

<script>
import NavHeader from './components/NavHeader.vue'
import initiatives from './components/Initiatives.vue'

export default {
  name: 'app',
  components: {
    NavHeader,
    initiatives
  },
  data() {
    return {
      loading: '',
      section: '',
      title: '',
      breadcrumb: [],
      menu: []
    }
  },
  methods: {
    onChangeSection(section, title, submenu) {
      this.breadcrumb = [this.breadcrumb[0]||''];
      this.section = section
      if(title) {
        this.title = title
        this.breadcrumb[0] = {text: title, to: {name: section}}
      }
      if(submenu) {
        let item = {
          id: section,
          text: this.title || section,
          menu: submenu,
        }
        let menu = this.menu.find(m => section === m.id)
        if(menu) menu = item
        else this.menu.push(item)
        this.breadcrumb[1] = item.menu.find(m => this.$route.params.id === m.id)
      }
    },
    onLoading(loading) {
      this.loading = loading
    }
  },
  watch: {
    $route (to, from){
      let menu = this.menu.find(m => to.name === this.section)
      if(menu) {
        this.breadcrumb[1] = menu.menu.find(m => to.params.id === m.id)
        // console.log('route change', to.params.id, menu.text,this.breadcrumb[1].text)
      }

    }
  }
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
</style>