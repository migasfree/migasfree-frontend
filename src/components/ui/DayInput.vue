<template>
  <q-input
    v-bind="$attrs"
    v-model="dayPicked"
    :readonly="readonly"
    clearable
    input-class="cursor-pointer"
    :label="label"
    @click="dayPicker.show()"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy
          ref="dayPicker"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="dayPicked"
            mask="YYYY-MM-DD"
            mode="date"
            landscape
            outlined
            today-btn
            flat
            :locale="localeDate"
            @update:model-value="updateValue"
          />
        </q-popup-proxy>
      </q-icon>
    </template>

    <q-tooltip v-if="dayPicked">{{ diffForHumans(dayPicked) }}</q-tooltip>
  </q-input>
</template>

<script setup>
import { ref, computed } from 'vue'
import useDate from 'composables/date'

defineOptions({
  name: 'DayInput',
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
    required: false,
    default: undefined,
  },
  readonly: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const emit = defineEmits(['update:model-value'])

const { localeDate, diffForHumans } = useDate()
const dayPicker = ref(null)

const dayPicked = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:model-value', val)
  },
})

const updateValue = (val, reason) => {
  if (reason === 'add-day') {
    dayPicker.value.hide()
    emit('update:model-value', val)
  }
}
</script>
