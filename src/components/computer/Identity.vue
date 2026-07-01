<template>
  <q-card class="panel detail-card overflow-hidden">
    <q-card-section class="q-pa-md">
      <!-- Header with Title and Date of Entry -->
      <div class="panel-header row items-center justify-between q-mb-md">
        <h2 class="panel-title">
          {{ $gettext('Identity') }}
        </h2>

        <div class="row items-center no-wrap">
          <DateView
            v-if="createdAt"
            :value="createdAt"
            icon="mdi-calendar-plus"
            :tooltip-text="$gettext('Date of entry into the migasfree system')"
          />
        </div>
      </div>

      <!-- Hero Section & Status Row -->
      <div class="row q-col-gutter-md q-mb-md items-stretch">
        <!-- Hero Section: Name & FQDN -->
        <div class="col-12 col-sm-6">
          <div
            class="glass-panel q-pa-md full-height flex column justify-center"
          >
            <div class="row items-center no-wrap full-width">
              <div class="col overflow-hidden">
                <!-- Edit Mode -->
                <div
                  v-if="isSuperUser && editing"
                  class="row items-center no-wrap full-width"
                >
                  <q-input
                    ref="nameInput"
                    v-model="editValue"
                    dense
                    borderless
                    class="col name-input"
                    :placeholder="$gettext('Computer Name')"
                    @keyup.enter="saveName"
                    @keyup.esc="cancelEdit"
                  />
                  <div class="row no-wrap q-ml-sm">
                    <q-btn
                      flat
                      round
                      dense
                      icon="check"
                      color="positive"
                      :loading="loading"
                      @click="saveName"
                    >
                      <q-tooltip>{{ $gettext('Save') }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      color="negative"
                      @click="cancelEdit"
                    >
                      <q-tooltip>{{ $gettext('Cancel') }}</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <!-- Display Mode -->
                <div v-else class="row items-center no-wrap name-display-group">
                  <div class="text-h4 text-weight-medium q-mr-sm">
                    <TextTooltip :text="name" />
                  </div>
                  <q-btn
                    v-if="isSuperUser"
                    flat
                    round
                    dense
                    icon="mdi-pencil-outline"
                    class="edit-trigger opacity-40"
                    @click="startEdit"
                  >
                    <q-tooltip>{{ $gettext('Edit name') }}</q-tooltip>
                  </q-btn>
                  <CopyToClipboard
                    :content="name"
                    size="md"
                    flat
                    class="opacity-40"
                  />
                </div>

                <!-- FQDN -->
                <div v-if="fqdn" class="row items-center no-wrap q-mt-sm">
                  <q-icon
                    name="mdi-dns-outline"
                    size="16px"
                    class="q-mr-xs opacity-50"
                    aria-hidden="true"
                  />
                  <TextTooltip
                    :text="fqdn"
                    text-class="text-subtitle1 opacity-70"
                  />
                  <CopyToClipboard
                    :content="fqdn"
                    size="sm"
                    flat
                    class="q-ml-xs opacity-30"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="col-12 col-sm-6 flex items-center">
          <q-select
            :model-value="status"
            emit-value
            map-options
            outlined
            dense
            :label="$gettext('Status')"
            :options="statusOptions"
            :readonly="!isSuperUser"
            behavior="menu"
            class="full-width"
            @update:model-value="emit('update:status', $event)"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon
                    :name="scope.opt.icon"
                    :color="getStatusColor(scope.opt.value)"
                    aria-hidden="true"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{
                    scope.opt.label
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>

            <template #selected-item="scope">
              <q-item v-bind="scope.itemProps" class="q-pa-none">
                <q-item-section avatar class="min-width-0 q-pr-sm">
                  <q-icon
                    :name="scope.opt.icon"
                    :color="getStatusColor(scope.opt.value)"
                    aria-hidden="true"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{
                    scope.opt.label
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <!-- Other editable fields -->
      <div class="row q-col-gutter-md">
        <!-- Tags -->
        <div class="col-12">
          <FilteredMultiSelect
            :model-value="tags"
            :label="$gettext('Tags')"
            :fetch-options="filterTags"
            :readonly="!isSuperUser"
            @update:model-value="emit('update:tags', $event)"
          >
            <template #option="{ scope }">
              <q-item v-bind="scope.itemProps">
                {{ attributeValue(scope.opt) }}
              </q-item>
            </template>

            <template #selected-item="{ scope }">
              <q-chip
                removable
                dense
                color="transparent"
                :tabindex="scope.tabindex"
                class="q-ma-sm q-pa-none"
                @remove="scope.removeAtIndex(scope.index)"
              >
                <MigasLink
                  model="tags"
                  :pk="scope.opt.id"
                  :value="attributeValue(scope.opt)"
                  :tooltip="scope.opt.description"
                />
              </q-chip>
            </template>
          </FilteredMultiSelect>
        </div>

        <!-- Comment -->
        <div class="col-12">
          <q-input
            :model-value="comment"
            type="textarea"
            rows="3"
            :label="$gettext('Comment')"
            outlined
            autogrow
            :readonly="!isSuperUser"
            @update:model-value="emit('update:comment', $event)"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Save Actions (superuser only) -->
    <q-card-actions
      v-if="isSuperUser"
      class="row justify-center q-px-lg q-pb-lg q-mt-md"
    >
      <q-btn
        unelevated
        color="primary"
        :icon="appIcon('save-edit')"
        :loading="loading"
        :disabled="loading"
        class="full-width"
        :label="$gettext('Save and continue editing')"
        @click="saveIdentity"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useGettext } from 'vue3-gettext'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { appIcon, useElement } from 'composables/element'

import CopyToClipboard from 'components/ui/CopyToClipboard'
import DateView from 'components/ui/DateView'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import MigasLink from 'components/MigasLink'
import TextTooltip from 'components/ui/TextTooltip'

defineOptions({
  name: 'ComputerIdentity',
})

const props = defineProps({
  cid: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  fqdn: {
    type: String,
    required: false,
    default: null,
  },
  createdAt: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: '',
  },
  comment: {
    type: String,
    default: '',
  },
  tags: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  isSuperUser: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:name',
  'update:status',
  'update:comment',
  'update:tags',
])

const { $gettext } = useGettext()
const uiStore = useUiStore()
const { attributeValue } = useElement()

const loading = ref(false)
const editing = ref(false)
const editValue = ref('')
const nameInput = ref(null)

const startEdit = () => {
  editValue.value = props.name
  editing.value = true
  nextTick(() => {
    if (nameInput.value) nameInput.value.focus()
  })
}

const cancelEdit = () => {
  editing.value = false
}

const saveName = async () => {
  loading.value = true
  try {
    await api.patch(`/api/v1/token/computers/${props.cid}/`, {
      name: editValue.value,
    })
    uiStore.notifySuccess($gettext('Name has been changed!'))
    emit('update:name', editValue.value)
    editing.value = false
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
  }
}

const filterTags = async (val) => {
  const { data } = await api.get('/api/v1/token/tags/', {
    params: { search: val.toLowerCase() },
  })
  return data.results
}

const saveIdentity = async () => {
  loading.value = true
  try {
    await api.patch(`/api/v1/token/computers/${props.cid}/`, {
      status: props.status,
      comment: props.comment,
      tags: props.tags ? props.tags.map((t) => t.id) : [],
    })
    uiStore.notifySuccess($gettext('Identity has been changed!'))
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'OK':
      return 'positive'
    case 'REP':
      return 'warning'
    case 'RET':
      return 'negative'
    default:
      return 'grey-6'
  }
}
</script>

<style scoped>
.panel-title {
  margin: 0;
}

/* Edit micro-interaction */
.name-display-group .edit-trigger {
  transition: opacity 0.2s;
}

.name-display-group:hover .edit-trigger {
  opacity: 0.8 !important;
}

.name-input :deep(.q-field__native) {
  font-size: 1.5rem;
  line-height: 1.2;
  color: var(--brand-primary);
  font-weight: 700;
  letter-spacing: -0.02em;
}

[data-theme='dark'] .name-input :deep(.q-field__native) {
  color: var(--brand-tertiary);
}
</style>
