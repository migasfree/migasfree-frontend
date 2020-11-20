<template>
  <q-dialog v-model="value" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="mdi-alert-remove" color="negative" text-color="white" />
        <span class="q-ml-sm">{{ message }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="Cancel" color="primary" />
        <q-btn
          v-close-popup
          label="Borrar"
          icon="mdi-delete"
          color="negative"
          @click="$emit('confirmed')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'RemoveDialog',
  props: {
    message: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      required: true
    }
  }
}
</script>
