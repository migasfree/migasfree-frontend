import { date } from 'quasar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const dateMixin = {
  data() {
    return {
      localeDate: {
        days: [
          this.$gettext('Sunday'),
          this.$gettext('Monday'),
          this.$gettext('Tuesday'),
          this.$gettext('Wednesday'),
          this.$gettext('Thursday'),
          this.$gettext('Friday'),
          this.$gettext('Saturday'),
        ],
        daysShort: [
          this.$gettext('Sun'),
          this.$gettext('Mon'),
          this.$gettext('Tue'),
          this.$gettext('Wed'),
          this.$gettext('Thu'),
          this.$gettext('Fri'),
          this.$gettext('Sat'),
        ],
        months: [
          this.$gettext('January'),
          this.$gettext('February'),
          this.$gettext('March'),
          this.$gettext('April'),
          this.$gettext('May'),
          this.$gettext('June'),
          this.$gettext('July'),
          this.$gettext('August'),
          this.$gettext('September'),
          this.$gettext('October'),
          this.$gettext('November'),
          this.$gettext('December'),
        ],
        monthsShort: [
          this.$gettext('Jan'),
          this.$gettext('Feb'),
          this.$gettext('Mar'),
          this.$gettext('Apr'),
          this.$gettext('May'),
          this.$gettext('Jun'),
          this.$gettext('Jul'),
          this.$gettext('Aug'),
          this.$gettext('Sep'),
          this.$gettext('Oct'),
          this.$gettext('Nov'),
          this.$gettext('Dec'),
        ],
        firstDayOfWeek: this.$language.current.startsWith('es') ? 1 : 0,
        format24h: true,
        pluralDay: this.$gettext('days'),
        date: this.$gettext('Date'),
        time: this.$gettext('Time'),
      },
    }
  },

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
    },
  },
}
