export default [
  {
    path: '/configs',
    name: 'configs-dashboard',
    component: () => import('pages/golden-images/configs/index'),
  },
  {
    path: '/configs/results',
    name: 'configs-list',
    component: () => import('pages/golden-images/configs/results/list'),
  },
  {
    path: '/configs/add',
    name: 'config-add',
    component: () => import('pages/golden-images/configs/results/detail'),
  },
  {
    path: '/configs/results/:id',
    name: 'config-detail',
    component: () => import('pages/golden-images/configs/results/detail'),
  },

  {
    path: '/flavours',
    name: 'flavours-dashboard',
    component: () => import('pages/golden-images/flavours/index'),
  },
  {
    path: '/flavours/results',
    name: 'flavours-list',
    component: () => import('pages/golden-images/flavours/results/list'),
  },
  {
    path: '/flavours/add',
    name: 'flavour-add',
    component: () => import('pages/golden-images/flavours/results/detail'),
  },
  {
    path: '/flavours/results/:id',
    name: 'flavour-detail',
    component: () => import('pages/golden-images/flavours/results/detail'),
  },

  {
    path: '/releases',
    redirect: { name: 'releases-list' },
  },
  {
    path: '/releases/results',
    name: 'releases-list',
    component: () => import('pages/golden-images/releases/results/list'),
  },
  {
    path: '/releases/add',
    name: 'release-add',
    component: () => import('pages/golden-images/releases/results/detail'),
  },
  {
    path: '/releases/results/:id',
    name: 'release-detail',
    component: () => import('pages/golden-images/releases/results/detail'),
  },

  {
    path: '/builds',
    name: 'builds-dashboard',
    component: () => import('pages/golden-images/builds/index'),
  },
  {
    path: '/builds/results',
    name: 'builds-list',
    component: () => import('pages/golden-images/builds/results/list'),
  },
  {
    path: '/builds/results/:id',
    name: 'build-detail',
    component: () => import('pages/golden-images/builds/results/detail'),
  },
]
