<template>
  <div>
    <b-row>
        <b-col class="filter-footprints">

            <b-row>
                <b-btn class="col" v-for="f in footprintList" :key="f.id" @click="onChange('footprint', f)" variant="default" :pressed="!!hasFootprint(f)"><img class="image-footprint" :src="f['icon-url']" :title="f.name"></b-btn>
            </b-row>

            <!-- <multiselect v-model="filters.footprints" :options="footprintList" @input="onChange" :multiple="true" label="name" track-by="name" placeholder="Filter projects by footprint">
                <template slot="tag" slot-scope={option,remove}><span class="multiselect__tag"><span><img :src="option['icon-url']" class="image-circle"> {{ option.name }}</span> <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon" @keydown.enter.prevent="remove(option)" @mousedown.prevent="remove(option)"></i></span></template>
                <template slot="option" slot-scope={option}><img :src="option['icon-url']" class="image-circle"> {{ option.name }}</template>
            </multiselect> -->
        </b-col>
        <b-col :cols="hasFootprints ? 6 : 2" class="filter-sdgs">

            <multiselect v-if="hasFootprints" v-model="filters.sdgs" :options="filteredSdgList" @input="onChange" :multiple="true" label="name" track-by="name" placeholder="Filter projects by SDG">
                <template slot="tag" slot-scope={option,remove}><span class="multiselect__tag"><span><img :src="option['icon-url']" class="image-circle"> {{ option.name }}</span> <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon" @keydown.enter.prevent="remove(option)" @mousedown.prevent="remove(option)"></i></span></template>
                <template slot="option" slot-scope={option}><img :src="option['icon-url']" class="image-circle"> {{ option.name }}</template>
            </multiselect>

            <p v-else class="text-muted"><em>Filter by footprints</em></p>

        </b-col>
    </b-row>
    <b-row>
        <b-col class="filter-projects">
            <multiselect v-model="filters.projects" :options="projectList" @input="onChange" :multiple="true" label="name" track-by="name" placeholder="Show invests for some projects">
                <template slot="tag" slot-scope="{option,remove}"><span class="multiselect__tag"><span><img :src="option['image-url']" class="image-circle"> {{ option.name }}</span> <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon" @keydown.enter.prevent="remove(option)"  @mousedown.prevent="remove(option)"></i></span></template>
                <template slot="option" slot-scope="{option}"><img :src="option['image-url']" class="image-circle"> {{ option.name }} - <strong>{{ option.amount }} €</strong></template>
            </multiselect>
        </b-col>

        <b-col cols="2" v-if="hasProjects">
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
    sdgList: {
        type: Array,
        default: () => []
    },
    footprintList: {
        type: Array,
        default: () => []
    },
    emitEvent: {
        type: String,
        default: 'filter'
    }
  },
  components: {
    Switches,
    Multiselect
  },
  data() {
    return {
        filters: {
            projects: [],
            sdgs: [],
            footprints:[],
            socialHeat: false
        }
    }
  },
  methods: {
    onChange(filter, f) {
      if(filter==='footprint') {
        this.filters.footprints = this.toggle(this.filters.footprints, f)
        }
        console.log('onchange', filter, 'event:',this.emitEvent, 'filters', this.filters)
        if(this.emitEvent) this.$emit(this.emitEvent, this.filters)
    },
    toggle(list, el) {
      if(!Array.isArray(list)) list = []
      if(list.find(v => v.id==el.id))
          list = list.filter(v => v.id!=el.id)
      else
          list.push(el)
      return list
    },
    hasFootprint(f) {
      return this.hasFootprints && !!this.filters.footprints.find(v => v.id==f.id)
    },
    setActiveFilters() {
      this.filters.socialHeat = !!this.queryFilters.socialHeat
      // Load projects from props, rebuild the model
      if(Array.isArray(this.queryFilters.projects) && this.queryFilters.projects.length != this.filters.projects.length) {
        this.filters.projects = []
        this.queryFilters.projects.forEach(p => {
          let it = this.projectList.find(v => v.id == p)
          if(it) {
              this.filters.projects.push(it)
              return
          }
          // // api search
          // this.$goteo.getProjects({project:p}, r => {
          //     if(r) {
          //         console.log('fetch project', r, r.items[0])
          //         this.projectList.push(r.items[0])
          //         this.filters.projects.push(r.items[0])
          //     }
          // })
        })
      }
      console.log('projectList', this.projectList, this.queryFilters.projects, this.filters.projects)
      // Load footprints from props, rebuild the model
      if(Array.isArray(this.queryFilters.footprints) && this.queryFilters.footprints.length != this.filters.footprints.length) {
        this.filters.footprints = []
        this.queryFilters.footprints.forEach(p => {
          let it = this.footprintList.find(v => v.id == p)
          if(it) {
              this.filters.footprints.push(it)
              return
          }
        })
      }
      // Load sdgs from props, rebuild the model
      if(Array.isArray(this.queryFilters.sdgs) && this.queryFilters.sdgs.length != this.filters.sdgs.length) {
        this.filters.sdgs = []
        this.queryFilters.sdgs.forEach(p => {
            let it = this.sdgList.find(v => v.id == p)
            if(it) {
                this.filters.sdgs.push(it)
                return
            }
        })
      }
    }
  },
  computed: {
      hasFootprints() {
          return this.filters.footprints && this.filters.footprints.length
        //   return this.activeFootprints.length > 0
      },
      hasSdgs() {
          return this.filters.sdgs && this.filters.sdgs.length
      },
      hasProjects() {
          return this.filters.projects && this.filters.projects.length
      },
      filteredSdgList() {
          let footprints = this.hasFootprints ? this.filters.footprints.map(f => f.id) : []
          console.log('footprints',footprints)
          return this.sdgList.filter(v => v.footprints.find(f => footprints.indexOf(f.id)))
      },
      queryFilters() {
        return this.$route.query.filters ? JSON.parse(this.$route.query.filters) : {}
      }
  },
  mounted() {
    this.setActiveFilters()
    // compute query filters
    console.log('query filters', this.queryFilters, this.projectList, this.filters.projects)
  },
  watch: {
    '$route.query.filters'() {
        console.log('change query string',this.$route.query)
        this.setActiveFilters()
    },
    projectList() {
        console.log('change projectList',this.projectList)
        this.setActiveFilters()
    },
    footprintList() {
        console.log('change footprintList',this.footprintList)
        this.setActiveFilters()
    },
    sdgList() {
        console.log('change sdgList',this.sdgList)
        this.setActiveFilters()
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
    width: 100%;
    height: auto;
    filter: gray; /* IE6-9 */
    -webkit-filter: grayscale(1); /* Google Chrome, Safari 6+ & Opera 15+ */
    filter: grayscale(1)
}

.btn.active .image-footprint {
  /* background-color: rgb(43,157,155); */
  -webkit-filter: grayscale(0);
  filter: none;
}

.col-2 {
  flex-shrink: 1;
  transition: all 400ms ease;
}
.col-6 {
  flex-grow: 1;
  transition: all 400ms ease;
}
</style>
