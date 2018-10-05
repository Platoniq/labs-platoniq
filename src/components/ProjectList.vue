<template>
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
      <a :href="item['project-url']" target="_blank"><v-icon alt="Project page" name="link"/></a>
  </template>
  </b-table>

</template>

<script>

export default {
  name: "ProjectList",
  props: {
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
      return this.social_commitments.sdgs && this.social_commitments.sdgs[sid]
    },
    getFootprintsFromSocialCommitment(sid) {
      return this.social_commitments.footprints && this.social_commitments.footprints[sid]
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