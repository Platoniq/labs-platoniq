
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
        console.log('route change', to.params.id, menu.text,this.breadcrumb[1].text)
      }

    }
  }
}
</script>

<style>

@import "../node_modules/leaflet/dist/leaflet.css";
.header {
  margin-bottom: 2rem;
}
table.muted {
  opacity: 0.6 !important;
}
</style>