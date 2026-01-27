<template>
  <q-input
    :model-value="dateView"
    readonly
    :label="label"
    @click="qDateProxy.show()"
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
            flat
            mask="YYYY-MM-DD"
            :locale="localeDate"
            @update:model-value="dateSelected"
          ></q-date>
        </q-popup-proxy>
      </q-icon>

      <q-icon
        v-if="date.from || date.to"
        name="mdi-close-circle"
        class="cursor-pointer"
        @click="reset"
      />
    </template>
  </q-input>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import useDate from 'composables/date'

export default {
  name: 'DateRangeInput',
  props: {
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
      required: false,
      default: null,
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const qDateProxy = ref(null)
    const date = reactive(props.modelValue || { from: null, to: null })

    const { showDate, localeDate } = useDate()

    const dateView = computed(() => {
      if (date.to && date.from) {
        return `${showDate(date.from)} ~ ${showDate(date.to)}`
      }

      if (date.to) return `? ~ ${showDate(date.to)}`

      if (date.from) return `${showDate(date.from)} ~ ?`

      return ''
    })

    const dateSelected = (value) => {
      if (value === null) return

      Object.assign(date, value)
      qDateProxy.value.hide()
      emit('select', value)
    }

    const reset = (emitEvent = true) => {
      if (emitEvent) emit('select', { from: null, to: null })
    }

    watch(
      () => props.modelValue,
      (newValue) => {
        Object.assign(date, newValue)
      },
    )

    return {
      qDateProxy,
      date,
      showDate,
      localeDate,
      dateView,
      dateSelected,
      reset,
    }
  },
}
</script>
