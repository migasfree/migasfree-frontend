const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/Dashboard.vue')
      },
      {
        path: '/computers',
        name: 'computers-dashboard',
        component: () => import('pages/computers/index.vue')
      },
      {
        path: '/computers/results',
        name: 'computers-list',
        component: () => import('pages/computers/results/index.vue')
      },
      {
        path: '/computers/results/:id',
        name: 'computer-detail',
        component: () => import('pages/computers/results/_id.vue')
      },
      {
        path: '/computers/results/:id/events',
        name: 'computer-events',
        component: () => import('pages/computers/results/events.vue')
      },
      {
        path: '/computers/results/:id/sync/simulation',
        name: 'computer-simulate',
        component: () => import('pages/computers/results/simulate.vue')
      }
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
