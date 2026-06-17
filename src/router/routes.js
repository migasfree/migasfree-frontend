import configurationRoutes from './domains/configuration.js'
import devicesRoutes from './domains/devices.js'
import releaseRoutes from './domains/release.js'
import goldenImagesRoutes from './domains/golden-images.js'
import dataRoutes from './domains/data.js'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/Dashboard'),
      },
      ...configurationRoutes,
      ...devicesRoutes,
      ...releaseRoutes,
      ...goldenImagesRoutes,
      ...dataRoutes,
    ],
    meta: { authRequired: true },
  },

  {
    path: '/login',
    component: () => import('layouts/Empty.vue'),
    children: [
      { path: '', name: 'login', component: () => import('pages/Login.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
