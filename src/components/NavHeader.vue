<template>
  <b-navbar toggleable="md" type="dark" variant="info">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="/">
      Platoniq Labs
    </b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>

        <b-nav-item v-for="m in routes" v-if="!m.children" :key="m.name" :active="section==m.name" :to="{name: m.name}">
          {{ m.meta && m.meta.text || m.name }}
        </b-nav-item>

        <b-nav-item-dropdown v-for="m in routes" v-if="m.children" :key="m.id" :text="m.meta && m.meta.text || m.name" :class="section==m.name ? 'active' : ''">
          <b-dropdown-item v-for="s in m.children" :key="s.name" :to="{name: s.name}">
            {{ s.meta && s.meta.text || s.name }}
          </b-dropdown-item>
        </b-nav-item-dropdown>

      </b-navbar-nav>
    </b-collapse>

    <b-navbar-nav right><b-nav-item><v-icon v-if="loading" name="sync" spin/></b-nav-item></b-navbar-nav>

  </b-navbar>
</template>


<script>
import routes from '../routes.js'

export default {
  props: ['loading'],
  data() {
    return {
      routes: routes,
    }
  },
  computed: {
    section() {
        return this.$route.matched.length && this.$route.matched[0].name
    }
  }
}
</script>