<template>
  <div class="q-pa-md q-gutter-sm">
    <q-circular-progress
      v-if="showing.schedule"
      show-value
      class="text-positive q-ma-md"
      :value="showing.schedule.percent"
      size="70px"
      :thickness="0.1"
      color="positive"
      track-color="grey-3"
    >
      <q-tooltip
        ><q-list dense>
          <q-item
            >{{ $gettext('Start') }}: {{ showing.schedule.begin_date }}</q-item
          >
          <q-item
            >{{ $gettext('End') }}: {{ showing.schedule.end_date }}</q-item
          >
        </q-list>
      </q-tooltip>
      <q-icon name="mdi-calendar-start" class="q-mr-xs" />
      {{ showing.schedule.percent }} %
    </q-circular-progress>

    <q-circular-progress
      show-value
      class="q-ma-md"
      color="positive"
      track-color="grey-3"
      size="70px"
      :thickness="0.1"
      :min="0"
      :max="showing.computers.assigned"
      :value="showing.computers.ok + showing.computers.error"
    >
      <q-icon name="mdi-desktop-classic" class="q-mr-xs" />
      {{ showing.computers.ok + showing.computers.error }}/<q-btn
        flat
        padding="xs"
        color="primary"
        :label="showing.computers.assigned"
        :disabled="loading"
        :loading="loading"
        @click="goToComputers"
        ><q-tooltip anchor="top middle" self="bottom middle">{{
          $gettext('View assigned Computers')
        }}</q-tooltip></q-btn
      >
      <q-tooltip
        ><q-list dense>
          <q-item
            >{{ $gettext('OK Computers') }}: {{ showing.computers.ok }}</q-item
          >
          <q-item
            >{{ $gettext('Computers with any error') }}:
            {{ showing.computers.error }}</q-item
          >
        </q-list>
      </q-tooltip>
    </q-circular-progress>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

export default {
  name: 'Timeline',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter()
    const uiStore = useUiStore()

    const loading = ref(false)
    const showing = ref(props.modelValue)

    const goToComputers = () => {
      if (props.id > 0) {
        loading.value = true
        api
          .get(
            `/api/v1/token/stats/deployments/${props.id}/computers/assigned/`,
          )
          .then((response) => {
            router.push({
              name: 'computers-list',
              query: { id_in: response.data.join(',') },
            })
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
          .finally(() => (loading.value = false))
      }
    }

    watch(
      () => props.modelValue,
      (newValue) => {
        showing.value = newValue
      },
      { deep: true },
    )

    return { loading, showing, goToComputers }
  },
}
</script>
