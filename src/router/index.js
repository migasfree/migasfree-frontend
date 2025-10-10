import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes.js'

import { useAuthStore } from 'stores/auth'
// import { cancelSource } from 'boot/axios'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE,
    ),
  })

  Router.beforeEach((to, from, next) => {
    // cancelSource.cancel('Operation canceled by the user')

    const authStore = useAuthStore()

    if (to.matched.some((item) => item.meta.authRequired)) {
      if (authStore.loggedIn) {
        next()
      } else {
        next({ name: 'login', query: { nextUrl: to.fullPath } })
      }
      // } else if (to.name === 'login' && authStore.loggedIn) {
      //  next({name: 'home'})
    } else {
      next()
    }
  })

  return Router
})
