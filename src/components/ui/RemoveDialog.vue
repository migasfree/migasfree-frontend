<template>
  <q-dialog v-model="showing" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="mdi-alert-remove" color="negative" text-color="white" />
        <span class="q-ml-sm">{{ text }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          flat
          color="primary"
          :label="$gettext('Cancel')"
          @click="$emit('canceled')"
        />
        <q-btn
          v-close-popup
          :icon="appIcon('delete')"
          color="negative"
          :label="$gettext('Delete')"
          @click="$emit('confirmed')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useGettext } from 'vue3-gettext'

import { appIcon } from 'composables/element'

export default {
  name: 'RemoveDialog',
  props: {
    message: {
      type: String,
      required: false,
      default: '',
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['canceled', 'confirmed'],
  setup(props) {
    const { $gettext } = useGettext()

    const showing = ref(props.modelValue)

    const text = computed(() => {
      if (props.message === '')
        return $gettext('Are you sure you want to remove this item?')

      return props.message
    })

    watch(
      () => props.modelValue,
      (newValue) => {
        showing.value = newValue
      },
    )

    return { showing, text, appIcon }
  },
}
</script>
