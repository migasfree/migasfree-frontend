export default [
  {
    path: '/deployments',
    name: 'deployments-dashboard',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/deployments/index'
      ),
  },
  {
    path: '/deployments/results',
    name: 'deployments-list',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/deployments/results/list'
      ),
  },
  {
    path: '/deployments/add',
    name: 'deployment-add',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/deployments/results/detail'
      ),
  },
  {
    path: '/deployments/results/:id',
    name: 'deployment-detail',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/deployments/results/detail'
      ),
  },

  {
    path: '/stores',
    name: 'stores-dashboard',
    component: () =>
      import(/* webpackChunkName: "release" */ 'pages/release/stores/index'),
  },
  {
    path: '/stores/results',
    name: 'stores-list',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/stores/results/list'
      ),
  },
  {
    path: '/stores/add',
    name: 'store-add',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/stores/results/detail'
      ),
  },
  {
    path: '/stores/results/:id',
    name: 'store-detail',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/stores/results/detail'
      ),
  },

  {
    path: '/packages',
    name: 'packages-dashboard',
    component: () =>
      import(/* webpackChunkName: "release" */ 'pages/release/packages/index'),
  },
  {
    path: '/packages/results',
    name: 'packages-list',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/packages/results/list'
      ),
  },
  {
    path: '/packages/add',
    name: 'package-add',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/packages/results/detail'
      ),
  },
  {
    path: '/packages/results/:id',
    name: 'package-detail',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/packages/results/detail'
      ),
  },
  {
    path: '/packages/results/:id/information',
    name: 'package-information',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/packages/results/information'
      ),
  },

  {
    path: '/package-sets',
    redirect: { name: 'package-sets-list' },
  },
  {
    path: '/package-sets/results',
    name: 'package-sets-list',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/package-sets/results/list'
      ),
  },
  {
    path: '/package-sets/add',
    name: 'package-set-add',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/package-sets/results/detail'
      ),
  },
  {
    path: '/package-sets/results/:id',
    name: 'package-set-detail',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/package-sets/results/detail'
      ),
  },

  {
    path: '/applications',
    name: 'apps-dashboard',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/applications/index'
      ),
  },
  {
    path: '/applications/results',
    name: 'apps-list',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/applications/results/list'
      ),
  },
  {
    path: '/applications/add',
    name: 'app-add',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/applications/results/detail'
      ),
  },
  {
    path: '/applications/results/:id',
    name: 'app-detail',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/applications/results/detail'
      ),
  },

  {
    path: '/categories',
    redirect: { name: 'categories-list' },
  },
  {
    path: '/categories/results',
    name: 'categories-list',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/categories/results/list'
      ),
  },
  {
    path: '/categories/add',
    name: 'category-add',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/categories/results/detail'
      ),
  },
  {
    path: '/categories/results/:id',
    name: 'category-detail',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/categories/results/detail'
      ),
  },

  {
    path: '/tags',
    name: 'tags-dashboard',
    component: () =>
      import(/* webpackChunkName: "release" */ 'pages/release/tags/index'),
  },
  {
    path: '/tags/results',
    name: 'tags-list',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/tags/results/list'
      ),
  },
  {
    path: '/tags/add',
    name: 'tag-add',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/tags/results/detail'
      ),
  },
  {
    path: '/tags/results/:id',
    name: 'tag-detail',
    component: () =>
      import(
        /* webpackChunkName: "release" */ 'pages/release/tags/results/detail'
      ),
  },
]
