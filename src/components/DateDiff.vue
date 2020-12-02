<template>
  <q-chip v-if="diff" :icon="icon" :color="appearance" text-color="white">
    <q-tooltip v-if="tooltip">{{ tooltip }}</q-tooltip>
    {{ diff }}
  </q-chip>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'DateDiff',
  props: {
    begin: {
      type: Date,
      default: function() {
        return new Date(Date.now())
      }
    },
    end: {
      type: Date,
      default: function() {
        return new Date(Date.now())
      }
    },
    tooltip: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      diff: null,
      appearance: 'info',
      icon: 'mdi-timer'
    }
  },
  created() {
    console.log(this.begin, this.end)
    const diffDays = date.getDateDiff(this.end, this.begin, 'days')

    if (this.end < this.begin) {
      this.icon = 'mdi-sync'
      this.diff = 'Updating...'
      return
    }

    const diffSeconds = new Date(
      date.getDateDiff(this.end, this.begin, 'seconds') * 1000
    )
      .toISOString()
      .substr(11, 8)

    if (diffDays >= 1 && diffDays < 30) {
      this.appearance = 'warning'
    } else if (diffDays >= 30) {
      this.appearance = 'negative'
    }

    if (diffDays) this.diff = `${diffDays} days, ${diffSeconds}`
    else this.diff = diffSeconds
  }
}
</script>
