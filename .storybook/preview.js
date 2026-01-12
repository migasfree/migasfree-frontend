import { useArgs } from '@storybook/preview-api'
import { setup } from '@storybook/vue3'
import {
  Quasar,
  Notify,
  // Components used in stories
  QBtn,
  QIcon,
  QChip,
  QToolbar,
  QToolbarTitle,
  QTooltip,
  QInput,
  QSelect,
  QCard,
  QCardSection,
  QCardActions,
  QSeparator,
  QSpace,
  QSpinner,
  QSpinnerDots,
  QBadge,
  QItem,
  QItemSection,
  QItemLabel,
  QList,
  QExpansionItem,
  QToggle,
  QCheckbox,
  QRadio,
  QOptionGroup,
  QSlider,
  QRange,
  QAvatar,
  QBanner,
  QBar,
  QBreadcrumbs,
  QBreadcrumbsEl,
  QCircularProgress,
  QLinearProgress,
  QDialog,
  QMenu,
  QPopupProxy,
  QTable,
  QTh,
  QTr,
  QTd,
  QMarkupTable,
  QPagination,
  QTabs,
  QTab,
  QTabPanels,
  QTabPanel,
  QPage,
  QPageContainer,
  QLayout,
  QHeader,
  QFooter,
  QDrawer,
  QPageSticky,
  QScrollArea,
  QImg,
  QInnerLoading,
  QForm,
  QField,
  ClosePopup,
  Ripple,
} from 'quasar'
import { createGettext } from 'vue3-gettext'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

// Import Quasar styles
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v7/mdi-v7.css'

// Import Quasar icon set
import iconSet from 'quasar/icon-set/mdi-v7'

// Create gettext instance with empty translations (passthrough)
const gettext = createGettext({
  availableLanguages: { en: 'English' },
  defaultLanguage: 'en',
  translations: {},
  silent: true,
})

// Create Pinia instance
const pinia = createPinia()

// Create minimal router for components that use router-link
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
})

// All Quasar components to register globally
const quasarComponents = {
  QBtn,
  QIcon,
  QChip,
  QToolbar,
  QToolbarTitle,
  QTooltip,
  QInput,
  QSelect,
  QCard,
  QCardSection,
  QCardActions,
  QSeparator,
  QSpace,
  QSpinner,
  QSpinnerDots,
  QBadge,
  QItem,
  QItemSection,
  QItemLabel,
  QList,
  QExpansionItem,
  QToggle,
  QCheckbox,
  QRadio,
  QOptionGroup,
  QSlider,
  QRange,
  QAvatar,
  QBanner,
  QBar,
  QBreadcrumbs,
  QBreadcrumbsEl,
  QCircularProgress,
  QLinearProgress,
  QDialog,
  QMenu,
  QPopupProxy,
  QTable,
  QTh,
  QTr,
  QTd,
  QMarkupTable,
  QPagination,
  QTabs,
  QTab,
  QTabPanels,
  QTabPanel,
  QPage,
  QPageContainer,
  QLayout,
  QHeader,
  QFooter,
  QDrawer,
  QPageSticky,
  QScrollArea,
  QImg,
  QInnerLoading,
  QForm,
  QField,
}

setup((app) => {
  // Install Quasar
  app.use(Quasar, {
    plugins: { Notify },
    iconSet: iconSet,
    config: {
      brand: {
        primary: '#1976d2',
        secondary: '#26A69A',
        accent: '#9C27B0',
        dark: '#1d1d1d',
        positive: '#21BA45',
        negative: '#C10015',
        info: '#31CCEC',
        warning: '#F2C037',
      },
    },
  })

  // Register Quasar components globally
  Object.entries(quasarComponents).forEach(([name, component]) => {
    app.component(name, component)
  })

  // Register directives
  app.directive('close-popup', ClosePopup)
  app.directive('ripple', Ripple)

  // Install vue3-gettext
  app.use(gettext)

  // Install Pinia
  app.use(pinia)

  // Install Vue Router
  app.use(router)
})

/** @type { import('@storybook/vue3').Preview } */
const preview = {
  decorators: [
    (story, context) => {
      const [, updateArgs] = useArgs()
      return story({ ...context, updateArgs })
    },
  ],
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
