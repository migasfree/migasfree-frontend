<template>
  <div class="item-detail-layout">
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="originalTitle" :icon="titleIcon" :has-export-button="false">
      <template v-if="element.id" #append>
        <div class="header-metadata row items-center no-wrap">
          <MigasLink
            v-if="headerLink"
            :model="model"
            :pk="element.id"
            :value="headerValue"
            :icon="headerIcon"
            :tooltip="element.summary || element.description"
          />
          <span v-else class="vertical-middle">{{ elementText }}</span>
        </div>
      </template>

      <template #actions>
        <slot name="actions"></slot>

        <q-btn
          v-if="'add' in routes"
          class="q-ma-sm"
          color="primary"
          text-color="white"
          :aria-label="$gettext('Add')"
          :icon="appIcon('add')"
          @click="addElement"
        >
          <q-tooltip>{{ $gettext('Add') }}</q-tooltip>
        </q-btn>
      </template>
    </Header>

    <BannerInfo v-if="noData" :message="$gettext('No data available.')" />

    <p v-if="element.id === 0 && $route.params.id" class="text-center">
      <q-spinner-dots color="primary" size="3em" />
    </p>

    <!-- Main Content Card -->
    <div v-else class="row justify-center q-mt-lg">
      <q-card
        :flat="borderless"
        :bordered="!borderless"
        :class="[borderless ? 'transparent' : 'detail-card', 'col-12']"
      >
        <!-- Content Sections -->
        <q-card-section class="q-pa-xs">
          <slot name="fields"></slot>
        </q-card-section>

        <!-- Dynamic Actions Bar -->
        <template v-if="visibleActions">
          <q-separator v-if="!borderless" class="separator-inset" />

          <q-card-actions
            :class="[borderless ? 'q-pa-sm' : 'q-pa-lg', 'action-bar']"
          >
            <!-- Left Side Actions (Delete, etc) -->
            <div class="action-group-left">
              <slot name="actions-left">
                <q-btn
                  v-if="
                    removeButton && $route.params.id && element.id && !noData
                  "
                  flat
                  round
                  :icon="appIcon('delete')"
                  :color="$q.dark.isActive ? 'white' : 'negative'"
                  :class="{ 'reversed-delete': $q.dark.isActive }"
                  @click="confirmRemove = true"
                >
                  <q-tooltip>{{ $gettext('Delete') }}</q-tooltip>
                </q-btn>
              </slot>
            </div>

            <q-space />

            <!-- Right Side Actions (Save, Add, etc) -->
            <div class="action-group-right row items-center q-gutter-sm">
              <slot name="actions-right">
                <q-btn
                  v-if="addButton"
                  flat
                  round
                  color="secondary"
                  icon="mdi-plus-box-multiple-outline"
                  :aria-label="$gettext('Save and add other')"
                  :loading="loading"
                  :disabled="!isValid || loading"
                  @click="updateElement('add')"
                >
                  <q-tooltip>{{ $gettext('Save and add other') }}</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="continueButton"
                  flat
                  round
                  color="secondary"
                  :icon="appIcon('save-edit')"
                  :aria-label="$gettext('Save and continue editing')"
                  :loading="loading"
                  :disabled="!isValid || loading"
                  @click="updateElement"
                >
                  <q-tooltip>{{
                    $gettext('Save and continue editing')
                  }}</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="saveButton"
                  push
                  round
                  color="primary"
                  size="lg"
                  :icon="appIcon('save')"
                  :aria-label="$gettext('Save')"
                  :loading="loading"
                  :disabled="!isValid || loading"
                  @click="updateElement('return')"
                >
                  <q-tooltip>{{ $gettext('Save') }}</q-tooltip>
                </q-btn>
              </slot>
            </div>
          </q-card-actions>
        </template>
      </q-card>
    </div>

    <!-- Extra Slots -->
    <div class="extra-content q-mt-xl">
      <slot name="extra"></slot>
    </div>

    <RemoveDialog
      v-model="confirmRemove"
      @confirmed="remove"
      @canceled="confirmRemove = !confirmRemove"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import BannerInfo from 'components/ui/BannerInfo'
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'

import useDetail from 'composables/detail'
import { appIcon, modelIcon, useElement } from 'composables/element'

defineOptions({ name: 'ItemDetail' })

const props = defineProps({
  originalTitle: { type: String, required: true },
  icon: { type: String, default: null },
  breadcrumbs: { type: Array, required: true },
  model: { type: String, required: true },
  routes: { type: Object, required: true },
  element: { type: Object, required: true },
  elementData: { type: Function, default: () => {} },
  isValid: { type: Boolean, required: true },
  addButton: { type: Boolean, default: true },
  continueButton: { type: Boolean, default: true },
  saveButton: { type: Boolean, default: true },
  removeButton: { type: Boolean, default: true },
  headerLink: { type: Boolean, default: true },
  noData: { type: Boolean, default: false },
  visibleActions: { type: Boolean, default: true },
  borderless: { type: Boolean, default: false },
})

defineEmits([
  'loadRelated',
  'updateRelated',
  'setRelated',
  'resetRelated',
  'postRemove',
  'resetElement',
  'setTitle',
])

const confirmRemove = ref(false)
const titleIcon = props.icon || modelIcon(props.model)

const { loading, elementText, addElement, updateElement, remove } = useDetail(
  props.originalTitle,
  props.model,
  props.routes,
  props.breadcrumbs,
  props.element,
  props.elementData,
)

const { elementIcon, attributeValue } = useElement()

const ATTRIBUTE_MODELS = new Set(['features', 'tags'])

const headerValue = computed(() =>
  ATTRIBUTE_MODELS.has(props.model)
    ? attributeValue(props.element)
    : elementText.value,
)

const headerIcon = computed(() => {
  if (props.model === 'features')
    return elementIcon(props.element.property_att.prefix)
  if (props.model === 'computers') return elementIcon(props.element.status)
  return modelIcon(props.model)
})
</script>

<style scoped>
.item-detail-layout {
  max-width: 1400px;
  margin: 0 auto;
}

.detail-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  overflow: visible; /* To allow large round button to pop */
  transition: all 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
}

[data-theme='dark'] .detail-card {
  background: rgba(var(--bg-card-rgb), 0.6);
  backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.separator-inset {
  margin: 0 40px;
  opacity: 0.6;
}

.action-bar {
  min-height: 80px;
}

/* Specific styling for the main Save button to make it "pop" */
.action-bar :deep(.q-btn--push.q-btn--round) {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-bar :deep(.q-btn--push.q-btn--round:hover) {
  transform: scale(1.1);
}

[data-theme='dark'] .action-bar :deep(.q-btn--push) {
  background: var(--brand-primary) !important;
  color: var(--brand-on-primary) !important;
  box-shadow: 0 0 20px rgba(254, 252, 232, 0.15) !important;
  border: none !important;
}
</style>
