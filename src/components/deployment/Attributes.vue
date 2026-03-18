<template>
  <q-card class="panel">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-primary">
        {{ $gettext('To who (attributes)') }}
      </div>

      <div class="row q-py-md">
        <div class="col-12 col-md col-sm">
          <SelectAttributes
            :model-value="element.included_attributes"
            :label="$gettext('Included Attributes')"
            @update:model-value="updateElement('included_attributes', $event)"
          />
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-md col-sm">
          <SelectAttributes
            :model-value="element.excluded_attributes"
            :label="$gettext('Excluded Attributes')"
            @update:model-value="updateElement('excluded_attributes', $event)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import SelectAttributes from 'components/ui/SelectAttributes'

defineOptions({ name: 'DeploymentAttributes' })

defineProps({
  element: { type: Object, required: true },
})

const emit = defineEmits(['update-element'])
const { $gettext } = useGettext()

const updateElement = (key, value) => {
  emit('update-element', key, value)
}
</script>
