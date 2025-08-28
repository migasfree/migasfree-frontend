import { useGettext } from 'vue3-gettext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import localeData from 'dayjs/plugin/localeData.js'

dayjs.extend(relativeTime)
dayjs.extend(localeData)

export default function useDate() {
  const { $gettext, current } = useGettext()

  const locale = current.split('_')[0]
  try {
    import(`dayjs/locale/${locale}.js`).then((module) => {
      dayjs.locale(module.default.name)
    })
  } catch {
    console.warn(`Locale ${locale} not found for Day.js`)
  }

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
    const isDateOnly = typeof isoString === 'string' && !isoString.includes('T')
    const parsedDate = dayjs(isoString)

    if (!format) {
      format = isDateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'
    }

    return parsedDate.format(format)
  }

  const diffForHumans = (isoString) => {
    return dayjs(isoString).fromNow()
  }

  return { localeDate, showDate, diffForHumans }
}
