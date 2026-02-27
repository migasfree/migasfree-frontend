<template>
  <q-chip v-if="diff" :icon="icon" :class="['date-diff', appearance]">
    <q-tooltip v-if="tooltip" class="glass-tooltip">{{ tooltip }}</q-tooltip>
    {{ diff }}
  </q-chip>
</template>

<script setup>
import { ref, watch } from 'vue'
import { date } from 'quasar'
import { useGettext } from 'vue3-gettext'

const props = defineProps({
  begin: {
    type: Date,
    default: () => new Date(),
  },
  end: {
    type: Date,
    default: () => new Date(),
  },
  tooltip: {
    type: String,
    default: null,
  },
})

const { $gettext, $ngettext, interpolate } = useGettext()

const diff = ref(null)
const appearance = ref('info')
const icon = ref('mdi-timer')

const calculateDiff = () => {
  const begin = props.begin
  const end = props.end

  if (end < begin) {
    icon.value = 'mdi-sync'
    diff.value = $gettext('Updating...')
    appearance.value = 'info'
    return
  }

  const diffTime = Math.abs(end - begin)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  icon.value = 'mdi-timer'
  appearance.value = 'info'

  const diffSeconds = new Date(date.getDateDiff(end, begin, 'seconds') * 1000)
    .toISOString()
    .slice(11, 19)

  if (diffDays >= 1 && diffDays < 30) {
    appearance.value = 'warning'
  } else if (diffDays >= 30) {
    appearance.value = 'negative'
  }

  if (diffDays) {
    const template = $ngettext('%{n} day, %{s}', '%{n} days, %{s}', diffDays)
    diff.value = interpolate(template, {
      n: diffDays,
      s: diffSeconds,
    })
  } else {
    diff.value = diffSeconds
  }
}

watch([() => props.begin, () => props.end], calculateDiff, { immediate: true })
</script>

<style scoped>
.date-diff {
  font-weight: 700;
  border-radius: 20px !important;
  transition: all 0.3s ease;
  padding: 2px 10px;
  height: 28px;
  border: 1px solid transparent;
}

.date-diff :deep(.q-chip__icon),
.date-diff :deep(.q-icon) {
  color: inherit !important;
}

/* Info */
.date-diff.info {
  background: var(--info-surface) !important;
  color: var(--text-info) !important;
  border-color: rgba(var(--brand-primary-rgb, 67, 20, 7), 0.1);
}

/* Warning */
.date-diff.warning {
  background: var(--warning-surface) !important;
  color: var(--text-warning) !important;
  border-color: rgba(var(--warning-rgb, 161, 98, 7), 0.2);
}

/* Negative / Critical */
.date-diff.negative {
  background: var(--critical) !important;
  color: var(--critical-on, #fff) !important;
}

[data-theme='dark'] .date-diff.info {
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .date-diff.warning {
  border-color: rgba(251, 191, 36, 0.2);
}
</style>
