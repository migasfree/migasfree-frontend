<template>
  <span>
    <q-icon v-if="icon" :name="icon" size="sm" class="vertical-middle" />
    <span v-if="value" class="vertical-middle">
      {{ showDate(value) }}
      <q-tooltip>
        <template v-if="tooltipText">
          {{ tooltipText }} ({{ diffForHumans(value) }})
        </template>
        <template v-else>{{ diffForHumans(value) }} </template>
      </q-tooltip>
    </span>
  </span>
</template>

<script>
import useDate from 'composables/date'

export default {
  name: 'DateView',

  props: {
    value: {
      type: [String],
      required: false,
      default: null,
    },
    icon: {
      type: String,
      required: false,
      default: '',
    },
    tooltipText: {
      type: String,
      required: false,
      default: '',
    },
  },

  setup() {
    const { showDate, diffForHumans } = useDate()

    return { showDate, diffForHumans }
  },
}
</script>
