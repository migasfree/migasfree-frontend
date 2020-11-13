<template>
  <q-chip v-if="diff" icon="mdi-timer" :color="appearance" text-color="white">
    <q-tooltip>unsynchronized from</q-tooltip>
    {{ diff }}
  </q-chip>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'UnsyncFrom',
  props: {
    from: {
      type: Date,
      default: function() {
        return new Date()
      }
    }
  },
  data() {
    return {
      diff: null,
      appearance: 'info'
    }
  },
  created() {
    const now = Date.now()
    const diffDays = date.getDateDiff(now, this.from, 'days')
    const diffSeconds = new Date(
      date.getDateDiff(now, this.from, 'seconds') * 1000
    )
      .toISOString()
      .substr(11, 8)

    if (diffDays >= 1 && diffDays < 30) {
      this.appearance = 'warning'
    } else if (diffDays >= 30) {
      this.appearance = 'negative'
    }

    this.diff = `${diffDays} days, ${diffSeconds}`
  }
}
</script>
