<template>
  <q-card class="panel info-card overflow-hidden">
    <q-card-section class="q-pa-md">
      <!-- Header with Title and Creation Date -->
      <div class="panel-header row items-center justify-between q-mb-xl">
        <h2 class="panel-title">
          {{ $gettext('Computer Information') }}
        </h2>
        <div class="row items-center no-wrap">
          <DateView
            :value="createdAt"
            icon="mdi-calendar-plus"
            :tooltip-text="$gettext('Date of entry into the migasfree system')"
          />
        </div>
      </div>

      <!-- Hero Section: Name & FQDN -->
      <div class="glass-panel q-pa-lg q-mb-lg">
        <div class="row items-center no-wrap full-width">
          <!-- Avatar Icon -->
          <div class="hero-icon-section flex-center q-mr-md gt-xs">
            <q-icon
              name="mdi-laptop-account"
              size="20px"
              color="brand-primary"
            />
          </div>

          <div class="col overflow-hidden">
            <!-- Edit Mode -->
            <div
              v-if="isSuperUser && editing"
              class="row items-center no-wrap full-width"
            >
              <q-input
                ref="nameInput"
                v-model="value"
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
                size="sm"
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
              />
              <TextTooltip
                :text="fqdn"
                text-class="text-subtitle1 opacity-70"
              />
              <q-tooltip>{{
                $gettext('full qualified domain name')
              }}</q-tooltip>
              <CopyToClipboard
                :content="fqdn"
                size="xs"
                flat
                class="q-ml-xs opacity-30"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Data Grid -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Environment Section -->
        <div class="col-12">
          <div class="solid-panel">
            <div class="section-label">{{ $gettext('Environment') }}</div>

            <div class="row q-col-gutter-md">
              <!-- Platform -->
              <div class="col-12 col-sm-6">
                <div class="data-field">
                  <span class="data-field-label">{{
                    $gettext('Platform')
                  }}</span>
                  <div class="q-mt-xs">
                    <MigasLink
                      model="platforms"
                      :pk="project.platform.id"
                      :value="project.platform.name"
                    />
                  </div>
                </div>
              </div>

              <!-- Project -->
              <div class="col-12 col-sm-6">
                <div class="data-field">
                  <span class="data-field-label">{{
                    $gettext('Project')
                  }}</span>
                  <div class="q-mt-xs">
                    <MigasLink
                      model="projects"
                      :pk="project.id"
                      :value="project.name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Network Section -->
        <div v-if="ipAddress || forwardedIpAddress" class="col-12">
          <div class="glass-panel">
            <div class="section-label">{{ $gettext('Network') }}</div>

            <div class="row q-col-gutter-md">
              <!-- Main IP -->
              <div v-if="ipAddress" class="col-12 col-sm-6">
                <div class="data-field">
                  <span class="data-field-label">{{
                    $gettext('IP Address')
                  }}</span>
                  <div class="net-value-row q-mt-xs">
                    <q-icon name="mdi-ip-network" color="info" size="18px" />
                    <span class="text-mono text-weight-medium">{{
                      ipAddress
                    }}</span>
                    <CopyToClipboard
                      :content="ipAddress"
                      size="xs"
                      flat
                      class="opacity-40"
                    />
                  </div>
                </div>
              </div>

              <!-- Forwarded IP -->
              <div v-if="forwardedIpAddress" class="col-12 col-sm-6">
                <div class="data-field">
                  <span class="data-field-label">{{
                    $gettext('Forwarded IP')
                  }}</span>
                  <div class="net-value-row q-mt-xs">
                    <q-icon name="mdi-ip" size="18px" class="opacity-50" />
                    <span class="text-mono text-weight-medium">{{
                      forwardedIpAddress
                    }}</span>
                    <CopyToClipboard
                      :content="forwardedIpAddress"
                      size="xs"
                      flat
                      class="opacity-40"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Action Buttons -->
    <q-card-actions class="row justify-center q-gutter-sm q-px-md q-pb-md">
      <q-btn
        :icon="appIcon('events')"
        flat
        no-caps
        class="action-btn"
        :to="{
          name: 'computer-events',
          params: { id: cid },
        }"
        :label="$gettext('Events')"
      />

      <q-btn
        :icon="appIcon('simulate')"
        flat
        no-caps
        class="action-btn"
        :to="{
          name: 'computer-simulate',
          params: { id: cid },
        }"
        :label="$gettext('Simulate synchronization')"
      />

      <q-btn
        :icon="appIcon('identification')"
        flat
        no-caps
        class="action-btn"
        :to="{
          name: 'computer-label',
          params: { id: cid },
        }"
        :label="$gettext('Identification')"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { ref, nextTick } from 'vue'
import { useGettext } from 'vue3-gettext'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'

import CopyToClipboard from 'components/ui/CopyToClipboard'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'
import TextTooltip from 'components/ui/TextTooltip'

import { appIcon } from 'composables/element'

export default {
  name: 'ComputerInfo',
  components: {
    CopyToClipboard,
    DateView,
    MigasLink,
    TextTooltip,
  },
  props: {
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
    project: {
      type: Object,
      required: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: false,
      default: null,
    },
    forwardedIpAddress: {
      type: String,
      required: false,
      default: null,
    },
  },
  emits: ['update:name'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()
    const authStore = useAuthStore()

    const loading = ref(false)
    const value = ref(props.name)
    const editing = ref(false)
    const nameInput = ref(null)

    const startEdit = () => {
      value.value = props.name
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
          name: value.value,
        })
        uiStore.notifySuccess($gettext('Name has been changed!'))
        emit('update:name', value.value)
        editing.value = false
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      value,
      editing,
      nameInput,
      isSuperUser: authStore.user.is_superuser,
      startEdit,
      cancelEdit,
      saveName,
      appIcon,
    }
  },
}
</script>

<style scoped>
.info-card {
  max-width: 1000px;
  margin: auto;
}

.hero-icon-section {
  width: 44px;
  height: 44px;
  background: var(--warning-surface);
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
}

.net-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Action buttons */
.action-btn {
  background: rgba(var(--brand-primary-rgb), 0.05);
  border-radius: 12px;
  padding: 8px 20px;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(var(--brand-primary-rgb), 0.1);
}

[data-theme='dark'] .action-btn {
  background: rgba(255, 255, 255, 0.05);
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
