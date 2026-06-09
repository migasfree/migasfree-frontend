<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      ref="tableResultsRef"
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <template #header-actions>
        <q-btn
          class="q-ma-xs"
          color="secondary"
          :icon="appIcon('import')"
          @click="openTemplateModalForCreate"
        >
          <q-tooltip>{{ $gettext('Add from Template') }}</q-tooltip>
        </q-btn>
      </template>

      <template #actions="{ props }">
        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('stores')"
          color="secondary"
          @click="
            $router.push({
              name: 'store-add',
              query: { project: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Store') }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('deployments')"
          color="secondary"
          @click="
            $router.push({
              name: 'deployment-add',
              query: { project: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Deployment') }}</q-tooltip></q-btn
        >

        <q-btn
          class="q-ma-xs"
          round
          size="sm"
          :icon="modelIcon('devices/drivers')"
          color="secondary"
          @click="
            $router.push({
              name: 'driver-add',
              query: { project: props.row.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add Driver') }}</q-tooltip></q-btn
        >
      </template>

      <template #cell-platform_name="{ props }">
        <MigasLink
          model="platforms"
          :pk="props.row.platform.id"
          :value="props.row.platform.name"
        />
      </template>

      <template #cell-auto_register_computers="{ props }">
        <BooleanView :value="props.row.auto_register_computers" />
      </template>
    </TableResults>

    <!-- Add from Template Dialog -->
    <q-dialog v-model="showTemplateModal" persistent>
      <q-card class="template-modal-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold row items-center">
            <q-icon
              :name="appIcon('import')"
              size="sm"
              class="q-mr-sm text-primary"
            />
            <span>
              {{ $gettext('Create Project from Template') }}
            </span>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <p class="text-body2 text-grey-8">
            {{ $gettext('Select a catalog origin to get started.') }}
          </p>

          <q-form @submit="submitTemplateImport">
            <!-- Origin selection (Always visible first) -->
            <q-select
              v-model="templateModalData.origin"
              :label="$gettext('Catalog Origin')"
              :options="originOptions"
              filled
              emit-value
              map-options
              class="q-mb-md"
              :loading="loadingTemplates"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />

            <!-- Hidden until Catalog Origin is selected -->
            <template v-if="templateModalData.origin">
              <!-- Template selection -->
              <q-select
                v-model="templateModalData.templateId"
                :label="$gettext('Select Template')"
                :options="filteredTemplates"
                option-value="id"
                option-label="id"
                filled
                emit-value
                map-options
                class="q-mb-md"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="appIcon('import')" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{
                        scope.opt.id
                      }}</q-item-label>
                      <q-item-label v-if="scope.opt.base_os" caption>
                        {{ $gettext('Base OS:') }} {{ scope.opt.base_os }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ $gettext('No templates available for this origin') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- Project Name (Only visible when template is selected) -->
              <q-input
                v-if="templateModalData.templateId"
                v-model="templateModalData.projectName"
                :label="$gettext('Project Name')"
                filled
                class="q-mb-md"
                lazy-rules
                :rules="[
                  (val) => !!val || $gettext('* Required'),
                  (val) => val.trim().length > 0 || $gettext('* Required'),
                ]"
              />
            </template>

            <q-card-actions
              align="right"
              class="q-px-none q-pt-md items-center"
            >
              <q-btn
                type="submit"
                push
                round
                color="primary"
                size="lg"
                :icon="appIcon('save')"
                :loading="submitting"
                :disabled="!isFormValid || submitting"
              >
                <q-tooltip>{{ $gettext('Save') }}</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'
import MigasLink from 'components/MigasLink'
import BooleanView from 'components/ui/BooleanView'

import { appIcon } from 'composables/element'
import { useFilterHelper } from 'composables/filterHelper'

const { $gettext } = useGettext()
const uiStore = useUiStore()

const tableResultsRef = ref(null)
const showTemplateModal = ref(false)
const loadingTemplates = ref(false)
const submitting = ref(false)
const templates = ref([])
const templateModalData = reactive({
  projectName: '',
  templateId: null,
  origin: null,
})

const originOptions = computed(() => {
  const hasLocal = templates.value.some((t) => t.origin === 'local')
  const hasRemote = templates.value.some(
    (t) => t.origin === 'remote' || !t.origin,
  )

  return [
    {
      value: 'local',
      label: $gettext('Local Catalog'),
      disable: !hasLocal && templates.value.length > 0,
    },
    {
      value: 'remote',
      label: $gettext('Remote Catalog'),
      disable: !hasRemote && templates.value.length > 0,
    },
  ]
})

const filteredTemplates = computed(() => {
  if (!templateModalData.origin) return []
  return templates.value.filter(
    (t) =>
      t.origin === templateModalData.origin ||
      (!t.origin && templateModalData.origin === 'remote'),
  )
})

const isFormValid = computed(() => {
  if (!templateModalData.origin) return false
  if (!templateModalData.templateId) return false
  return (
    !!templateModalData.projectName &&
    templateModalData.projectName.trim().length > 0
  )
})

watch(
  () => templateModalData.origin,
  () => {
    templateModalData.templateId = null
  },
)

const openTemplateModalForCreate = () => {
  templateModalData.projectName = ''
  templateModalData.templateId = null
  templateModalData.origin = null
  showTemplateModal.value = true
  loadTemplates()
}

const loadTemplates = async () => {
  if (templates.value.length > 0) return
  loadingTemplates.value = true
  try {
    const { data } = await api.get('/api/v1/token/projects/templates/')
    templates.value = data.templates || []
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    loadingTemplates.value = false
  }
}

const submitTemplateImport = async () => {
  submitting.value = true
  try {
    const payload = {
      template_id: templateModalData.templateId,
      origin: templateModalData.origin,
      project_name: templateModalData.projectName,
    }

    await api.post('/api/v1/token/projects/templates/import/', payload)

    uiStore.notifySuccess(
      $gettext('Project created from template successfully!'),
    )
    showTemplateModal.value = false
    tableResultsRef.value?.loadItems()
  } catch (error) {
    uiStore.notifyError(error)
  } finally {
    submitting.value = false
  }
}

const routes = {
  add: 'project-add',
  detail: 'project-detail',
}
const model = 'projects'

const { modelIcon, title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Projects'),
  $gettext('Projects List'),
  [
    {
      text: $gettext('Configuration'),
      icon: appIcon('configuration'),
    },
  ],
  [
    {
      label: $gettext('Name'),
      field: 'name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      field: 'platform.id',
      hidden: true,
    },
    {
      label: $gettext('Platform'),
      field: 'platform.name',
      html: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Package Management System'),
      field: 'pms',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Auto register computers'),
      field: 'auto_register_computers',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
        filterDropdownItems: [
          { value: true, text: $gettext('Yes') },
          { value: false, text: $gettext('No') },
        ],
      },
    },
  ],
)

const { setFilterItems } = useFilterHelper(columns)

const loadFilters = async () => {
  try {
    const [platformsResponse, pmsResponse] = await Promise.all([
      api.get('/api/v1/token/platforms/'),
      api.get('/api/v1/public/pms/'),
    ])

    setFilterItems(
      'platform.name',
      platformsResponse.data.results.map(({ id, name }) => ({
        value: id,
        text: name,
      })),
    )

    setFilterItems(
      'pms',
      Object.keys(pmsResponse.data).map((key) => ({
        value: key,
        text: key,
      })),
    )
  } catch (error) {
    uiStore.notifyError(error)
  }
}

onMounted(async () => {
  await loadFilters()
})
</script>

<style scoped>
.template-modal-card {
  min-width: 450px;
  border-radius: 16px;
}
</style>
