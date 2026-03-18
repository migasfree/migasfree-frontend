<template>
  <q-card class="panel">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-primary">
        {{ $gettext('What (packages)') }}
      </div>

      <div v-if="element.id === 0" class="row q-py-md">
        <div class="col-12 col-md col-sm">
          <q-select
            v-model="source"
            class="q-my-md"
            :label="$gettext('Source')"
            :aria-label="$gettext('Source')"
            :options="sources"
            option-value="id"
            option-label="name"
            @update:model-value="updateElement('source', source.id)"
          />
        </div>
      </div>

      <template v-if="element.source === 'I'">
        <div class="row q-pb-md">
          <div class="col-12 col-md col-sm">
            <FilteredMultiSelect
              :model-value="element.available_packages"
              clearable
              :label="$gettext('Available Packages')"
              :aria-label="$gettext('Available Packages')"
              :fetch-options="filterPackages"
              @update:model-value="updateElement('available_packages', $event)"
            >
              <template #option="{ scope }">
                <q-item v-bind="scope.itemProps">
                  {{ scope.opt.fullname }}
                </q-item>
              </template>

              <template #selected-item="{ scope }">
                <q-chip
                  removable
                  dense
                  color="transparent"
                  :tabindex="scope.tabindex"
                  class="q-ma-md q-pa-none"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="packages"
                    :pk="scope.opt.id"
                    :value="scope.opt.fullname"
                  />
                </q-chip>
              </template>
            </FilteredMultiSelect>
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md col-sm">
            <FilteredMultiSelect
              :model-value="element.available_package_sets"
              clearable
              :label="$gettext('Available Package Sets')"
              :aria-label="$gettext('Available Package Sets')"
              :fetch-options="filterPackageSets"
              @update:model-value="updateElement('available_package_sets', $event)"
            >
              <template #option="{ scope }">
                <q-item v-bind="scope.itemProps">
                  {{ scope.opt.name }}
                </q-item>
              </template>

              <template #selected-item="{ scope }">
                <q-chip
                  removable
                  dense
                  color="transparent"
                  :tabindex="scope.tabindex"
                  class="q-ma-md q-pa-none"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="package-sets"
                    :pk="scope.opt.id"
                    :value="scope.opt.name"
                  />
                </q-chip>
              </template>
            </FilteredMultiSelect>
          </div>
        </div>
      </template>

      <template v-if="element.source === 'E'">
        <div class="row">
          <div class="col-12 col-md col-sm">
            <q-input
              :model-value="element.base_url"
              class="q-my-md"
              :label="$gettext('Base URL')"
              @update:model-value="updateElement('base_url', $event)"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md col-sm">
            <q-input
              :model-value="element.suite"
              class="q-my-md"
              :label="$gettext('Suite')"
              @update:model-value="updateElement('suite', $event)"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md col-sm">
            <q-input
              :model-value="element.components"
              class="q-my-md"
              :label="$gettext('Components')"
              :aria-label="$gettext('Components')"
              @update:model-value="updateElement('components', $event)"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md col-sm">
            <q-input
              :model-value="element.options"
              class="q-my-md"
              :label="$gettext('Options')"
              :aria-label="$gettext('Options')"
              @update:model-value="updateElement('options', $event)"
            />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6 col-md col-sm">
            <q-input
              :model-value="element.expire"
              class="q-my-md"
              type="number"
              :label="$gettext('Expire (minutes)')"
              :aria-label="$gettext('Expire (minutes)')"
              @update:model-value="updateElement('expire', $event)"
            />
          </div>

          <div class="col-6 col-md col-sm">
            <q-checkbox
              :model-value="element.frozen"
              class="q-my-md"
              left-label
              :label="$gettext('Frozen?')"
              :aria-label="$gettext('Frozen?')"
              @update:model-value="updateElement('frozen', $event)"
            />
          </div>
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import MigasLink from 'components/MigasLink'
import { useSmartRequest } from 'composables/smartRequest'

defineOptions({ name: 'DeploymentPackages' })

const props = defineProps({
  element: { type: Object, required: true },
})

const emit = defineEmits(['update-element'])
const { $gettext } = useGettext()
const { smartRequest } = useSmartRequest()

const source = ref(null)

const sources = reactive([
  {
    id: 'I',
    name: $gettext('Internal'),
  },
  {
    id: 'E',
    name: $gettext('External'),
  },
])

watch(
  () => props.element.source,
  (newSource) => {
    source.value = sources.find((s) => s.id === newSource) || null
  },
  { immediate: true },
)

const updateElement = (key, value) => {
  emit('update-element', key, value)
}

const filterPackages = async (val) => {
  if (!props.element.project) return []

  const { data } = await smartRequest('/api/v1/token/packages/', {
    params: {
      search: val.toLowerCase(),
      project__id: props.element.project.id,
      store__isnull: false,
    },
  })
  return data.results
}

const filterPackageSets = async (val) => {
  if (!props.element.project) return []

  const { data } = await smartRequest('/api/v1/token/package-sets/', {
    params: {
      search: val.toLowerCase(),
      project__id: props.element.project.id,
    },
  })
  return data.results
}
</script>
