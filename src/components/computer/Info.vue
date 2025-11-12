<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row">
        <div class="col">
          <div class="text-h5">{{ $gettext('General') }}</div>
        </div>
      </div>

      <div class="row q-py-sm">
        <div class="col col-md col-sm">
          <q-btn-group v-if="isSuperUser">
            <q-input v-model="value" outlined :label="$gettext('Name')" />
            <q-btn
              color="primary"
              :icon="appIcon('save-edit')"
              :loading="loading"
              :disabled="loading"
              @click="updateName"
            >
              <q-tooltip>{{ $gettext('Save and continue editing') }}</q-tooltip>
            </q-btn>
          </q-btn-group>
          <div v-else class="text-h5">
            {{ name }}
            <CopyToClipboard :content="name" />
          </div>
        </div>
      </div>

      <div class="row q-py-sm">
        <div class="col-6 col-md col-sm">
          <q-icon
            :name="appIcon('information')"
            size="sm"
            class="vertical-middle"
          />
          <span class="vertical-middle">
            {{ fqdn }}
            <q-tooltip>{{ $gettext('full qualified domain name') }}</q-tooltip>
          </span>
          <CopyToClipboard v-if="fqdn" :content="fqdn" />
        </div>

        <div class="col-6 col-md col-sm">
          <DateView
            :value="createdAt"
            icon="mdi-calendar-plus"
            :tooltip-text="$gettext('Date of entry into the migasfree system')"
          />
        </div>
      </div>

      <div class="row q-py-sm">
        <div class="col-6 col-md col-sm">
          <MigasLink
            model="platforms"
            :pk="project.platform.id"
            :value="project.platform.name"
            :tooltip="$gettext('Platform')"
          />
        </div>

        <div class="col-6 col-md col-sm">
          <MigasLink
            model="projects"
            :pk="project.id"
            :value="project.name"
            :tooltip="$gettext('Project')"
          />
        </div>
      </div>

      <div class="row q-py-sm">
        <div class="col-6 col-md col-sm">
          <q-icon name="mdi-ip-network" size="sm" class="vertical-middle" />
          <span class="vertical-middle">
            {{ ipAddress }}
            <q-tooltip>{{ $gettext('ip address') }}</q-tooltip>
          </span>
          <CopyToClipboard v-if="ipAddress" :content="ipAddress" />
        </div>

        <div class="col-6 col-md col-sm">
          <q-icon name="mdi-ip" size="sm" class="vertical-middle" />
          <span class="vertical-middle">
            {{ forwardedIpAddress }}
            <q-tooltip>{{ $gettext('forwarded ip address') }}</q-tooltip>
          </span>
          <CopyToClipboard
            v-if="forwardedIpAddress"
            :content="forwardedIpAddress"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-actions class="justify-between q-px-md">
      <q-btn
        :icon="appIcon('events')"
        color="info"
        text-color="black"
        no-caps
        :to="{
          name: 'computer-events',
          params: { id: cid },
        }"
        :label="$gettext('Events')"
      />

      <q-btn
        :icon="appIcon('simulate')"
        color="info"
        text-color="black"
        no-caps
        :to="{
          name: 'computer-simulate',
          params: { id: cid },
        }"
        :label="$gettext('Simulate synchronization')"
      />

      <q-btn
        icon="mdi-card-account-details-outline"
        color="info"
        text-color="black"
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
