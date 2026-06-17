export default [
  {
    path: '/deployments',
    name: 'deployments-dashboard',
    component: () => import('pages/release/deployments/index'),
  },
  {
    path: '/deployments/results',
    name: 'deployments-list',
    component: () => import('pages/release/deployments/results/list'),
  },
  {
    path: '/deployments/add',
    name: 'deployment-add',
    component: () => import('pages/release/deployments/results/detail'),
  },
  {
    path: '/deployments/results/:id',
    name: 'deployment-detail',
    component: () => import('pages/release/deployments/results/detail'),
  },

  {
    path: '/stores',
    name: 'stores-dashboard',
    component: () => import('pages/release/stores/index'),
  },
  {
    path: '/stores/results',
    name: 'stores-list',
    component: () => import('pages/release/stores/results/list'),
  },
  {
    path: '/stores/add',
    name: 'store-add',
    component: () => import('pages/release/stores/results/detail'),
  },
  {
    path: '/stores/results/:id',
    name: 'store-detail',
    component: () => import('pages/release/stores/results/detail'),
  },

  {
    path: '/packages',
    name: 'packages-dashboard',
    component: () => import('pages/release/packages/index'),
  },
  {
    path: '/packages/results',
    name: 'packages-list',
    component: () => import('pages/release/packages/results/list'),
  },
  {
    path: '/packages/add',
    name: 'package-add',
    component: () => import('pages/release/packages/results/detail'),
  },
  {
    path: '/packages/results/:id',
    name: 'package-detail',
    component: () => import('pages/release/packages/results/detail'),
  },
  {
    path: '/packages/results/:id/information',
    name: 'package-information',
    component: () => import('pages/release/packages/results/information'),
  },

  {
    path: '/package-sets',
    redirect: { name: 'package-sets-list' },
  },
  {
    path: '/package-sets/results',
    name: 'package-sets-list',
    component: () => import('pages/release/package-sets/results/list'),
  },
  {
    path: '/package-sets/add',
    name: 'package-set-add',
    component: () => import('pages/release/package-sets/results/detail'),
  },
  {
    path: '/package-sets/results/:id',
    name: 'package-set-detail',
    component: () => import('pages/release/package-sets/results/detail'),
  },

  {
    path: '/applications',
    name: 'apps-dashboard',
    component: () => import('pages/release/applications/index'),
  },
  {
    path: '/applications/results',
    name: 'apps-list',
    component: () => import('pages/release/applications/results/list'),
  },
  {
    path: '/applications/add',
    name: 'app-add',
    component: () => import('pages/release/applications/results/detail'),
  },
  {
    path: '/applications/results/:id',
    name: 'app-detail',
    component: () => import('pages/release/applications/results/detail'),
  },

  {
    path: '/categories',
    redirect: { name: 'categories-list' },
  },
  {
    path: '/categories/results',
    name: 'categories-list',
    component: () => import('pages/release/categories/results/list'),
  },
  {
    path: '/categories/add',
    name: 'category-add',
    component: () => import('pages/release/categories/results/detail'),
  },
  {
    path: '/categories/results/:id',
    name: 'category-detail',
    component: () => import('pages/release/categories/results/detail'),
  },

  {
    path: '/tags',
    name: 'tags-dashboard',
    component: () => import('pages/release/tags/index'),
  },
  {
    path: '/tags/results',
    name: 'tags-list',
    component: () => import('pages/release/tags/results/list'),
  },
  {
    path: '/tags/add',
    name: 'tag-add',
    component: () => import('pages/release/tags/results/detail'),
  },
  {
    path: '/tags/results/:id',
    name: 'tag-detail',
    component: () => import('pages/release/tags/results/detail'),
  },
]
