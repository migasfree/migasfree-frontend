<template>
  <q-btn
    v-if="hasCheckActions && !row.checked"
    class="q-ma-xs action-btn-row"
    round
    flat
    size="sm"
    :icon="appIcon('check')"
    color="positive"
    :aria-label="$gettext('Check item')"
    @click="$emit('check', row.id)"
    ><q-tooltip>{{ $gettext('Check') }}</q-tooltip></q-btn
  >
  <q-btn
    v-if="hasCheckActions && row.checked"
    class="q-ma-xs action-btn-row"
    round
    flat
    size="sm"
    :icon="appIcon('uncheck')"
    color="negative"
    :aria-label="$gettext('Uncheck item')"
    @click="$emit('uncheck', row.id)"
    ><q-tooltip>{{ $gettext('Not Check') }}</q-tooltip></q-btn
  >
  <q-btn
    v-if="
      hasEnableActions &&
      !('enabled' in row && row.enabled) &&
      !('is_active' in row && row.is_active)
    "
    class="q-ma-xs action-btn-row"
    round
    flat
    size="sm"
    :icon="appIcon('yes')"
    color="positive"
    :aria-label="$gettext('Enable')"
    @click="$emit('enable', row.id)"
    ><q-tooltip>{{ $gettext('Enable') }}</q-tooltip></q-btn
  >
  <q-btn
    v-if="
      (hasEnableActions && 'enabled' in row && row.enabled) ||
      ('is_active' in row && row.is_active)
    "
    class="q-ma-xs action-btn-row"
    round
    flat
    size="sm"
    :icon="appIcon('no')"
    color="negative"
    :aria-label="$gettext('Disable')"
    @click="$emit('disable', row.id)"
    ><q-tooltip>{{ $gettext('Disable') }}</q-tooltip></q-btn
  >
  <q-btn
    v-if="detailRoute"
    class="q-ma-xs action-btn-row"
    round
    flat
    size="sm"
    :icon="appIcon('edit')"
    color="primary"
    :aria-label="$gettext('Edit')"
    @click="$emit('edit', row.id)"
    ><q-tooltip>{{ $gettext('Edit') }}</q-tooltip></q-btn
  >
  <q-btn
    v-if="hasDeleteAction"
    class="q-ma-xs action-btn-row"
    round
    flat
    size="sm"
    :icon="appIcon('delete')"
    color="negative"
    :aria-label="$gettext('Delete')"
    @click="$emit('delete', row.id)"
    ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
  >
</template>

<script setup>
import { appIcon } from 'composables/element'

defineOptions({ name: 'TableRowActions' })

defineProps({
  row: { type: Object, required: true },
  hasCheckActions: { type: Boolean, default: false },
  hasEnableActions: { type: Boolean, default: false },
  hasDeleteAction: { type: Boolean, default: false },
  detailRoute: { type: [String, Object], default: null },
})

defineEmits(['check', 'uncheck', 'enable', 'disable', 'edit', 'delete'])
</script>
