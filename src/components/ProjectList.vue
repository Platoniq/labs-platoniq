<template>
  <div>

    <b-row>
      <b-col>
        <b-btn v-if="projects.length" @click="downloadCsv()"><v-icon name="file-excel"/> Download CSV</b-btn>
      </b-col>
      <b-col class="text-right">
        <social-sharing inline-template>
          <b-button-group>
            <network network="facebook">
              <b-btn title="Facebook" variant="secondary"><v-icon name="brands/facebook"/></b-btn>
            </network>
            <network network="twitter">
              <b-btn title="Twitter" variant="secondary"><v-icon name="brands/twitter"/></b-btn>
            </network>
            <network network="telegram">
              <b-btn title="Telegram" variant="secondary"><v-icon name="brands/telegram"/></b-btn>
            </network>
            <network network="whatsapp">
              <b-btn title="Whatsapp" variant="secondary"><v-icon name="brands/whatsapp"/></b-btn>
            </network>
          </b-button-group>
        </social-sharing>

      </b-col>
    </b-row>
    <v-icon v-if="isLoading('projects')" name="spinner" spin/>

    <b-table v-if="projects.length" bordered hover :items="projects" :fields="fields" :tbody-tr-class="rowClass">
      <template v-slot:cell(image)="d">
        <img :src="d.item['image-url']" class="icon-project">
      </template>
      <template v-slot:cell(name)="d">
        <p>{{ d.item.name }}
          <em class="float-right text-muted">{{ getDate(d.item['date-published']) }}</em>
        </p>
        <p class="text-muted">{{ d.item['description-short'] }}</p>
        <b-row>
          <b-col cols="7">
            <img class="icon-footprint" v-for="sdg in getFootprintsFromSocialCommitment(d.item['social-commitment-id'])" :key="sdg.id" :src="sdg['icon-url']" :title="sdg.name">
          </b-col>
          <b-col>
            <img class="icon-sdg" v-for="sdg in getSdgsFromSocialCommitment(d.item['social-commitment-id'])" :key="sdg.id" :src="sdg['icon-url']" :title="sdg.name">
          </b-col>
        </b-row>
    </template>
    <template v-slot:cell(amount)="d">
        {{ d.item.amount }} €
    </template>
    <template v-slot:cell(links)="d">
        <b-btn title="Goto project page" :href="d.item['project-url']" target="_blank"><v-icon alt="Project page" name="link"/></b-btn>
        <b-btn :title="inFilters(d.item) ? 'Remove this project from the heat map' : 'Show heat map for this project'" variant="info" @click="gotoProject(d.item)" exact :pressed="inFilters(d.item)"><v-icon alt="Show invests" name="donate"/></b-btn>
    </template>
    </b-table>
  </div>
</template>

<script>
import Papa from 'papaparse'
import moment from 'moment'

export default {
  name: "ProjectList",
  props: {
    project: {
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
          key: 'image',
          label: 'Image'
        },
        {
          key: 'name',
          label: 'Name',
          sortable: true
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
    rowClass(item, type) {
      if (!item || type !== 'row') return
      if (this.project.includes(item.id)) return 'table-info'
    },
    getDate(date) {
      return moment(date).format('MMMM YYYY')
    },
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
    gotoProject(p) {
      console.log('goto project', p);
      this.$emit('goto-project', p)
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

<style lang="scss">
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
.icon-project {
  width: 150px;
  height: auto;
}
</style>
