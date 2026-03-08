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

<script setup>
import useDate from 'composables/date'

defineProps({
  value: {
    type: String,
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
})

const { showDate, diffForHumans } = useDate()
</script>
