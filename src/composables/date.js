import { useGettext } from 'vue3-gettext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import localeData from 'dayjs/plugin/localeData.js'

dayjs.extend(relativeTime)
dayjs.extend(localeData)

/**
 * Composable for date formatting and localization.
 *
 * Provides:
 * - `localeDate`: Localized date configuration for Quasar date components
 * - `showDate`: Format ISO date strings with customizable format
 * - `diffForHumans`: Get relative time string (e.g., "2 hours ago")
 *
 * @returns {Object} Date utilities
 * @property {Object} localeDate - Localized day/month names and calendar config
 * @property {Function} showDate - Format date string
 * @property {Function} diffForHumans - Get relative time
 *
 * @example
 * const { showDate, diffForHumans } = useDate()
 * showDate('2024-01-15') // "2024-01-15"
 * showDate('2024-01-15T10:30:00Z') // "2024-01-15 10:30:00"
 * diffForHumans('2024-01-15') // "3 months ago"
 */
export default function useDate() {
  const { $gettext, current } = useGettext()

  const locale = current.split('_')[0]

  ;(async () => {
    try {
      const module = await import(`dayjs/locale/${locale}.js`)
      dayjs.locale(module.default.name)
    } catch (error) {
      console.warn(`Locale ${locale} not found for Day.js`, error)
    }
  })()

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
