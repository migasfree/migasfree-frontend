<template>
  <q-btn-dropdown
    flat
    dense
    size="sm"
    class="q-pa-xs rounded-borders"
    color="grey-7"
    :icon="appIcon('download')"
    :aria-label="$gettext('Export menu')"
  >
    <q-tooltip>{{ $gettext('Export') }}</q-tooltip>
    <q-list dense>
      <q-item v-close-popup clickable @click="$emit('save-svg')">
        <q-item-section avatar>
          <q-icon name="mdi-file-image-outline" size="xs" aria-hidden="true" />
        </q-item-section>
        <q-item-section>SVG</q-item-section>
      </q-item>
      <q-item v-close-popup clickable @click="$emit('save-png')">
        <q-item-section avatar>
          <q-icon name="mdi-file-image-outline" size="xs" aria-hidden="true" />
        </q-item-section>
        <q-item-section>PNG</q-item-section>
      </q-item>
      <q-separator />
      <q-item v-close-popup clickable @click="$emit('export-data', 'csv')">
        <q-item-section avatar>
          <q-icon
            name="mdi-file-delimited-outline"
            size="xs"
            aria-hidden="true"
          />
        </q-item-section>
        <q-item-section>CSV</q-item-section>
      </q-item>
      <q-item v-close-popup clickable @click="$emit('export-data', 'json')">
        <q-item-section avatar>
          <q-icon name="mdi-code-json" size="xs" aria-hidden="true" />
        </q-item-section>
        <q-item-section>JSON</q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import { appIcon } from 'composables/element'

defineOptions({ name: 'ExportMenu' })

defineEmits(['save-svg', 'save-png', 'export-data'])
</script>
