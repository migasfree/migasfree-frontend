<template>
  <div class="q-py-md">
    <q-banner class="bg-info text-white q-mb-md" rounded>
      <template #avatar>
        <q-icon name="mdi-information" />
      </template>
      {{
        $gettext(
          'Internal deployments require packages to be uploaded. Download them from the URLs below and upload the .deb/.rpm files.',
        )
      }}
    </q-banner>

    <q-card
      v-for="dep in internalDeployments"
      :key="dep.name"
      flat
      bordered
      class="q-mb-md"
    >
      <q-card-section>
        <div class="text-subtitle2 text-weight-bold">
          {{ dep.name }}
        </div>
        <div v-if="dep.url_download" class="text-caption q-mb-sm">
          {{ $gettext('Download URL') }}:
          <a :href="dep.url_download" target="_blank" class="text-primary">
            {{ dep.url_download }}
          </a>
        </div>
        <q-file
          :model-value="packageFiles[dep.name]"
          :label="$gettext('Upload packages (.deb, .rpm)')"
          multiple
          accept=".deb,.rpm"
          outlined
          counter
          use-chips
          @update:model-value="$emit('update:package-files', dep.name, $event)"
        >
          <template #prepend>
            <q-icon name="mdi-package-variant" />
          </template>
        </q-file>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'

const { $gettext } = useGettext()

defineProps({
  internalDeployments: { type: Array, required: true },
  packageFiles: { type: Object, required: true },
})

defineEmits(['update:package-files'])
</script>
