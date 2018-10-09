<template>

<div style="margin:0">

  <b-jumbotron header="Platoniq labs" lead="Experimental data visualizations from social participatory &amp; crowdfunding platforms">
    <div class="banner row"></div>
    <b-row>
      <b-btn class="col" variant="primary" :to="{name:'goteo-projects'}">View Goteo Projects</b-btn>
      <b-btn class="col" variant="primary" :to="{name:'decidim-initiatives'}">View Decidim Initiatives</b-btn>
    </b-row>
  </b-jumbotron>

  <h4>Resources:</h4>
  <p>This page source code: <a href="https://github.com/Platoniq/labs-platoniq"><v-icon name="brands/github"/> https://github.com/Platoniq/labs-platoniq</a></p>
  <p>Goteo API Docs: <a href="http://developers.goteo.org/doc/">http://developers.goteo.org/doc/</a></p>
  <p>Decidim Barcelona API: <a href="https://www.decidim.barcelona/api/docs">https://www.decidim.barcelona/api/docs</a></p>

  <p>&copy; Platoniq 2018</p>
</div>

</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style lang="scss">
.banner {
  margin:50px 0;
  background-image: url(/static/img/demo.jpg);
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  height: 50px;
  width: 100%;
}
</style>
