<template>
  <div class="row">
    <q-item class="col-12 items-baseline q-px-none">
      <template v-if="addRoutes.length > 0">
        <q-item-section v-for="(item, index) in addRoutes" :key="index" avatar>
          <q-btn
            round
            dark
            color="primary"
            icon="mdi-plus"
            @click="$router.push({ name: item.route })"
          >
            <q-tooltip>{{
              item.title ? item.title : $gettext('Add')
            }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </template>

      <q-item-section>
        <h2 class="text-h4">
          {{ title }}
          <q-chip v-if="results !== null" size="lg" color="info">{{
            results
          }}</q-chip>
          <q-btn
            v-if="hasExportButton"
            class="q-ma-sm float-right"
            color="info"
            text-color="black"
            :label="$gettext('Export')"
            icon="mdi-file-export"
            :loading="isLoadingExport"
            :disable="results === 0"
            @click="exportAction"
          />
          <slot name="append"></slot>
        </h2>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'Header',

  props: {
    title: { type: String, required: true },
    results: { type: Number, required: false, default: null },
    addRoutes: {
      type: Array,
      required: false,
      default() {
        return []
      },
    },
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
          ok: { label: $gettext('Export'), icon: 'mdi-file-export' },
          cancel: { label: $gettext('Cancel'), flat: true },
          persistent: true,
        }).onOk(async () => {
          emit('exportAll')
        })
      } else {
        emit('exportAll')
      }
    }

    return { exportAction }
  },
})
</script>
