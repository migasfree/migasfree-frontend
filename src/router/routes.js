const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/Dashboard')
      },

      {
        path: '/computers',
        name: 'computers-dashboard',
        component: () => import('pages/computers/index')
      },
      {
        path: '/computers/results',
        name: 'computers-list',
        component: () => import('pages/computers/results/list')
      },
      {
        path: '/computers/results/:id',
        name: 'computer-detail',
        component: () => import('pages/computers/results/detail')
      },
      {
        path: '/computers/results/:id/events',
        name: 'computer-events',
        component: () => import('pages/computers/results/events')
      },
      {
        path: '/computers/results/:id/sync/simulation',
        name: 'computer-simulate',
        component: () => import('pages/computers/results/simulate')
      },

      {
        path: '/features',
        name: 'attributes-dashboard',
        component: () => import('pages/attributes/index')
      },
      {
        path: '/features/results',
        name: 'attributes-list',
        component: () => import('pages/attributes/results/list')
      },
      {
        path: '/features/results/:id',
        name: 'attribute-detail',
        component: () => import('pages/attributes/results/detail')
      },

      {
        path: '/tags',
        name: 'tags-dashboard',
        component: () => import('pages/tags/index')
      },
      {
        path: '/tags/results',
        name: 'tags-list',
        component: () => import('pages/tags/results/list')
      },
      {
        path: '/tags/add',
        name: 'tag-add',
        component: () => import('pages/tags/results/detail')
      },
      {
        path: '/tags/results/:id',
        name: 'tag-detail',
        component: () => import('pages/tags/results/detail')
      },

      {
        path: '/errors',
        name: 'errors-dashboard',
        component: () => import('pages/errors/index')
      },
      {
        path: '/errors/results',
        name: 'errors-list',
        component: () => import('pages/errors/results/list')
      },
      {
        path: '/errors/results/:id',
        name: 'error-detail',
        component: () => import('pages/errors/results/detail')
      },

      {
        path: '/fault-definitions/results',
        name: 'fault-definitions-list',
        component: () => import('pages/fault-definitions/results/list')
      },
      {
        path: '/fault-definitions/add',
        name: 'fault-definition-add',
        component: () => import('pages/fault-definitions/results/detail')
      },
      {
        path: '/fault-definitions/results/:id',
        name: 'fault-definition-detail',
        component: () => import('pages/fault-definitions/results/detail')
      },

      {
        path: '/faults',
        name: 'faults-dashboard',
        component: () => import('pages/faults/index')
      },
      {
        path: '/faults/results',
        name: 'faults-list',
        component: () => import('pages/faults/results/list')
      },
      {
        path: '/faults/results/:id',
        name: 'fault-detail',
        component: () => import('pages/faults/results/detail')
      },

      {
        path: '/users/results',
        name: 'users-list',
        component: () => import('pages/users/results/list')
      },

      {
        path: '/syncs',
        name: 'syncs-dashboard',
        component: () => import('pages/syncs/index')
      },
      {
        path: '/syncs/results',
        name: 'syncs-list',
        component: () => import('pages/syncs/results/list')
      },

      {
        path: '/status-logs',
        name: 'status-logs-dashboard',
        component: () => import('pages/status-logs/index')
      },
      {
        path: '/status-logs/results',
        name: 'status-logs-list',
        component: () => import('pages/status-logs/results/list')
      },

      {
        path: '/migrations',
        name: 'migrations-dashboard',
        component: () => import('pages/migrations/index')
      },
      {
        path: '/migrations/results',
        name: 'migrations-list',
        component: () => import('pages/migrations/results/list')
      },

      {
        path: '/packages',
        name: 'packages-dashboard',
        component: () => import('pages/packages/index')
      },
      {
        path: '/packages/results',
        name: 'packages-list',
        component: () => import('pages/packages/results/list')
      },
      {
        path: '/packages/add',
        name: 'package-add',
        component: () => import('pages/packages/results/detail')
      },
      {
        path: '/packages/results/:id',
        name: 'package-detail',
        component: () => import('pages/packages/results/detail')
      },

      {
        path: '/stores',
        name: 'stores-dashboard',
        component: () => import('pages/stores/index')
      },
      {
        path: '/stores/results',
        name: 'stores-list',
        component: () => import('pages/stores/results/list')
      },
      {
        path: '/stores/add',
        name: 'store-add',
        component: () => import('pages/stores/results/detail')
      },
      {
        path: '/stores/results/:id',
        name: 'store-detail',
        component: () => import('pages/stores/results/detail')
      },

      {
        path: '/platforms/results',
        name: 'platforms-list',
        component: () => import('pages/platforms/results/list')
      },
      {
        path: '/platforms/add',
        name: 'platform-add',
        component: () => import('pages/platforms/results/detail')
      },
      {
        path: '/platforms/results/:id',
        name: 'platform-detail',
        component: () => import('pages/platforms/results/detail')
      },

      {
        path: '/projects/results',
        name: 'projects-list',
        component: () => import('pages/projects/results/list')
      },
      {
        path: '/projects/add',
        name: 'project-add',
        component: () => import('pages/projects/results/detail')
      },
      {
        path: '/projects/results/:id',
        name: 'project-detail',
        component: () => import('pages/projects/results/detail')
      },

      {
        path: '/formulas/results',
        name: 'formulas-list',
        component: () => import('pages/formulas/results/list')
      },
      {
        path: '/formulas/add',
        name: 'formula-add',
        component: () => import('pages/formulas/results/detail')
      },
      {
        path: '/formulas/results/:id',
        name: 'formula-detail',
        component: () => import('pages/formulas/results/detail')
      },

      {
        path: '/stamps/results',
        name: 'stamps-list',
        component: () => import('pages/stamps/results/list')
      },
      {
        path: '/stamps/add',
        name: 'stamp-add',
        component: () => import('pages/stamps/results/detail')
      },
      {
        path: '/stamps/results/:id',
        name: 'stamp-detail',
        component: () => import('pages/stamps/results/detail')
      },

      {
        path: '/attribute-sets/results',
        name: 'attribute-sets-list',
        component: () => import('pages/attribute-sets/results/list')
      },
      {
        path: '/attribute-sets/add',
        name: 'attribute-set-add',
        component: () => import('pages/attribute-sets/results/detail')
      },
      {
        path: '/attribute-sets/results/:id',
        name: 'attribute-set-detail',
        component: () => import('pages/attribute-sets/results/detail')
      },
    ],
    meta: { authRequired: true }
  },

  {
    path: '/login',
    component: () => import('layouts/Empty.vue'),
    children: [
      { path: '', name: 'login', component: () => import('pages/Login.vue') },
      {
        path: '/computers/results/:id/label',
        name: 'computer-label',
        component: () => import('pages/computers/results/label.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
