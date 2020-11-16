import { date } from 'quasar'

export const dateMixin = {
  methods: {
    showDate(isoString, format) {
      format = format || 'YYYY-MM-DD HH:mm:ss'
      return date.formatDate(Date.parse(isoString), format)
    }
  }
}
