<template>
  <div class="row">
    <q-toolbar class="q-my-sm q-px-none">
      <q-icon v-if="icon" :name="icon" size="48px" />

      <q-toolbar-title class="q-px-sm"
        ><h2 class="text-h4">
          <span class="vertical-middle">{{ title }}</span>
          <q-chip
            v-if="results !== null && results !== 0"
            size="lg"
            color="grey-4"
            text-color="black"
            >{{ results }}</q-chip
          >
          <slot name="append"></slot>
        </h2>
      </q-toolbar-title>

      <q-btn
        v-if="addRoute"
        class="q-ma-sm"
        color="primary"
        text-color="white"
        :aria-label="$gettext('Add')"
        :icon="appIcon('add')"
        @click="$router.push({ name: addRoute })"
        ><q-tooltip>{{ $gettext('Add') }}</q-tooltip></q-btn
      >

      <q-btn
        v-if="hasExportButton && results > 0"
        class="q-ma-sm"
        color="primary"
        text-color="white"
        :aria-label="$gettext('Export')"
        :icon="appIcon('export')"
        :loading="isLoadingExport"
        :disable="results === 0"
        @click="exportAction"
        ><q-tooltip>{{ $gettext('Export') }}</q-tooltip></q-btn
      >
    </q-toolbar>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'

import { appIcon } from 'composables/element'

export default defineComponent({
  name: 'Header',

  props: {
    title: { type: String, required: true },
    icon: { type: String, required: false, default: null },
    results: { type: Number, required: false, default: null },
    addRoute: { type: String, required: false, default: null },
    hasExportButton: { type: Boolean, required: false, default: true },
    isLoadingExport: { type: Boolean, required: false, default: false },
  },

  emits: ['exportAll'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const { $gettext } = useGettext()

    const exportAction = () => {
      if (props.results > 1000) {
        $q.dialog({
          title: $gettext('Confirm'),
          message: $gettext('Do you want to export so many results?'),
          ok: { label: $gettext('Export'), icon: appIcon('export') },
          cancel: { label: $gettext('Cancel'), flat: true },
          persistent: true,
        }).onOk(async () => {
          emit('exportAll')
        })
      } else {
        emit('exportAll')
      }
    }

    return { exportAction, appIcon }
  },
})
</script>
