<template>
  <q-input
    v-model="content"
    outlined
    autogrow
    type="textarea"
    :label="label"
    bottom-slots
  >
    <template #prepend><slot name="prepend"></slot></template>

    <template #counter> {{ lineCounter }} </template>
  </q-input>

  <div class="row">
    <q-btn
      flat
      icon="mdi-order-alphabetical-ascending"
      color="primary"
      @click.stop="orderAlpha"
      ><q-tooltip>{{ $gettext('Order Alphabetically') }}</q-tooltip></q-btn
    >
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'OrderTextArea',
  props: {
    modelValue: {
      type: [String, Array, null],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const content = computed({
      get: () => {
        return Array.isArray(props.modelValue)
          ? props.modelValue.join('\n')
          : props.modelValue
      },
      set: (val) => {
        const newValue = Array.isArray(props.modelValue) ? val.split('\n') : val
        emit('update:model-value', newValue)
      },
    })

    const lineCounter = computed(() => {
      if (typeof content.value === 'string' && content.value.trim() !== '')
        return content.value.trim().split('\n').length

      return ''
    })

    const orderAlpha = () => {
      const tmp = content.value.trim().split('\n')

      content.value = tmp.sort().join('\n')
    }

    return {
      content,
      lineCounter,
      orderAlpha,
    }
  },
})
</script>
