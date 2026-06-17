export default [
  {
    path: '/manufacturers',
    redirect: { name: 'manufacturers-list' },
  },
  {
    path: '/manufacturers/results',
    name: 'manufacturers-list',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/manufacturers/results/list'
      ),
  },
  {
    path: '/manufacturers/add',
    name: 'manufacturer-add',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/manufacturers/results/detail'
      ),
  },
  {
    path: '/manufacturers/results/:id',
    name: 'manufacturer-detail',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/manufacturers/results/detail'
      ),
  },

  {
    path: '/models',
    name: 'models-dashboard',
    component: () =>
      import(/* webpackChunkName: "devices" */ 'pages/devices/models/index'),
  },
  {
    path: '/models/results',
    name: 'models-list',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/models/results/list'
      ),
  },
  {
    path: '/models/add',
    name: 'model-add',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/models/results/detail'
      ),
  },
  {
    path: '/models/results/:id',
    name: 'model-detail',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/models/results/detail'
      ),
  },

  {
    path: '/capabilities',
    redirect: { name: 'capabilities-list' },
  },
  {
    path: '/capabilities/results',
    name: 'capabilities-list',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/capabilities/results/list'
      ),
  },
  {
    path: '/capabilities/add',
    name: 'capability-add',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/capabilities/results/detail'
      ),
  },
  {
    path: '/capabilities/results/:id',
    name: 'capability-detail',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/capabilities/results/detail'
      ),
  },

  {
    path: '/devices',
    name: 'devices-dashboard',
    component: () =>
      import(/* webpackChunkName: "devices" */ 'pages/devices/devices/index'),
  },
  {
    path: '/devices/results',
    name: 'devices-list',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/devices/results/list'
      ),
  },
  {
    path: '/devices/add',
    name: 'device-add',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/devices/results/detail'
      ),
  },
  {
    path: '/devices/results/:id',
    name: 'device-detail',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/devices/results/detail'
      ),
  },
  {
    path: '/devices/replacement',
    name: 'devices-replacement',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/devices/replacement'
      ),
  },

  {
    path: '/connections',
    redirect: { name: 'connections-list' },
  },
  {
    path: '/connections/results',
    name: 'connections-list',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/connections/results/list'
      ),
  },
  {
    path: '/connections/add',
    name: 'connection-add',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/connections/results/detail'
      ),
  },
  {
    path: '/connections/results/:id',
    name: 'connection-detail',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/connections/results/detail'
      ),
  },

  {
    path: '/device-types',
    redirect: { name: 'device-types-list' },
  },
  {
    path: '/device-types/results',
    name: 'device-types-list',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/device-types/results/list'
      ),
  },
  {
    path: '/device-types/add',
    name: 'device-type-add',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/device-types/results/detail'
      ),
  },
  {
    path: '/device-types/results/:id',
    name: 'device-type-detail',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/device-types/results/detail'
      ),
  },

  {
    path: '/logical-devices',
    redirect: { name: 'logical-devices-list' },
  },
  {
    path: '/logical-devices/results',
    name: 'logical-devices-list',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/logical-devices/results/list'
      ),
  },
  {
    path: '/logical-devices/add',
    name: 'logical-device-add',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/logical-devices/results/detail'
      ),
  },
  {
    path: '/logical-devices/results/:id',
    name: 'logical-device-detail',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/logical-devices/results/detail'
      ),
  },

  {
    path: '/drivers',
    redirect: { name: 'drivers-list' },
  },
  {
    path: '/drivers/results',
    name: 'drivers-list',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/drivers/results/list'
      ),
  },
  {
    path: '/driver/add',
    name: 'driver-add',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/drivers/results/detail'
      ),
  },
  {
    path: '/drivers/results/:id',
    name: 'driver-detail',
    component: () =>
      import(
        /* webpackChunkName: "devices" */ 'pages/devices/drivers/results/detail'
      ),
  },
]
