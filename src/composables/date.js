import { useGettext } from 'vue3-gettext'
import { date } from 'quasar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'

dayjs.extend(relativeTime)

export default function useDate() {
  const { $gettext, current } = useGettext()

  const localeDate = {
    days: [
      $gettext('Sunday'),
      $gettext('Monday'),
      $gettext('Tuesday'),
      $gettext('Wednesday'),
      $gettext('Thursday'),
      $gettext('Friday'),
      $gettext('Saturday'),
    ],
    daysShort: [
      $gettext('Sun'),
      $gettext('Mon'),
      $gettext('Tue'),
      $gettext('Wed'),
      $gettext('Thu'),
      $gettext('Fri'),
      $gettext('Sat'),
    ],
    months: [
      $gettext('January'),
      $gettext('February'),
      $gettext('March'),
      $gettext('April'),
      $gettext('May'),
      $gettext('June'),
      $gettext('July'),
      $gettext('August'),
      $gettext('September'),
      $gettext('October'),
      $gettext('November'),
      $gettext('December'),
    ],
    monthsShort: [
      $gettext('Jan'),
      $gettext('Feb'),
      $gettext('Mar'),
      $gettext('Apr'),
      $gettext('May'),
      $gettext('Jun'),
      $gettext('Jul'),
      $gettext('Aug'),
      $gettext('Sep'),
      $gettext('Oct'),
      $gettext('Nov'),
      $gettext('Dec'),
    ],
    firstDayOfWeek: current.startsWith('es') ? 1 : 0,
    format24h: true,
    pluralDay: $gettext('days'),
    date: $gettext('Date'),
    time: $gettext('Time'),
  }

  const showDate = (isoString, format = '') => {
    if (!format) {
      format =
        typeof isoString === 'string' && !isoString.includes('T')
          ? 'YYYY-MM-DD'
          : 'YYYY-MM-DD HH:mm:ss'
    }

    return date.formatDate(Date.parse(isoString), format)
  }

  const diffForHumans = (isoString) => {
    const locale = current.split('_')[0]
    if (locale)
      import(`dayjs/locale/${locale}.js`).then((module) => {
        dayjs.locale(module.default.name)
      })

    return dayjs(isoString).fromNow()
  }

  return { localeDate, showDate, diffForHumans }
}
