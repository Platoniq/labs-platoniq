<template>
  <b-navbar toggleable="md" type="dark" variant="info">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="/">
      Platoniq Labs
    </b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item-dropdown v-for="m in menu" :key="m.id" :text="m.text" :active="true">
          <b-dropdown-item v-for="s in m.menu" :key="s.id" :to="{name: 'initiatives', params: {id: s.id}}">
            {{ s.text }}
          </b-dropdown-item>
        </b-nav-item-dropdown>

      </b-navbar-nav>
    </b-collapse>

    <b-navbar-nav right><b-nav-item><v-icon v-if="loading" name="sync" spin/></b-nav-item></b-navbar-nav>

  </b-navbar>
</template>


<script>
export default {
  props: ['section', 'menu', 'loading'],
}
</script>