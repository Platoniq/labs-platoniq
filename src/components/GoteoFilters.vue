<template>
  <div>
    <b-row>
        <b-col cols="6" class="filter-footprints">

            <div>
                <b-button v-for="f in footprintList" :key="f.id" @click="filters.footprints=toggle(filters.footprints, f);onChange()" variant="default" :pressed="!!filters.footprints.find(v => v.id==f.id)"><img class="image-footprint" :src="f['icon-url']" :title="f.name"></b-button>
            </div>

            <!-- <multiselect v-model="filters.footprints" :options="footprintList" @input="onChange" :multiple="true" label="name" track-by="name" placeholder="Filter projects by footprint">
                <template slot="tag" slot-scope={option,remove}><span class="multiselect__tag"><span><img :src="option['icon-url']" class="image-circle"> {{ option.name }}</span> <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon" @keydown.enter.prevent="remove(option)" @mousedown.prevent="remove(option)"></i></span></template>
                <template slot="option" slot-scope={option}><img :src="option['icon-url']" class="image-circle"> {{ option.name }}</template>
            </multiselect> -->
        </b-col>
        <b-col cols="6" class="filter-sdgs">
            <multiselect v-if="filters.footprints && filters.footprints.length" v-model="filters.sdgs" :options="filteredSdgList" @input="onChange" :multiple="true" label="name" track-by="name" placeholder="Filter projects by SDG">
                <template slot="tag" slot-scope={option,remove}><span class="multiselect__tag"><span><img :src="option['icon-url']" class="image-circle"> {{ option.name }}</span> <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon" @keydown.enter.prevent="remove(option)" @mousedown.prevent="remove(option)"></i></span></template>
                <template slot="option" slot-scope={option}><img :src="option['icon-url']" class="image-circle"> {{ option.name }}</template>
            </multiselect>
        </b-col>
        <b-col cols="10" class="filter-projects">
            <multiselect v-model="filters.projects" :options="projectList" @input="onChange" :multiple="true" label="name" track-by="name" placeholder="Show invests for some projects">
                <template slot="tag" slot-scope="{option,remove}"><span class="multiselect__tag"><span><img :src="option['image-url']" class="image-circle"> {{ option.name }}</span> <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon" @keydown.enter.prevent="remove(option)"  @mousedown.prevent="remove(option)"></i></span></template>
                <template slot="option" slot-scope="{option}"><img :src="option['image-url']" class="image-circle"> {{ option.name }} - <strong>{{ option.amount }} €</strong></template>
            </multiselect>
        </b-col>

        <b-col cols="2" v-if="filters.projects && filters.projects.length">
            <switches v-model="filters.socialHeat" @input="onChange" text-disabled="Amount heat" text-enabled="Social heat" color="info" type-bold="true" theme="bootstrap"></switches>
        </b-col>
    </b-row>
  </div>
</template>

<script>
import Switches from 'vue-switches'
import Multiselect from 'vue-multiselect'

export default {
  name: "GoteoFilters",
  props: {
    projectList: {
        type: Array,
        default: () => []
    },
    filters: {
        type: Object,
        default: () => ({
            socialHeat: false,
            projects: [], // selected projects
            footprints: [], // selected footprints
            sdgs: [], // selected sdgs
        })
    },
    emitEvent: {
        type: String,
        default: 'filter'
    },
    toQueryString: {
        type: Boolean,
        default: false
    }
  },
  components: {
    Switches,
    Multiselect
  },
  data() {
    return {
        footprintList: [],
        sdgList: []
    }
  },
  methods: {
      onChange() {
          if(this.emitEvent) this.$emit(this.emitEvent, this.filters)
          if(this.toQueryString) {
            console.log('to query string',this.$route, this.$router)
            this.$router.push({ name: this.$route.name, query: {filters: JSON.stringify(this.filters)} })
            // this.$router.push({ name: this.$route.name, query: this.filters.map() })
          }
      },
      toggle(list, el) {
        if(list.find(v => v.id==el.id))
            list = list.filter(v => v.id!=el.id)
        else
            list.push(el)
        return list
      }
  },
  computed: {
      filteredSdgList() {
          let footprints = this.filters.footprints.map(f => f.id)
          console.log(footprints)
          return this.sdgList.filter(v => v.footprints.find(f => footprints.indexOf(f.id)))
      }
  },
  mounted() {
    if(!this.footprintList.length) {
        this.axios
        .get('/footprints/')
        .then(response => {
            console.log('got goteo footprints', response)
            this.footprintList = response.data.items
        })
        .catch(error => {
            console.error('Goteo API error while fetching footprints', error)
        })
    }
    if(!this.sdgList.length) {
        this.axios
        .get('/sdgs/')
        .then(response => {
            console.log('got goteo sdgs', response)
            this.sdgList = response.data.items
        })
        .catch(error => {
            console.error('Goteo API error while fetching SDGs', error)
        })
    }
  }
}
</script>


<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
.multiselect--active {
  z-index: 10000;
}
.filter-projects .multiselect__option--highlight,.filter-projects .multiselect__option--highlight::after,.filter-projects .multiselect__tag {
    background-color: rgb(43,157,155);
}
.image-circle {
    width: 32px;
    height: 32px;
    border-radius:50%;
}
.image-footprint {
    width: auto;
    height: 48px;
}
.btn.active {
    background-color: rgb(43,157,155);
}
</style>
