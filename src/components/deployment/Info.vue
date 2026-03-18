<template>
  <q-card class="panel">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-primary">
        {{ $gettext('General') }}
      </div>

      <div class="row q-gutter-md q-py-md">
        <div class="col-6 col-md col-sm">
          <q-checkbox
            v-bind="$attrs"
            :model-value="element.enabled"
            left-label
            :label="$gettext('Enabled?')"
            :aria-label="$gettext('Enabled?')"
            @update:model-value="updateElement('enabled', $event)"
          />
        </div>
        <div class="col-6 col-md col-sm">
          <q-input
            :model-value="element.name"
            :label="$gettext('Name')"
            :aria-label="$gettext('Name')"
            lazy-rules
            :rules="[(val) => !!val || $gettext('* Required')]"
            @update:model-value="updateElement('name', $event)"
          />
        </div>
      </div>

      <div class="row q-gutter-sm">
        <div class="col-6 col-md col-sm">
          <EntitySelect
            :model-value="element.project"
            :options="projects"
            :label="$gettext('Project')"
            :aria-label="$gettext('Project')"
            detail-route="project-detail"
            add-route="project-add"
            :add-tooltip="$gettext('Add Project')"
            :prepend-icon="modelIcon('projects')"
            lazy-rules
            :rules="[(val) => !!val || $gettext('* Required')]"
            @update:model-value="updateElement('project', $event)"
          />
        </div>

        <div class="col-6 col-md col-sm">
          <EntitySelect
            :model-value="element.domain"
            clearable
            :label="$gettext('Editable by Domain Administrators')"
            :options="domains"
            detail-route="domain-detail"
            add-route="domain-add"
            :add-tooltip="$gettext('Add Domain')"
            :prepend-icon="modelIcon('domains')"
            @update:model-value="updateElement('domain', $event)"
          />
        </div>
      </div>

      <div class="row q-gutter-sm">
        <div class="col-12 col-md col-sm">
          <q-input
            :model-value="element.comment"
            type="textarea"
            :label="$gettext('Comment')"
            :aria-label="$gettext('Comment')"
            @update:model-value="updateElement('comment', $event)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import EntitySelect from 'components/ui/EntitySelect'
import { modelIcon } from 'composables/element'

defineOptions({ name: 'DeploymentInfo' })

defineProps({
  element: { type: Object, required: true },
  projects: { type: Array, required: true },
  domains: { type: Array, required: true },
})

const emit = defineEmits(['update-element'])
const { $gettext } = useGettext()

const updateElement = (key, value) => {
  emit('update-element', key, value)
}
</script>
