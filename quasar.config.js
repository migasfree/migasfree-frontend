/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-file

import ESLintPlugin from 'eslint-webpack-plugin'
import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'
import fs from 'fs'

function getEnvVar(name) {
  if (process.env[name]) return process.env[name]
  try {
    const envPath = fileURLToPath(new URL('./.env', import.meta.url))
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8')
      // Simple parse for KEY="VALUE" or KEY=VALUE
      const match = content.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'))
      if (match) return match[1]
    }
  } catch (e) {}
  return ''
}

export default defineConfig((ctx) => {
  const MIGASFREE_SERVER = getEnvVar('MIGASFREE_SERVER')

  return {
    // https://v2.quasar.dev/quasar-cli-webpack/supporting-ts
    supportTS: false,

    // https://v2.quasar.dev/quasar-cli-webpack/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-webpack/boot-files
    boot: ['axios', 'fonts', 'gettext', 'vue-good-table-next'],

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-file#css
    css: ['app.sass'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      'mdi-v7',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      // 'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-file#build
    build: {
      env: {
        MIGASFREE_SERVER: MIGASFREE_SERVER || 'http://localhost',
      },
      // publicPath: '/',
      vueRouterMode: 'history', // available values: 'hash', 'history'

      // webpackTranspile: false,

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "webpackTranspile" is set to true.
      // webpackTranspileDependencies: [],

      // rtl: true, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      // webpackShowProgress: false,
      // gzip: true,
      analyze: true,
      // webpackDevtool: ?,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://v2.quasar.dev/quasar-cli-webpack/handling-webpack
      // "chain" is a webpack-chain object https://github.com/sorrycc/webpack-chain
      // chainWebpack (/* chain, { isClient, isServer } */) {}

      chainWebpack(chain) {
        chain.resolve.alias.set(
          'composables',
          fileURLToPath(new URL('./src/composables', import.meta.url)),
        )

        chain.resolve.alias.set(
          'config',
          fileURLToPath(new URL('./src/config', import.meta.url)),
        )

        const splitChunks = chain.optimization.get('splitChunks') || {}
        chain.optimization.splitChunks({
          ...splitChunks,
          cacheGroups: {
            ...(splitChunks.cacheGroups || {}),
            echarts: {
              name: 'chunk-echarts',
              test: /[\\/]node_modules[\\/](echarts|vue-echarts)[\\/]/,
              chunks: 'all',
              priority: 20,
            },
            leaflet: {
              name: 'chunk-leaflet',
              test: /[\\/]node_modules[\\/](leaflet|@vue-leaflet)[\\/]/,
              chunks: 'all',
              priority: 20,
            },
          },
        })
      },

      extendWebpack(cfg) {
        cfg.externals = {
          ...cfg.externals,
          fs: 'commonjs fs',
        }
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-file#devserver
    devServer: {
      server: {
        type: 'http',
      },
      client: {
        overlay: false,
      },
      port: 3002,
      open: false, // opens browser window automatically
    },

    eslint: {
      // fix: true,
      // include: [],
      // exclude: [],
      // cache: false,
      // rawEsbuildEslintOptions: {},
      // rawWebpackEslintPluginOptions: {},
      warnings: false,
      errors: false,
    },

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-file#framework
    framework: {
      config: {},

      iconSet: 'mdi-v7', // Quasar icon set
      lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        'Notify',
        'Meta',
        'Dialog',
        'Cookies',
        'LocalStorage',
        'AppFullscreen',
      ],
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   indexHtmlTemplate: 'index.html',
    //   pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
    //   pwaServiceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    //   bexManifestFile: 'src-bex/manifest.json
    // },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-ssr/configuring-ssr
    ssr: {
      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        ctx.prod ? 'compression' : '',
        'render', // keep this as last one
      ],

      // extendPackageJson (json) {},
      // extendSSRWebserverConf (esbuildConf) {},

      // manualStoreSerialization: true,
      // manualStoreSsrContextInjection: true,
      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      pwa: false,
      // pwaOfflineHtmlFilename: 'offline.html', // do NOT use index.html as name!

      // pwaExtendGenerateSWOptions (cfg) {},
      // pwaExtendInjectManifestOptions (cfg) {}

      maxAge: 1000 * 60 * 60 * 24 * 30,
      // Tell browser when a file from the server should expire from cache (in ms)

      /* chainWebpackWebserver(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },*/
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      // swFilename: 'sw.js',
      // manifestFilename: 'manifest.json',
      // extendManifestJson (json) {},
      // useCredentialsForManifestTag: true,
      // injectPwaMetaTags: false,
      // extendPWACustomSWConf (esbuildConf) {},
      // extendGenerateSWOptions (cfg) {},
      // extendInjectManifestOptions (cfg) {}

      // for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
      // if using workbox in InjectManifest mode

      /* chainWebpackCustomSW(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },*/
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf) {},
      // extendElectronPreloadConf (esbuildConf) {},

      // extendPackageJson (json) {},

      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: ['electron-preload'],

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'migasfree-frontend',
      },

      // "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain

      chainWebpackMain(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },

      chainWebpackPreload(chain) {
        chain
          .plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ extensions: ['js'] }])
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (esbuildConf) {},
      // extendBexManifestJson (json) {},

      /**
       * The list of extra scripts (js/ts) not in your bex manifest that you want to
       * compile and use in your browser extension. Maybe dynamic use them?
       *
       * Each entry in the list should be a relative filename to /src-bex/
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: [],
    },
  }
})
