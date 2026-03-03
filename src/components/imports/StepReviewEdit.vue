<template>
  <div class="q-py-md">
    <!-- Summary -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">
          {{ $gettext('Import Summary') }}
        </div>
        <q-list dense>
          <q-item>
            <q-item-section avatar>
              <q-icon :name="modelIcon('platforms')" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $gettext('Platform') }}</q-item-label>
              <q-item-label caption>{{
                editableProject.platform
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon :name="modelIcon('projects')" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $gettext('Project') }}</q-item-label>
              <q-item-label caption>{{ projectName }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon :name="modelIcon('stores')" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $gettext('Stores') }}</q-item-label>
              <q-item-label caption>org, thirds, updates</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Deployments -->
    <DeploymentEditor
      :deployments="editableDeployments"
      :selected-names="selectedDeploymentNames"
      :editing="editingDeployments"
      @update:editing="$emit('update:editingDeployments', $event)"
      @update:selected-names="$emit('update:selectedDeploymentNames', $event)"
      @update:deployments="$emit('update:editableDeployments', $event)"
      @add="$emit('add-deployment')"
      @remove="$emit('remove-deployment', $event)"
    />

    <!-- Applications -->
    <ApplicationEditor
      v-if="editableApps.length"
      :apps="editableApps"
      :selected-names="selectedAppNames"
      :editing="editingApps"
      @update:editing="$emit('update:editingApps', $event)"
      @update:selected-names="$emit('update:selectedAppNames', $event)"
      @update:apps="$emit('update:editableApps', $event)"
      @remove="$emit('remove-app', $event)"
    />
  </div>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { modelIcon } from 'composables/element'
import DeploymentEditor from './DeploymentEditor.vue'
import ApplicationEditor from './ApplicationEditor.vue'

const { $gettext } = useGettext()

defineProps({
  editableProject: { type: Object, required: true },
  projectName: { type: String, required: true },
  editableDeployments: { type: Array, required: true },
  selectedDeploymentNames: { type: Array, required: true },
  editingDeployments: { type: Boolean, default: false },
  editableApps: { type: Array, required: true },
  selectedAppNames: { type: Array, required: true },
  editingApps: { type: Boolean, default: false },
})

defineEmits([
  'update:editingDeployments',
  'update:selectedDeploymentNames',
  'update:editableDeployments',
  'add-deployment',
  'remove-deployment',
  'update:editingApps',
  'update:selectedAppNames',
  'update:editableApps',
  'remove-app',
])
</script>
