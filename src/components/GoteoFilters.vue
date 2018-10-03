<template>
  <div>

    <switches v-model="socialHeat" text-disabled="Amount heat" text-enabled="Social heat" color="info" type-bold="true" theme="bootstrap"></switches>

  </div>
</template>

<script>
import Switches from 'vue-switches'

export default {
  name: "GoteoFilters",
  components: {
    Switches
  },
  data() {
    return {
        socialHeat: false
    }
  }
}
</script>

<style>
</style>
