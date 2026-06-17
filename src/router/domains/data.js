export default [
  {
    path: '/computers',
    name: 'computers-dashboard',
    component: () => import('pages/data/computers/index'),
  },
  {
    path: '/computers/results',
    name: 'computers-list',
    component: () => import('pages/data/computers/results/list'),
  },
  {
    path: '/computers/results/:id',
    name: 'computer-detail',
    component: () => import('pages/data/computers/results/detail'),
  },
  {
    path: '/computers/results/:id/events',
    name: 'computer-events',
    component: () => import('pages/data/computers/results/events'),
  },
  {
    path: '/computers/results/:id/sync/simulation',
    name: 'computer-simulate',
    component: () => import('pages/data/computers/results/simulate'),
  },
  {
    path: '/computers/results/:id/hardware',
    name: 'computer-hardware',
    component: () => import('pages/data/computers/results/hardware'),
  },
  {
    path: '/computers/replacement',
    name: 'computers-replacement',
    component: () => import('pages/data/computers/replacement'),
  },
  {
    path: '/computers/software-compare',
    name: 'computers-software-compare',
    component: () => import('pages/data/computers/softwareCompare'),
  },
  {
    path: '/computers/results/:id/label',
    name: 'computer-label',
    component: () => import('pages/data/computers/results/label.vue'),
  },

  {
    path: '/packages-history',
    name: 'packages-history-dashboard',
    component: () => import('pages/data/packages-history/index'),
  },
  {
    path: '/packages-history/results',
    name: 'packages-history-list',
    component: () => import('pages/data/packages-history/results/list'),
  },

  {
    path: '/users',
    redirect: { name: 'users-list' },
  },
  {
    path: '/users/results',
    name: 'users-list',
    component: () => import('pages/data/users/results/list'),
  },
  {
    path: '/users/results/:id',
    name: 'user-detail',
    component: () => import('pages/data/users/results/detail'),
  },

  {
    path: '/features',
    name: 'attributes-dashboard',
    component: () => import('pages/data/attributes/index'),
  },
  {
    path: '/features',
    name: 'features-dashboard',
    component: () => import('pages/data/attributes/index'),
  },
  {
    path: '/features/results',
    name: 'attributes-list',
    component: () => import('pages/data/attributes/results/list'),
  },
  {
    path: '/features/results',
    name: 'features-list',
    component: () => import('pages/data/attributes/results/list'),
  },
  {
    path: '/features/results/:id',
    name: 'attribute-detail',
    component: () => import('pages/data/attributes/results/detail'),
  },
  {
    path: '/features/results/:id',
    name: 'feature-detail',
    component: () => import('pages/data/attributes/results/detail'),
  },

  {
    path: '/syncs',
    name: 'syncs-dashboard',
    component: () => import('pages/data/syncs/index'),
  },
  {
    path: '/syncs',
    redirect: { name: 'syncs-list' },
  },
  {
    path: '/syncs/results',
    name: 'syncs-list',
    component: () => import('pages/data/syncs/results/list'),
  },

  {
    path: '/errors',
    name: 'errors-dashboard',
    component: () => import('pages/data/errors/index'),
  },
  {
    path: '/errors',
    redirect: { name: 'errors-list' },
  },
  {
    path: '/errors/results',
    name: 'errors-list',
    component: () => import('pages/data/errors/results/list'),
  },
  {
    path: '/errors/results/:id',
    name: 'error-detail',
    component: () => import('pages/data/errors/results/detail'),
  },

  {
    path: '/faults',
    name: 'faults-dashboard',
    component: () => import('pages/data/faults/index'),
  },
  {
    path: '/faults',
    redirect: { name: 'faults-list' },
  },
  {
    path: '/faults/results',
    name: 'faults-list',
    component: () => import('pages/data/faults/results/list'),
  },
  {
    path: '/faults/results/:id',
    name: 'fault-detail',
    component: () => import('pages/data/faults/results/detail'),
  },

  {
    path: '/status-logs',
    name: 'status-logs-dashboard',
    component: () => import('pages/data/status-logs/index'),
  },
  {
    path: '/status-logs',
    redirect: { name: 'status-logs-list' },
  },
  {
    path: '/status-logs/results',
    name: 'status-logs-list',
    component: () => import('pages/data/status-logs/results/list'),
  },

  {
    path: '/migrations',
    name: 'migrations-dashboard',
    component: () => import('pages/data/migrations/index'),
  },
  {
    path: '/migrations',
    redirect: { name: 'migrations-list' },
  },
  {
    path: '/migrations/results',
    name: 'migrations-list',
    component: () => import('pages/data/migrations/results/list'),
  },

  {
    path: '/messages',
    redirect: { name: 'messages-list' },
  },
  {
    path: '/messages/results',
    name: 'messages-list',
    component: () => import('pages/data/messages/results/list'),
  },

  {
    path: '/notifications',
    name: 'notifications-dashboard',
    component: () => import('pages/data/notifications/index'),
  },
  {
    path: '/notifications',
    redirect: { name: 'notifications-list' },
  },
  {
    path: '/notifications/results',
    name: 'notifications-list',
    component: () => import('pages/data/notifications/results/list'),
  },
]
