<template>
  <div class="page-header no-wrap">
    <div class="title-group no-wrap col-grow">
      <q-icon v-if="icon" :name="icon" size="2rem" class="shrink-0" />
      <h1 class="ellipsis" :title="title">
        {{ title }}
      </h1>
      <q-chip
        v-if="results !== null"
        size="md"
        color="warning-surface"
        text-color="brand-primary"
        class="text-bold q-ma-none"
      >
        {{ results }}
      </q-chip>

      <div v-if="$slots.append" class="flex items-center gap-sm">
        <slot name="append"></slot>
      </div>
    </div>

    <!-- Actions -->
    <div class="header-actions row no-wrap items-center q-gutter-md q-ml-md">
      <q-btn
        v-if="addRoute"
        flat
        round
        size="1.1rem"
        color="primary"
        :icon="appIcon('add')"
        @click="$router.push({ name: addRoute })"
      >
        <q-tooltip>{{ addButtonTitle || $gettext('Add') }}</q-tooltip>
      </q-btn>

      <q-btn
        v-if="hasExportButton && results > 0"
        flat
        round
        size="1.1rem"
        color="primary"
        :icon="appIcon('export')"
        :loading="isLoadingExport"
        :disable="results === 0"
        @click="exportAction"
      >
        <q-tooltip>{{ $gettext('Export') }}</q-tooltip>
      </q-btn>

      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'
import { appIcon } from 'composables/element'

defineOptions({ name: 'Header' })

const LARGE_EXPORT_THRESHOLD = 1000

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: null },
  results: { type: Number, default: null },
  addRoute: { type: String, default: null },
  addButtonTitle: { type: String, default: null },
  hasExportButton: { type: Boolean, default: true },
  isLoadingExport: { type: Boolean, default: false },
})

const emit = defineEmits(['exportAll'])

const $q = useQuasar()
const { $gettext } = useGettext()

const exportAction = () => {
  if (props.results > LARGE_EXPORT_THRESHOLD) {
    $q.dialog({
      title: $gettext('Confirm Export'),
      message: $gettext(
        'Do you want to export so many results? This might take a while.',
      ),
      ok: { label: $gettext('Export'), flat: true, color: 'primary' },
      cancel: { label: $gettext('Cancel'), flat: true, color: 'negative' },
      persistent: true,
    }).onOk(() => emit('exportAll'))
  } else {
    emit('exportAll')
  }
}
</script>

<style scoped>
.header-actions {
  margin-left: auto;
}
</style>
