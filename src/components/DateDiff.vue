<template>
  <q-chip v-if="diff" :icon="icon" :color="appearance" :text-color="textColor">
    <q-tooltip v-if="tooltip">{{ tooltip }}</q-tooltip>
    {{ diff }}
  </q-chip>
</template>

<script>
import { ref, watch } from 'vue'
import { date } from 'quasar'
import { useGettext } from 'vue3-gettext'

export default {
  name: 'DateDiff',
  props: {
    begin: {
      type: Date,
      default: () => {
        return new Date(Date.now())
      },
    },
    end: {
      type: Date,
      default: () => {
        return new Date(Date.now())
      },
    },
    tooltip: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const { $gettext, $ngettext, interpolate } = useGettext()

    const diff = ref(null)
    const appearance = ref('info')
    const textColor = ref('black')
    const icon = ref('mdi-timer')

    const getDiff = (begin, end) => {
      const diffDays = date.getDateDiff(end, begin, 'days')

      if (end < begin) {
        icon.value = 'mdi-sync'
        diff.value = $gettext('Updating...')
        return
      }

      const diffSeconds = new Date(
        date.getDateDiff(end, begin, 'seconds') * 1000,
      )
        .toISOString()
        .substr(11, 8)

      if (diffDays >= 1 && diffDays < 30) {
        appearance.value = 'warning'
      } else if (diffDays >= 30) {
        appearance.value = 'negative'
        textColor.value = 'white'
      }

      if (diffDays) {
        const template = $ngettext(
          '%{n} day, %{s}',
          '%{n} days, %{s}',
          diffDays,
        )
        diff.value = interpolate(template, {
          n: diffDays,
          s: diffSeconds,
        })
      } else diff.value = diffSeconds
    }

    getDiff(props.begin, props.end)

    watch(
      () => props.begin,
      (val) => {
        getDiff(val, props.end)
      },
    )

    return {
      diff,
      appearance,
      textColor,
      icon,
    }
  },
}
</script>
