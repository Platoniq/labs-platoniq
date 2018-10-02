import Projects from "./components/Projects.vue"
import Initiatives from "./components/Initiatives.vue"

export default [
    {
      name: 'goteo',
      path: '/goteo',
      meta: {
        text: 'Goteo'
      },
      children: [{
        name: 'goteo-projects',
        path: 'projects',
        meta: {
          text: 'Projects'
        },
        component: Projects
      }]
    },
    {
      name: 'decidim',
      path: '/decidim',
      meta: {
          text: 'Decidim'
      },
      children: [{
        name: 'decidim-initiatives',
        path: 'initiatives/:id?/:view?/:project?',
        component: Initiatives,
        meta: {
            text: 'Initiatives'
        },
      }]
    }
  ]