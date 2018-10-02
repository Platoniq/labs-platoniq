
<template>
  <div>

      <h2>Goteo projects</h2>

  </div>
</template>

<script>

export default {
  components: {
  },
  data() {
    return {
      title: 'Goteo Projects'
    }
  },
  methods: {
    onLoading(loading) { //listen the children, pass it to the parent
      this.$emit('data-loading', loading)
    }
  }
}
</script>