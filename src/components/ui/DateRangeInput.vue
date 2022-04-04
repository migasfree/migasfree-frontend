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
            @input="dateSelected"
          ></q-date>
        </q-popup-proxy>
      </q-icon>
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
    reset() {
      this.date = { from: null, to: null }
    },
  },
}
</script>
