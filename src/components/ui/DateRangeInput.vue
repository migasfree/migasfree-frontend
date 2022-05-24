<template>
  <q-input
    outlined
    dense
    readonly
    :value="dateView"
    :label="label"
    @click="$refs.qDateProxy.show()"
  >
    <template v-if="prependIcon" #before>
      <q-icon :name="prependIcon" />
    </template>

    <template #append>
      <q-icon name="mdi-calendar-multiselect" class="cursor-pointer">
        <q-popup-proxy
          ref="qDateProxy"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="date"
            range
            today-btn
            mask="YYYY-MM-DD"
            :locale="locale"
            @input="dateSelected"
          ></q-date>
        </q-popup-proxy>
      </q-icon>

      <q-icon
        v-if="date.from || date.to"
        name="mdi-close-circle"
        class="cursor-pointer"
        @click="reset"
      />
    </template>
  </q-input>
</template>

<script>
import { dateMixin } from 'mixins/date'

export default {
  name: 'DateRangeInput',
  mixins: [dateMixin],
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
    prependIcon: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      date: this.value || {
        from: null,
        to: null,
      },
      locale: {
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
      },
    }
  },
  computed: {
    dateView() {
      if (this.date.to && this.date.from) {
        return `${this.showDate(this.date.from)} ~ ${this.showDate(
          this.date.to
        )}`
      }

      if (this.date.to) return `? ~ ${this.showDate(this.date.to)}`

      if (this.date.from) return `${this.showDate(this.date.from)} ~ ?`

      return ''
    },
  },
  methods: {
    dateSelected() {
      this.$refs.qDateProxy.hide()
      this.$emit('select', this.date)
    },
    reset(emit = true) {
      this.date = { from: null, to: null }
      if (emit) this.$emit('select', this.date)
    },
  },
}
</script>
