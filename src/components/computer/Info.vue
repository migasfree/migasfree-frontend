<template>
  <q-card class="info-card shadow-2 rounded-borders">
    <q-card-section class="q-pb-none">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div
          class="text-h6 text-weight-bold"
          :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'"
        >
          {{ $gettext('General') }}
        </div>
        <div class="row items-center no-wrap">
          <DateView
            :value="createdAt"
            icon="mdi-calendar-plus"
            :tooltip-text="$gettext('Date of entry into the migasfree system')"
          />
        </div>
      </div>

      <!-- Hero Section: Name & FQDN -->
      <div
        class="row items-center q-pa-lg rounded-borders q-mb-lg hero-section"
        :class="$q.dark.isActive ? 'bg-blue-grey-10' : 'bg-blue-grey-1'"
      >
        <div class="col-12">
          <!-- Editable Name -->
          <q-btn-group v-if="isSuperUser" class="full-width">
            <q-input
              v-model="value"
              :label="$gettext('Name')"
              :aria-label="$gettext('Computer Name')"
              dense
              outlined
              class="col"
              style="border-top-right-radius: 0; border-bottom-right-radius: 0"
            />
            <q-btn
              color="primary"
              :icon="appIcon('save-edit')"
              :loading="loading"
              :disabled="loading"
              unelevated
              @click="updateName"
            >
              <q-tooltip>{{ $gettext('Save and continue editing') }}</q-tooltip>
            </q-btn>
          </q-btn-group>

          <!-- Readonly Name -->
          <div v-else class="row items-center no-wrap">
            <div
              class="text-h4 text-weight-medium q-mr-sm"
              :class="
                $q.dark.isActive ? 'text-blue-grey-2' : 'text-blue-grey-10'
              "
            >
              {{ name }}
            </div>
            <CopyToClipboard :content="name" size="sm" flat />
          </div>

          <!-- FQDN -->
          <div v-if="fqdn" class="row items-center no-wrap q-mt-sm">
            <q-icon
              :name="appIcon('information')"
              size="sm"
              class="q-mr-sm"
              :class="
                $q.dark.isActive ? 'text-blue-grey-4' : 'text-blue-grey-6'
              "
            />
            <span
              class="text-subtitle1"
              :class="
                $q.dark.isActive ? 'text-blue-grey-3' : 'text-blue-grey-7'
              "
            >
              {{ fqdn }}
              <q-tooltip>{{
                $gettext('full qualified domain name')
              }}</q-tooltip>
            </span>
            <CopyToClipboard :content="fqdn" size="xs" flat class="q-ml-xs" />
          </div>
        </div>
      </div>

      <!-- Info Grid 2x2 -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <!-- Platform -->
        <div class="col-12 col-sm-6">
          <div
            class="spec-box q-pa-md rounded-borders text-white"
            :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
          >
            <div class="col overflow-hidden">
              <div class="text-caption uppercase q-mb-sm text-white">
                {{ $gettext('Platform') }}
              </div>
              <MigasLink
                model="platforms"
                :pk="project.platform.id"
                :value="project.platform.name"
                class="migaslink-elevated"
                light
              />
            </div>
          </div>
        </div>

        <!-- Project -->
        <div class="col-12 col-sm-6">
          <div
            class="spec-box q-pa-md rounded-borders text-white"
            :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
          >
            <div class="col overflow-hidden">
              <div class="text-caption uppercase q-mb-sm text-white">
                {{ $gettext('Project') }}
              </div>
              <MigasLink
                model="projects"
                :pk="project.id"
                :value="project.name"
                class="migaslink-elevated"
                light
              />
            </div>
          </div>
        </div>

        <!-- IP Address -->
        <div v-if="ipAddress" class="col-12 col-sm-6">
          <div
            class="spec-box q-pa-md rounded-borders text-white"
            :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
          >
            <div class="row no-wrap items-center">
              <q-icon
                name="mdi-ip-network"
                size="md"
                class="q-mr-md"
                :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
              />
              <div class="col overflow-hidden">
                <div
                  class="text-caption uppercase q-mb-xs"
                  :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
                >
                  {{ $gettext('IP Address') }}
                </div>
                <div class="row no-wrap items-center">
                  <div class="text-subtitle1 text-weight-medium q-mr-sm">
                    {{ ipAddress }}
                  </div>
                  <CopyToClipboard
                    :content="ipAddress"
                    size="xs"
                    flat
                    :color="$q.dark.isActive ? 'blue-3' : 'blue-2'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Forwarded IP Address -->
        <div v-if="forwardedIpAddress" class="col-12 col-sm-6">
          <div
            class="spec-box q-pa-md rounded-borders text-white"
            :class="$q.dark.isActive ? 'bg-black' : 'bg-blue-grey-9'"
          >
            <div class="row no-wrap items-center">
              <q-icon
                name="mdi-ip"
                size="md"
                class="q-mr-md"
                :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
              />
              <div class="col overflow-hidden">
                <div
                  class="text-caption uppercase q-mb-xs"
                  :class="$q.dark.isActive ? 'text-blue-3' : 'text-blue-2'"
                >
                  {{ $gettext('Forwarded IP') }}
                </div>
                <div class="row no-wrap items-center">
                  <div class="text-subtitle1 text-weight-medium q-mr-sm">
                    {{ forwardedIpAddress }}
                  </div>
                  <CopyToClipboard
                    :content="forwardedIpAddress"
                    size="xs"
                    flat
                    :color="$q.dark.isActive ? 'blue-3' : 'blue-2'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Action Buttons -->
    <q-card-actions class="justify-around q-px-md q-pb-md">
      <q-btn
        :icon="appIcon('events')"
        outline
        color="primary"
        no-caps
        :to="{
          name: 'computer-events',
          params: { id: cid },
        }"
        :label="$gettext('Events')"
      />

      <q-btn
        :icon="appIcon('simulate')"
        outline
        color="primary"
        no-caps
        :to="{
          name: 'computer-simulate',
          params: { id: cid },
        }"
        :label="$gettext('Simulate synchronization')"
      />

      <q-btn
        icon="mdi-card-account-details-outline"
        outline
        color="primary"
        no-caps
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
import { ref } from 'vue'
import { useGettext } from 'vue3-gettext'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'
import { useAuthStore } from 'stores/auth'

import CopyToClipboard from 'components/ui/CopyToClipboard'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'

import { appIcon } from 'composables/element'

export default {
  name: 'ComputerInfo',
  components: {
    CopyToClipboard,
    DateView,
    MigasLink,
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
  setup(props) {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()
    const authStore = useAuthStore()

    const loading = ref(false)
    const value = ref(props.name)

    const updateName = async () => {
      loading.value = true
      try {
        await api.patch(`/api/v1/token/computers/${props.cid}/`, {
          name: value.value,
        })
        uiStore.notifySuccess($gettext('Name has been changed!'))
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      value,
      isSuperUser: authStore.user.is_superuser,
      updateName,
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
</style>
