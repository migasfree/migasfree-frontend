<template>
  <q-input
    :model-value="dateView"
    readonly
    :label="label"
    class="date-range-input"
    @click="qDateProxy.show()"
  >
    <template v-if="prependIcon" #prepend>
      <div class="filter-icon-box">
        <q-icon :name="prependIcon" size="18px" />
      </div>
    </template>

    <template #append>
      <div class="row items-center no-wrap">
        <q-btn
          v-if="hasValue"
          flat
          round
          dense
          icon="mdi-close"
          size="sm"
          class="clear-btn q-mr-xs"
          @click.stop="reset"
        >
          <q-tooltip class="glass-tooltip">{{ $gettext('Clear') }}</q-tooltip>
        </q-btn>

        <q-icon
          name="mdi-calendar-range"
          class="cursor-pointer calendar-trigger"
          size="20px"
        >
          <q-popup-proxy
            ref="qDateProxy"
            transition-show="jump-down"
            transition-hide="jump-up"
            class="datepicker-proxy"
          >
            <q-date
              v-model="date"
              range
              today-btn
              flat
              bordered
              mask="YYYY-MM-DD"
              color="primary"
              :locale="localeDate"
              @update:model-value="dateSelected"
            >
              <div class="row items-center justify-end q-gutter-sm q-pa-sm">
                <q-btn
                  v-close-popup
                  :label="$gettext('Close')"
                  color="primary"
                  flat
                />
              </div>
            </q-date>
          </q-popup-proxy>
          <q-tooltip class="glass-tooltip">{{
            $gettext('Select range')
          }}</q-tooltip>
        </q-icon>
      </div>
    </template>
  </q-input>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import useDate from 'composables/date'

defineOptions({ name: 'DateRangeInput' })

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  prependIcon: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select', 'update:modelValue'])

const qDateProxy = ref(null)
const { showDate, localeDate } = useDate()

// Local state for the picker
const date = ref(props.modelValue || { from: null, to: null })

const hasValue = computed(() => !!(date.value?.from || date.value?.to))

const dateView = computed(() => {
  const d = date.value
  if (!d) return ''

  // If it's a single date (string)
  if (typeof d === 'string') return showDate(d)

  // If it's a range object
  if (d.from && d.to) {
    if (d.from === d.to) return showDate(d.from)
    return `${showDate(d.from)} ~ ${showDate(d.to)}`
  }

  if (d.from) return `${showDate(d.from)} ~ ...`
  if (d.to) return `... ~ ${showDate(d.to)}`

  return ''
})

const dateSelected = (value) => {
  if (value === null) {
    reset()
    return
  }

  // Normalize: if string, convert to range object for consistency
  const normalizedValue =
    typeof value === 'string' ? { from: value, to: value } : value

  date.value = normalizedValue
  emit('update:modelValue', normalizedValue)
  emit('select', normalizedValue)

  // Don't hide automatically if they just started a range
  if (normalizedValue.from && normalizedValue.to) {
    qDateProxy.value.hide()
  }
}

const reset = () => {
  const empty = { from: null, to: null }
  date.value = empty
  emit('update:modelValue', empty)
  emit('select', empty)
  if (qDateProxy.value) qDateProxy.value.hide()
}

watch(
  () => props.modelValue,
  (val) => {
    date.value = val || { from: null, to: null }
  },
  { deep: true },
)
</script>

<style scoped>
.calendar-trigger {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.calendar-trigger:hover {
  opacity: 1;
  color: var(--brand-primary);
  transform: scale(1.1);
}

.clear-btn {
  opacity: 0.5;
  transition: opacity 0.2s;
}

.clear-btn:hover {
  opacity: 1;
  color: var(--brand-negative);
}

.datepicker-proxy {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] .datepicker-proxy {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
</style>
