<template>
  <div>
    <!-- Template source toggle -->
    <q-btn-toggle
      :model-value="templateSource"
      spread
      no-caps
      rounded
      toggle-color="primary"
      class="q-mb-md"
      role="radiogroup"
      :aria-label="$gettext('Template source')"
      :options="[
        {
          label: $gettext('Bundled Templates'),
          value: 'bundled',
          icon: appIcon('packages'),
        },
        {
          label: $gettext('Upload Custom Template'),
          value: 'upload',
          icon: appIcon('upload'),
        },
      ]"
      @update:model-value="$emit('update:templateSource', $event)"
    />

    <!-- Upload custom template -->
    <div v-if="templateSource === 'upload'" class="q-py-md">
      <q-file
        :model-value="customTemplateFile"
        :label="$gettext('Select a template.json file')"
        accept=".json"
        outlined
        @update:model-value="$emit('custom-template-selected', $event)"
      >
        <template #prepend>
          <q-icon name="mdi-file-code" />
        </template>
        <template v-if="customTemplateFile" #append>
          <q-icon
            name="mdi-close-circle"
            class="cursor-pointer"
            @click.stop="$emit('clear-custom-template')"
          />
        </template>
      </q-file>

      <q-banner
        v-if="templateError"
        class="bg-negative text-white q-mt-sm"
        rounded
      >
        <template #avatar>
          <q-icon name="mdi-alert-circle" />
        </template>
        <div class="template-error">{{ templateError }}</div>
      </q-banner>
    </div>

    <!-- Bundled template loading states -->
    <template v-if="templateSource === 'bundled'">
      <div v-if="templateError" class="text-negative q-pa-md">
        <q-icon name="mdi-alert-circle" size="sm" class="q-mr-sm" />
        {{ templateError }}
      </div>

      <div v-else-if="!template" class="text-center q-pa-xl">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-subtitle1">
          {{ $gettext('Loading template...') }}
        </div>
      </div>
    </template>

    <!-- Distro cards -->
    <div v-if="template" class="row q-col-gutter-md q-py-md">
      <div
        v-for="distro in template.distros"
        :key="distro.name"
        class="col-6 col-md-3 col-sm-6"
      >
        <q-card
          flat
          bordered
          class="cursor-pointer distro-card"
          :class="{
            'distro-card--selected': selectedDistro === distro.name,
          }"
          @click="$emit('update:selectedDistro', distro.name)"
        >
          <q-card-section class="text-center">
            <q-icon name="mdi-linux" size="48px" class="q-mb-sm" />
            <div class="text-subtitle1 text-weight-bold">
              {{ distro.name }}
            </div>
            <div class="text-caption text-grey">
              {{ distro.platform }} · {{ distro.pms }} ·
              {{ distro.architecture }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-stepper-navigation>
      <q-btn
        color="primary"
        :label="$gettext('Continue')"
        :disable="!selectedDistro"
        @click="$emit('continue')"
      />
    </q-stepper-navigation>
  </div>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()

defineProps({
  templateSource: { type: String, required: true },
  customTemplateFile: { type: [Object, null], default: null },
  templateError: { type: [String, null], default: null },
  template: { type: [Object, null], default: null },
  selectedDistro: { type: [String, null], default: null },
})

defineEmits([
  'update:templateSource',
  'update:selectedDistro',
  'custom-template-selected',
  'clear-custom-template',
  'continue',
])
</script>

<style scoped>
.distro-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.distro-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.distro-card--selected {
  border-color: var(--brand-primary, var(--q-primary));
  background: rgba(81, 45, 10, 0.05);
}

[data-theme='dark'] .distro-card--selected {
  background: rgba(254, 252, 232, 0.08);
}

.template-error {
  white-space: pre-line;
  font-size: 0.85rem;
}
</style>
