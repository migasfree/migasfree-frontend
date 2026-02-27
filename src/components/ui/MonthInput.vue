<template>
  <q-input
    v-bind="$attrs"
    v-model="monthPicked"
    readonly
    input-class="cursor-pointer"
    :label="label"
    @click="monthPicker.show()"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy
          ref="monthPicker"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="monthPicked"
            mask="YYYY-MM"
            minimal
            flat
            emit-immediately
            default-view="Years"
            :navigation-min-year-month="minYearMonth"
            :navigation-max-year-month="maxYearMonth"
            :locale="localeDate"
            @update:model-value="checkValue"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MIGASFREE_MIN_YEAR } from 'config/app.conf'
import useDate from 'composables/date'

defineOptions({
  name: 'MonthInput',
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: String,
    required: false,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:model-value'])

const { localeDate } = useDate()
const monthPicker = ref(null)

const monthPicked = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:model-value', val)
  },
})

const minYearMonth = computed(() => {
  const date = new Date(MIGASFREE_MIN_YEAR, 1)
  return date.toISOString().slice(0, 7).replace('-', '/')
})

const maxYearMonth = computed(() => {
  const date = new Date()
  return date.toISOString().slice(0, 7).replace('-', '/')
})

const checkValue = (val, reason) => {
  if (reason === 'month') {
    monthPicker.value.hide()
    emit('update:model-value', val)
  }
}
</script>
