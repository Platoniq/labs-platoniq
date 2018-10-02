import Projects from "./components/Projects.vue"
import Initiatives from "./components/Initiatives.vue"
const Wrapper = {
  template: '<router-view></router-view>'
}

export default [
    {
      name: 'goteo',
      path: '/goteo',
      component: Wrapper,
      meta: {
        text: 'Goteo'
      },
      children: [{
        name: 'goteo-projects',
        path: 'projects',
        component: Projects,
        meta: {
          text: 'Projects'
        }
      }]
    },
    {
      name: 'decidim',
      path: '/decidim',
      component: Wrapper,
      meta: {
          text: 'Decidim'
      },
      children: [{
        name: 'decidim-initiatives',
        path: 'initiatives/:id?/:view?/:project?',
        component: Initiatives,
        meta: {
            text: 'Initiatives'
        }
      }]
    }
  ]