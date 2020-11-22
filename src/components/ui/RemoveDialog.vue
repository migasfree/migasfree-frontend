<template>
  <q-dialog v-model="showing" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="mdi-alert-remove" color="negative" text-color="white" />
        <span class="q-ml-sm">{{ message }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          flat
          label="Cancel"
          color="primary"
          @click="$emit('canceled')"
        />
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
      required: false,
      default: 'Are you sure you want to remove this item?'
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      showing: this.value
    }
  },
  watch: {
    value(newVal) {
      this.showing = newVal
    }
  }
}
</script>
