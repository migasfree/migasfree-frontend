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
          icon="mdi-delete"
          color="negative"
          :label="$gettext('Delete')"
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
      default: ''
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
  computed: {
    text() {
      if (this.message === '')
        return this.$gettext('Are you sure you want to remove this item?')

      return this.message
    }
  },
  watch: {
    value(newVal) {
      this.showing = newVal
    }
  }
}
</script>
