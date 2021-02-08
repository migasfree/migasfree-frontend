import { date } from 'quasar'

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
    }
  }
}
