<template>
  <div>

    <b-btn v-if="projects.length" @click="downloadCsv()"><v-icon name="file-excel"/> Download CSV</b-btn>
    <v-icon v-if="loading.indexOf('projects')>-1" name="spinner" spin/>

    <b-table v-if="projects.length" bordered hover :items="projects" :fields="fields">
      <template slot="name" slot-scope="{item}">
          {{ item.name }}
      </template>
      <template slot="description" slot-scope="{item}">
        <p class="text-muted">{{ item['description-short'] }}</p>
        <b-row>
        <b-col cols="7">
            <img class="icon-footprint" v-for="sdg in getFootprintsFromSocialCommitment(item['social-commitment-id'])" :key="sdg.id" :src="sdg['icon-url']" :title="sdg.name">
        </b-col>
        <b-col>
            <img class="icon-sdg" v-for="sdg in getSdgsFromSocialCommitment(item['social-commitment-id'])" :key="sdg.id" :src="sdg['icon-url']" :title="sdg.name">
        </b-col>
        </b-row>
    </template>
    <template slot="amount" slot-scope="{item}">
        {{ item.amount }} €
    </template>
    <template slot="links" slot-scope="{item}">
        <b-btn title="Goto project page" :href="item['project-url']" target="_blank"><v-icon alt="Project page" name="link"/></b-btn>
        <b-btn :title="inFilters(item) ? 'Remove this project from the heat map' : 'Show heat map for this project'" variant="info" :to="toggleRouteForProject(item)" exact :pressed="inFilters(item)"><v-icon alt="Show invests" name="donate"/></b-btn>
    </template>
    </b-table>
  </div>
</template>

<script>
import Papa from 'papaparse'

export default {
  name: "ProjectList",
  props: {
    loading: {
        type: Array,
        default: () => []
    },
    projects: {
      type: Array,
      default: () => []
    },
    sdgs: {
      type: Array,
      default: () => []
    },
    footprints: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      social_commitments: {
        sdgs: {},
        footprints: {}
      },
      fields: [
        {
          key: 'name',
          label: 'Name',
          sortable: true
        },
        {
          key: 'description',
          label: 'Description'
        },
        {
          key: 'amount',
          label: 'Amount',
          sortable: true
        },
        {
          key: 'links',
          label: 'Links'
        }
      ],
    }
  },
  methods: {
    getSdgsFromSocialCommitment(sid) {
      return this.social_commitments.sdgs && this.social_commitments.sdgs[sid] || []
    },
    getFootprintsFromSocialCommitment(sid) {
      return this.social_commitments.footprints && this.social_commitments.footprints[sid] || []
    },
    onList(type, list) {
      list.forEach( it => {
        if(!it.social_commitments || !it.social_commitments.length) return
        it.social_commitments.forEach(s => {
          this.social_commitments[type][s.id] = this.social_commitments[type][s.id] || []
          if(this.social_commitments[type][s.id].find(v => v.id == s.id)) return
          this.social_commitments[type][s.id].push(it)
        })
      })
      console.log('onfilterlist', type,list, this.social_commitments[type])
    },
    getFilters() {
      let filters = {}
      try { filters = JSON.parse(this.$route.query.filters) } catch(e){}
      filters.projects = Array.isArray(filters.projects) ? filters.projects : []
      return filters
    },
    inFilters(item) {
      return this.getFilters().projects.indexOf(item.id) > -1
    },
    toggleRouteForProject(p) {
      let filters = this.getFilters()
      let center = []
      const zoom = this.$route.query.zoom
      const pos = filters.projects.indexOf(p.id)
      if(pos > -1) filters.projects.splice(pos, 1)
      else filters.projects.push(p.id)
      try { center = JSON.parse(this.$route.query.center) } catch(e){}

      return {
        name: this.$route.name,
        query: {filters: JSON.stringify(filters), zoom: zoom, center: JSON.stringify(center)}
      }
    },
    downloadCsv() {
      if(!this.projects || !this.projects.length) return
      let projects = this.projects.map(p => {
        p.footprints = this.getFootprintsFromSocialCommitment(p['social-commitment-id']).map(f => f.name)
        p.sdgs = this.getSdgsFromSocialCommitment(p['social-commitment-id']).map(f => f.name)
        return p
      })
      let csv = Papa.unparse(projects)
      if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv
      }
      let link = document.createElement('a')
      link.setAttribute('href', encodeURI(csv))
      link.setAttribute('download', projects.length + '-projects.csv')
      document.body.appendChild(link); // Required for FF
      link.click()
      document.body.removeChild(link);
    }
  },
  watch: {
    sdgs() {
      this.onList('sdgs', this.sdgs)
    },
    footprints() {
      this.onList('footprints', this.footprints)
    }
  }
}

</script>

<style>
.icon-sdg {
    width: 32px;
    height: 32px;
    margin: 0 2px 2px 0;
}
.icon-footprint {
    width: auto;
    height: 32px;
    margin: 0 2px 2px 0;
}
</style>