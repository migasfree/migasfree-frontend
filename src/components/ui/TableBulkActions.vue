<template>
  <slot name="selected-actions" />

  <template v-if="hasCheckActions">
    <q-btn
      class="q-ma-xs"
      size="sm"
      :icon="appIcon('check')"
      color="positive"
      :aria-label="$gettext('Check selected items')"
      @click="$emit('check-items')"
      ><q-tooltip>{{ $gettext('Check selected items') }}</q-tooltip></q-btn
    >

    <q-btn
      class="q-ma-xs"
      size="sm"
      :icon="appIcon('uncheck')"
      color="negative"
      :aria-label="$gettext('Not Check selected items')"
      @click="$emit('uncheck-items')"
      ><q-tooltip>{{ $gettext('Not Check selected items') }}</q-tooltip></q-btn
    >
  </template>

  <template v-if="hasEnableActions">
    <q-btn
      class="q-ma-xs"
      size="sm"
      :icon="appIcon('yes')"
      color="positive"
      :aria-label="$gettext('Enable selected items')"
      @click="$emit('enable-items')"
      ><q-tooltip>{{ $gettext('Enable selected items') }}</q-tooltip></q-btn
    >

    <q-btn
      class="q-ma-xs"
      size="sm"
      :icon="appIcon('no')"
      color="negative"
      :aria-label="$gettext('Disable selected items')"
      @click="$emit('disable-items')"
      ><q-tooltip>{{ $gettext('Disable selected items') }}</q-tooltip></q-btn
    >
  </template>

  <q-btn
    class="q-ma-xs"
    size="sm"
    color="primary"
    text-color="white"
    :icon="appIcon('export')"
    :loading="isLoadingExport"
    :aria-label="$gettext('Export selected items')"
    @click="$emit('export')"
    ><q-tooltip>{{ $gettext('Export selected items') }}</q-tooltip></q-btn
  >

  <q-btn
    v-if="hasDeleteAction"
    size="sm"
    color="negative"
    :icon="appIcon('delete')"
    :aria-label="$gettext('Delete selected items')"
    @click="$emit('delete')"
    ><q-tooltip>{{ $gettext('Delete selected items') }}</q-tooltip></q-btn
  >
</template>

<script setup>
import { appIcon } from 'composables/element'

defineOptions({ name: 'TableBulkActions' })

defineProps({
  hasCheckActions: { type: Boolean, default: false },
  hasEnableActions: { type: Boolean, default: false },
  hasDeleteAction: { type: Boolean, default: false },
  isLoadingExport: { type: Boolean, default: false },
})

defineEmits([
  'check-items',
  'uncheck-items',
  'enable-items',
  'disable-items',
  'export',
  'delete',
])
</script>
