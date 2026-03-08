<template>
  <q-dialog v-model="showing" persistent aria-labelledby="dialog-title">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="mdi-alert-remove" color="negative" text-color="white" />
        <span id="dialog-title" class="q-ml-sm">{{ text }}</span>
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

<script setup>
import { ref, computed, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import { appIcon } from 'composables/element'

const props = defineProps({
  message: {
    type: String,
    required: false,
    default: '',
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['canceled', 'confirmed'])

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
</script>
