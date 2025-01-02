import js from '@eslint/js'
import globals from 'globals'
import pluginQuasar from '@quasar/app-webpack/eslint'
import pluginVue from 'eslint-plugin-vue'
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    ignores: ['src-bex/www/*', 'babel.config.js', '.gitignore'],

    languageOptions: {
      ecmaVersion: 'latest', // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        process: 'readonly', // process.env.*
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly', // BEX related
      },
    },
  },

  ...pluginQuasar.configs.recommended(),
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    rules: {
      'prefer-promise-reject-errors': 'off',
      'object-shorthand': 'off',
      'vue/no-v-html': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-slot-attribute': 'off',
      'vue/no-deprecated-slot-scope-attribute': 'off',
      'vue/no-deprecated-v-bind-sync': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/valid-attribute-name': 'off',

      // allow debugger during development only
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },

  {
    files: ['src-pwa/custom-service-worker.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  prettierSkipFormatting,
]
