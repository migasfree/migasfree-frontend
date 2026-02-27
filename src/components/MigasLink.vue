<template>
  <div class="link-container">
    <!-- Clickable area: icon + label -->
    <component
      :is="link ? 'router-link' : 'div'"
      :to="link || undefined"
      class="link-area"
    >
      <q-icon v-if="resolvedIcon" :name="resolvedIcon" class="trigger-icon" />

      <div class="trigger-label">
        <template v-if="prefix">
          <div class="label-badge">
            <span class="badge-prefix">{{ prefix }}</span>
            <span class="badge-suffix">
              <TextTooltip :text="suffix" />
            </span>
          </div>
        </template>
        <span v-else><TextTooltip :text="value" /></span>
      </div>

      <!-- Tooltip -->
      <q-tooltip v-if="tooltip" class="glass-tooltip">
        <div
          v-for="(item, index) in tooltipItems"
          :key="index"
          class="row items-center q-my-xs"
        >
          <q-icon
            v-if="item.icon"
            :name="item.icon"
            size="xs"
            class="q-mr-sm"
          />
          <span>{{ item.text }}</span>
        </div>
      </q-tooltip>
    </component>

    <!-- CONTEXT MENU -->
    <q-btn
      flat
      round
      dense
      icon="more_vert"
      class="context-trigger-btn"
      :color="light ? 'white' : undefined"
      @click.stop
    >
      <q-menu
        class="popover-menu"
        :offset="[0, 10]"
        auto-close
        @before-show="fetchRelations"
      >
        <div class="popover-content-wrapper">
          <!-- Loading -->
          <div v-if="loading" class="popover-loading">
            <q-spinner color="primary" size="2em" />
          </div>

          <!-- Relations -->
          <div v-else-if="resolvedRelations.length > 0" class="popover-list">
            <div
              v-for="(item, index) in resolvedRelations"
              :key="index"
              class="popover-group"
            >
              <div
                v-ripple
                class="popover-item"
                :class="{ 'cursor-pointer': !!item.to }"
                role="button"
                tabindex="0"
                @click="item.to ? router.push(item.to) : null"
                @keyup.enter="item.to ? router.push(item.to) : null"
              >
                <span class="item-label">{{ item.text }}</span>
                <span class="item-badge">
                  {{ abbreviateNumber(item.count, 0) }}
                </span>
                <q-tooltip
                  v-if="
                    abbreviateNumber(item.count, 0).toString() !==
                    item.count.toString()
                  "
                  class="glass-tooltip"
                >
                  {{ item.count }}
                </q-tooltip>
              </div>

              <!-- Actions -->
              <div v-if="item.actions?.length" class="relation-actions">
                <q-btn
                  v-for="action in item.actions"
                  :key="action.title"
                  flat
                  dense
                  no-caps
                  size="sm"
                  class="action-chip"
                  :href="action.url"
                  type="a"
                  @click.stop
                >
                  {{ action.title }}
                  <q-tooltip v-if="action.description" class="glass-tooltip">
                    {{ action.description }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else class="popover-empty">
            {{ $gettext('No relations found') }}
          </div>
        </div>
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { abbreviateNumber } from 'js-abbreviation-number'
import pluralize from 'pluralize-esm'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { modelIcon, useElement } from 'composables/element'
import { MAX_PREFIX_LEN } from 'config/app.conf'

import TextTooltip from './ui/TextTooltip.vue'

const props = defineProps({
  model: { type: String, required: true },
  pk: { type: Number, required: true },
  value: { type: String, required: true },
  tooltip: { type: String, default: '' },
  icon: { type: String, default: '' },
  light: { type: Boolean, default: false },
})

const router = useRouter()
const uiStore = useUiStore()
const { computerStatus, elementIcon } = useElement()

const rawRelations = ref(null)
const resolvedRelations = ref([])
const loading = ref(false)

// --- Model normalization ---

const MODEL_ALIASES = {
  synchronizations: 'syncs',
  applications: 'apps',
  application: 'app',
  type: 'device-type',
  types: 'device-types',
  logical: 'logical-devices',
  apps: 'applications',
  attributes: 'features',
  properties: 'formulas',
}

const EXCLUDED_API_MODELS = new Set([
  'catalog/project-packages',
  'catalog/policy-groups',
])

const normalizeModel = (model) => {
  const cleaned = model
    .replaceAll(' ', '-')
    .replace('devices/', '')
    .replace('catalog/', '')
  return MODEL_ALIASES[cleaned] ?? cleaned
}

const normalizeQuery = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.replaceAll('__', '_'), v]),
  )

// --- Computed ---

const resolvedIcon = computed(() => props.icon || modelIcon(props.model))

const link = computed(
  () => `/${normalizeModel(props.model)}/results/${props.pk}`,
)

const tooltipItems = computed(() => {
  if (props.model !== 'computers') {
    return [{ icon: '', text: props.tooltip.trim() }]
  }

  const pieces = props.tooltip.split(',').map((p) => p.trim())
  if (pieces.length < 4) return [{ text: props.tooltip }]

  return [
    { icon: elementIcon(pieces[0]), text: computerStatus(pieces[0]) },
    { icon: modelIcon('projects'), text: pieces[1] },
    { icon: 'mdi-ip-network', text: pieces[2] },
    { icon: modelIcon('users'), text: pieces[3] },
  ]
})

// Prefix/suffix parsing (single split)
const parsedValue = computed(() => {
  const canHavePrefix =
    ['attributes', 'features', 'tags'].includes(props.model) &&
    props.value.includes('-') &&
    props.value !== props.tooltip

  if (!canHavePrefix) return null

  const dashIndex = props.value.indexOf('-')
  const pre = props.value.slice(0, dashIndex)

  if (pre.length > MAX_PREFIX_LEN) return null

  return { prefix: pre, suffix: props.value.slice(dashIndex + 1) }
})

const prefix = computed(() => parsedValue.value?.prefix ?? '')
const suffix = computed(() => parsedValue.value?.suffix ?? '')

// --- Relations ---

const resolveRoute = (name, params, query) => {
  const resolved = router.resolve({ name, params, query })
  return resolved.matched.length > 0 ? { name, params, query } : null
}

const buildRelationRoute = (item) => {
  if (item.model && item.pk) {
    let name = `${normalizeModel(pluralize.singular(item.model))}-detail`
    if (name === 'logical-devices-detail') name = 'logical-device-detail'
    return resolveRoute(name, { id: item.pk })
  }

  if (item.model) {
    const name = `${item.model.replaceAll(' ', '-')}-list`
    return resolveRoute(name)
  }

  if (item.api && !EXCLUDED_API_MODELS.has(item.api.model)) {
    const name = `${normalizeModel(item.api.model)}-list`
    return resolveRoute(name, undefined, normalizeQuery(item.api.query))
  }

  return null
}

const processRelations = (data) => {
  resolvedRelations.value = data.map((item) => ({
    count: item.count,
    text: item.text,
    actions: item.actions,
    to: buildRelationRoute(item),
  }))
}

const fetchRelations = async () => {
  // Cache: skip if already fetched for this pk
  if (rawRelations.value !== null) return

  loading.value = true
  try {
    const { data } = await api.get(
      `/api/v1/token/${props.model}/${props.pk}/relations/`,
    )
    rawRelations.value = data
    processRelations(data)
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Container */
.link-container {
  display: inline-flex;
  align-self: flex-start;
  width: fit-content;
  align-items: center;
  padding: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--brand-primary);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  max-width: 100%;
}

.link-container:hover {
  border-color: var(--brand-primary);
}

/* Clickable area: icon + label */
.link-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  padding: 0.4rem 0.2rem 0.4rem 0.8rem;
  border-radius: 9px;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.link-area:hover {
  background: rgba(var(--brand-primary-rgb), 0.06);
}

[data-theme='dark'] .link-area:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* Icon */
.trigger-icon {
  font-size: 1.2rem;
  color: var(--brand-primary);
  opacity: 0.9;
  flex-shrink: 0;
}

[data-theme='dark'] .trigger-icon {
  color: var(--brand-tertiary);
}

/* Label */
.trigger-label {
  font-size: 0.875rem;
  flex: 1;
  min-width: 0;
}

/* Context menu button */
.context-trigger-btn {
  margin-right: 2px;
  opacity: 0.7;
  color: inherit;
}

.context-trigger-btn:hover {
  opacity: 1;
}

/* Migas Badge: Joined prefix and suffix */
.label-badge {
  display: inline-flex;
  align-items: stretch;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(var(--brand-primary-rgb), 0.2);
  height: 24px;
}

.badge-prefix {
  background: var(--brand-primary);
  color: #fff;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-suffix {
  background: rgba(var(--brand-primary-rgb), 0.05);
  color: var(--brand-primary);
  padding: 0 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  min-width: 0;
}

[data-theme='dark'] .label-badge {
  border-color: rgba(var(--brand-tertiary-rgb), 0.3);
}

[data-theme='dark'] .badge-prefix {
  background: var(--brand-tertiary);
  color: #000;
}

[data-theme='dark'] .badge-suffix {
  background: rgba(var(--brand-tertiary-rgb), 0.1);
  color: var(--brand-tertiary);
}

/* Popover content */
.popover-loading,
.popover-empty {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  color: var(--neutral-500);
  min-width: 200px;
}

.popover-list {
  padding: 0.5rem;
  min-width: 260px;
}

.popover-group {
  border-radius: 10px;
  margin-bottom: 2px;
}

.popover-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  color: inherit;
  gap: 0.75rem;
  transition: background-color 0.15s ease;
}

.popover-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.item-label {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
}

.item-badge {
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 6px;
  min-width: 20px;
  text-align: center;
}

/* Action buttons */
.relation-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0 1rem 0.5rem 1rem;
}

.action-chip {
  font-size: 10px;
  background: rgba(0, 0, 0, 0.04);
  color: var(--brand-primary);
}

.action-chip:hover {
  background: var(--brand-primary);
  color: var(--brand-on-primary);
}
</style>

<style>
/* Popover menu (teleported, needs global scope) */
.popover-menu {
  border-radius: 16px !important;
  border: 1px solid var(--border);
  overflow: hidden;
  background: rgba(var(--bg-card-rgb), 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 320px;
}

[data-theme='dark'] .popover-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

[data-theme='dark'] .item-badge {
  background: rgba(255, 255, 255, 0.1);
}
</style>
