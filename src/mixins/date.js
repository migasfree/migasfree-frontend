import { date } from 'quasar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const dateMixin = {
  methods: {
    showDate(isoString, format = '') {
      if (!format) {
        format =
          typeof isoString === 'string' && !isoString.includes('T')
            ? 'YYYY-MM-DD'
            : 'YYYY-MM-DD HH:mm:ss'
      }

      return date.formatDate(Date.parse(isoString), format)
    },

    diffForHumans(isoString) {
      const locale = this.$language.current.split('_')[0]
      if (locale)
        import(`dayjs/locale/${locale}.js`).then((module) => {
          dayjs.locale(module.default.name)
        })

      return dayjs(isoString).fromNow()
    }
  }
}
