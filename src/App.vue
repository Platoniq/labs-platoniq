
<template>
  <div id="app">
    <header class="header">
      <b-navbar toggleable="md" type="light" variant="light">
        <b-container>
          <b-navbar-brand href="#">Platoniq Labs</b-navbar-brand>
        </b-container>
      </b-navbar>
    </header>

    <main>
      <b-container>
        <initiatives />
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
  }
}
</script>

<style>
.header {
  margin-bottom: 2rem;
}
</style>