<template>
  <q-input v-model="content" outlined type="textarea" :label="label" />

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
      get: () => props.modelValue,
      set: (val) => {
        emit('update:model-value', val)
      },
    })

    const orderAlpha = () => {
      const tmp = content.value.trim().split('\n')

      content.value = tmp.sort().join('\n')
    }

    return {
      content,
      orderAlpha,
    }
  },
})
</script>
