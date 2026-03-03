<template>
  <div class="q-py-md">
    <q-linear-progress
      :value="progressPercent / 100"
      size="25px"
      color="primary"
      track-color="grey-3"
      class="q-mb-md"
      rounded
    >
      <div class="absolute-full flex flex-center">
        <q-badge
          color="white"
          text-color="primary"
          :label="`${progressPercent}%`"
        />
      </div>
    </q-linear-progress>

    <div class="text-subtitle2 q-mb-sm">
      <q-icon
        name="mdi-cog"
        class="q-mr-xs"
        :class="{ 'mdi-spin': isRunning }"
      />
      {{ currentStep || $gettext('Waiting...') }}
    </div>

    <q-card flat bordered class="log-container">
      <q-card-section class="q-pa-sm">
        <q-virtual-scroll
          ref="logScroll"
          :items="logs"
          separator
          style="max-height: 300px"
        >
          <template #default="{ item, index }">
            <q-item :key="index" dense>
              <q-item-section side>
                <q-icon
                  :name="logIcon(item.type)"
                  :color="logColor(item.type)"
                  size="xs"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption">
                  {{ item.message }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-caption text-grey">
                  {{ formatTime(item.timestamp) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()

defineProps({
  progressPercent: { type: Number, default: 0 },
  isRunning: { type: Boolean, default: false },
  currentStep: { type: String, default: '' },
  logs: { type: Array, required: true },
})

const logIcon = (type) => {
  const icons = {
    info: 'mdi-information-outline',
    success: 'mdi-check-circle-outline',
    warning: 'mdi-alert-outline',
    error: 'mdi-close-circle-outline',
  }
  return icons[type] || icons.info
}

const logColor = (type) => {
  const colors = {
    info: 'blue',
    success: 'positive',
    warning: 'warning',
    error: 'negative',
  }
  return colors[type] || colors.info
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.log-container {
  font-family: monospace;
}
</style>
