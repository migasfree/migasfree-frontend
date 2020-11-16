import { date } from 'quasar'

export const dateMixin = {
  methods: {
    showDate(isoString) {
      return date.formatDate(Date.parse(isoString), 'YYYY-MM-DD HH:mm:ss')
    }
  }
}
