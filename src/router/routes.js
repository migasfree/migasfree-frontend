import configurationRoutes from './domains/configuration'
import devicesRoutes from './domains/devices'
import releaseRoutes from './domains/release'
import goldenImagesRoutes from './domains/golden-images'
import dataRoutes from './domains/data'

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
