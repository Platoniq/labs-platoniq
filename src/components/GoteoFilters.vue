<template>
  <div>
    <b-row>
        <b-col cols="12">
            <multiselect v-model="filters.projects" :options="projectList" @input="onProject" :multiple="true" label="name" track-by="name" placeholder="Select some projects...">
                <template slot="option" slot-scope="props"><img :src="props.option['image-url']" class="image-circle"> {{ props.option.name }} - <strong>{{ props.option.amount }} €</strong></template>
            </multiselect>
        </b-col>

        <b-col cols="12" v-if="filters.projects.length">
            <switches v-model="filters.socialHeat" text-disabled="Amount heat" text-enabled="Social heat" color="info" type-bold="true" theme="bootstrap"></switches>
        </b-col>
    </b-row>
  </div>
</template>

<script>
import Switches from 'vue-switches'
import Multiselect from 'vue-multiselect'

export default {
  name: "GoteoFilters",
  props: ['projectList'],
  components: {
    Switches,
    Multiselect
  },
  data() {
    return {
        filters: {
            socialHeat: false,
            projects: [], // selected projects
        }
    }
  },
  methods: {
      onProject(projects) {
          console.log('project selected',projects, this.filters)
          this.$emit('filter', this.filters)
      }
  }
}
</script>


<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
.multiselect--active {
  z-index: 10000;
}
.image-circle {
    width: 32px;
    height: 32px;
    border-radius:50%;
}
</style>