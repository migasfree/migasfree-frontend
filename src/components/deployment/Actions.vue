<template>
  <q-card class="panel">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-primary">
        {{ $gettext('Actions') }}
      </div>

      <div class="row q-py-md q-col-gutter-sm">
        <div class="col-6 col-md col-sm">
          <OrderTextArea
            :model-value="element.packages_to_install"
            :label="$gettext('Packages to Install')"
            :aria-label="$gettext('Packages to Install')"
            @update:model-value="updateElement('packages_to_install', $event)"
          >
            <template #prepend>
              <q-icon :name="appIcon('install')" />
            </template>
          </OrderTextArea>
        </div>

        <div class="col-6 col-md col-sm">
          <OrderTextArea
            :model-value="element.packages_to_remove"
            :label="$gettext('Packages to Remove')"
            :aria-label="$gettext('Packages to Remove')"
            @update:model-value="updateElement('packages_to_remove', $event)"
          >
            <template #prepend>
              <q-icon :name="appIcon('uninstall')" />
            </template>
          </OrderTextArea>
        </div>
      </div>

      <div class="row q-pb-md">
        <div class="col">
          <OrderTextArea
            :model-value="element.default_preincluded_packages"
            :label="$gettext('Default Preincluded Packages')"
            :aria-label="$gettext('Default Preincluded Packages')"
            @update:model-value="
              updateElement('default_preincluded_packages', $event)
            "
          >
            <template #prepend>
              <q-icon :name="appIcon('install')" />
            </template>
          </OrderTextArea>
        </div>
      </div>

      <div class="row q-pb-md">
        <div class="col">
          <OrderTextArea
            :model-value="element.default_included_packages"
            :label="$gettext('Default Included Packages')"
            :aria-label="$gettext('Default Included Packages')"
            @update:model-value="
              updateElement('default_included_packages', $event)
            "
          >
            <template #prepend>
              <q-icon :name="appIcon('install')" />
            </template>
          </OrderTextArea>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <OrderTextArea
            :model-value="element.default_excluded_packages"
            :label="$gettext('Default Excluded Packages')"
            :aria-label="$gettext('Default Excluded Packages')"
            @update:model-value="
              updateElement('default_excluded_packages', $event)
            "
          >
            <template #prepend>
              <q-icon :name="appIcon('uninstall')" />
            </template>
          </OrderTextArea>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import OrderTextArea from 'components/ui/OrderTextArea'
import { appIcon } from 'composables/element'

defineOptions({ name: 'DeploymentActions' })

defineProps({
  element: { type: Object, required: true },
})

const emit = defineEmits(['update-element'])
const { $gettext } = useGettext()

const updateElement = (key, value) => {
  emit('update-element', key, value)
}
</script>
