<template>
  <div class="q-py-md">
    <!-- Project name -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-select
          :model-value="selectedExistingProject"
          :options="existingProjects"
          option-label="name"
          option-value="name"
          :label="$gettext('Existing Project')"
          clearable
          emit-value
          map-options
          @update:model-value="$emit('select-existing', $event)"
        >
          <template #prepend>
            <q-icon :name="modelIcon('projects')" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-6">
        <q-input
          :model-value="newProjectName"
          :label="$gettext('Or enter a new project name')"
          :disable="!!selectedExistingProject"
          clearable
          @update:model-value="$emit('update:newProjectName', $event)"
        >
          <template #prepend>
            <q-icon name="mdi-plus" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Project configuration (from distro, editable) -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle2 text-weight-bold q-mb-sm flex items-center">
          <q-icon name="mdi-tune" class="q-mr-xs" />
          {{ $gettext('Project Configuration') }}
          <q-space />
          <q-btn
            flat
            dense
            round
            :icon="editingProject ? 'mdi-check-circle' : 'mdi-pencil-outline'"
            :color="editingProject ? 'positive' : 'primary'"
            @click="$emit('update:editingProject', !editingProject)"
          >
            <q-tooltip>{{
              editingProject
                ? $gettext('Finish editing')
                : $gettext('Edit configuration')
            }}</q-tooltip>
          </q-btn>
        </div>

        <!-- Read-only view -->
        <q-list v-if="!editingProject" dense>
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
              <q-icon name="mdi-package-variant" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $gettext('Package Manager') }}</q-item-label>
              <q-item-label caption>{{ editableProject.pms }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="mdi-chip" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $gettext('Architecture') }}</q-item-label>
              <q-item-label caption>{{
                editableProject.architecture
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Editable view -->
        <div v-else class="row q-col-gutter-sm">
          <div class="col-12 col-md-4">
            <q-input
              :model-value="editableProject.platform"
              :label="$gettext('Platform')"
              dense
              outlined
              @update:model-value="
                $emit('update:editableProject', {
                  ...editableProject,
                  platform: $event,
                })
              "
            >
              <template #prepend>
                <q-icon :name="modelIcon('platforms')" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-input
              :model-value="editableProject.pms"
              :label="$gettext('Package Manager')"
              dense
              outlined
              @update:model-value="
                $emit('update:editableProject', {
                  ...editableProject,
                  pms: $event,
                })
              "
            >
              <template #prepend>
                <q-icon name="mdi-package-variant" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-input
              :model-value="editableProject.architecture"
              :label="$gettext('Architecture')"
              dense
              outlined
              @update:model-value="
                $emit('update:editableProject', {
                  ...editableProject,
                  architecture: $event,
                })
              "
            >
              <template #prepend>
                <q-icon name="mdi-chip" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { modelIcon } from 'composables/element'

const { $gettext } = useGettext()

defineProps({
  selectedExistingProject: { type: [String, null], default: null },
  existingProjects: { type: Array, default: () => [] },
  newProjectName: { type: String, default: '' },
  editingProject: { type: Boolean, default: false },
  editableProject: { type: Object, required: true },
})

defineEmits([
  'update:newProjectName',
  'update:editingProject',
  'update:editableProject',
  'select-existing',
])
</script>
