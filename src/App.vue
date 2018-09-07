
<template>
  <div id="app">
    <header class="header">
      <b-navbar toggleable="md" type="light" variant="light">
        <b-container>
          <b-navbar-brand href="#">Platoniq Labs</b-navbar-brand>
          <v-icon v-if="loading" name="sync" spin/>
          {{ section }}
        </b-container>
      </b-navbar>
    </header>

    <main>
      <b-container>
        <initiatives v-on:section-loaded="onChangeSection" v-on:data-loading="onLoading" />
      </b-container>
    </main>
  </div>
</template>

<script>
import initiatives from './components/Initiatives.vue'

export default {
  name: 'app',
  components: {
    initiatives
  },
  data() {
    return {
      loading: '',
      section: ''
    }
  },
  methods: {
    onChangeSection(section) {
      this.section = section
    },
    onLoading(loading) {
      this.loading = loading
    }
  }
}
</script>

<style>
.header {
  margin-bottom: 2rem;
}
table.muted {
  opacity: 0.6 !important;
}
</style>