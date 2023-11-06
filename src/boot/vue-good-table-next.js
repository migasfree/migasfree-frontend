import VueGoodTablePlugin from 'vue-good-table-next'

import 'vue-good-table-next/dist/vue-good-table-next.css'

export default async ({ app }) => {
  app.use(VueGoodTablePlugin)
}
