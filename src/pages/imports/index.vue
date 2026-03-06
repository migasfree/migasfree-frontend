<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false" />

    <q-stepper
      v-model="step"
      vertical
      color="primary"
      animated
      class="import-stepper"
    >
      <!-- Step 1: Distribution -->
      <q-step
        :name="1"
        :title="$gettext('Distribution')"
        :caption="$gettext('Select the base distribution')"
        icon="mdi-linux"
        :done="step > 1"
      >
        <StepDistribution
          v-model:template-source="templateSource"
          v-model:selected-distro="selectedDistro"
          :template="template"
          :template-error="templateError"
          :custom-template-file="customTemplateFile"
          @custom-template-selected="onCustomTemplateSelected"
          @clear-custom-template="clearCustomTemplate"
          @continue="goToStep2"
        />
      </q-step>

      <!-- Step 2: Project -->
      <q-step
        :name="2"
        :title="$gettext('Project')"
        :caption="$gettext('Select or create a project')"
        icon="mdi-sitemap"
        :done="step > 2"
      >
        <StepProject
          v-model:new-project-name="newProjectName"
          v-model:editing-project="editingProject"
          :selected-existing-project="selectedExistingProject"
          :existing-projects="existingProjects"
          :editable-project="editableProject"
          @select-existing="onSelectExistingProject"
          @update:editable-project="Object.assign(editableProject, $event)"
        />

        <q-stepper-navigation>
          <q-btn
            color="primary"
            :label="$gettext('Continue')"
            :disable="!projectName"
            @click="prepareStep3"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Back')"
            class="q-ml-sm"
            @click="step = 1"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 3: Review & Edit -->
      <q-step
        :name="3"
        :title="$gettext('Review & Edit')"
        :caption="$gettext('Review, edit and select items to import')"
        icon="mdi-pencil-box-outline"
        :done="step > 3"
      >
        <StepReviewEdit
          v-model:editing-deployments="editingDeployments"
          v-model:editing-apps="editingApps"
          :editable-project="editableProject"
          :project-name="projectName"
          :editable-deployments="editableDeployments"
          :selected-deployment-names="selectedDeploymentNames"
          :editable-apps="editableApps"
          :selected-app-names="selectedAppNames"
          @update:selected-deployment-names="selectedDeploymentNames = $event"
          @update:editable-deployments="editableDeployments = $event"
          @add-deployment="addDeployment"
          @remove-deployment="removeDeployment"
          @update:selected-app-names="selectedAppNames = $event"
          @update:editable-apps="editableApps = $event"
          @remove-app="removeApp"
        />

        <q-stepper-navigation>
          <q-btn
            color="primary"
            :label="
              hasInternalDeployments
                ? $gettext('Continue')
                : $gettext('Start Import')
            "
            :disable="selectedDeploymentNames.length === 0"
            @click="hasInternalDeployments ? (step = 4) : startImport()"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Back')"
            class="q-ml-sm"
            @click="step = 2"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 4: Packages (conditional) -->
      <q-step
        v-if="hasInternalDeployments"
        :name="4"
        :title="$gettext('Packages')"
        :caption="$gettext('Upload packages for internal deployments')"
        icon="mdi-package-variant"
        :done="step > 4"
      >
        <StepPackages
          :internal-deployments="selectedInternalDeployments"
          :package-files="packageFiles"
          @update:package-files="onUpdatePackageFiles"
        />

        <q-stepper-navigation>
          <q-btn
            color="primary"
            :label="$gettext('Start Import')"
            @click="startImport"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Back')"
            class="q-ml-sm"
            @click="step = 3"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 5: Execution -->
      <q-step
        :name="5"
        :title="$gettext('Execution')"
        :caption="$gettext('Import in progress')"
        :icon="isRunning ? appIcon('loading') : appIcon('play')"
        :done="step > 5"
        :header-nav="false"
      >
        <StepExecution
          :progress-percent="progressPercent"
          :is-running="isRunning"
          :current-step="currentStep"
          :logs="logs"
        />

        <q-stepper-navigation v-if="!isRunning && logs.length > 0">
          <q-btn
            color="primary"
            :label="$gettext('View Results')"
            @click="step = 6"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 6: Results -->
      <q-step
        :name="6"
        :title="$gettext('Results')"
        :caption="$gettext('Import completed')"
        icon="mdi-check-circle"
        :header-nav="false"
      >
        <StepResults
          :import-error="importError"
          :created-resources="createdResources"
        />

        <q-stepper-navigation>
          <q-btn
            color="primary"
            :label="$gettext('New Import')"
            icon="mdi-restart"
            @click="resetWizard"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Download Recipe')"
            icon="mdi-download"
            class="q-ml-sm"
            @click="downloadRecipe"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Go to Deployments')"
            class="q-ml-sm"
            @click="$router.push({ name: 'deployments-dashboard' })"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'

import StepDistribution from 'components/imports/StepDistribution.vue'
import StepProject from 'components/imports/StepProject.vue'
import StepReviewEdit from 'components/imports/StepReviewEdit.vue'
import StepPackages from 'components/imports/StepPackages.vue'
import StepExecution from 'components/imports/StepExecution.vue'
import StepResults from 'components/imports/StepResults.vue'

import { appIcon } from 'composables/element'
import { useImporter, validateTemplate } from 'composables/importer'

const { $gettext } = useGettext()

const title = $gettext('Import Configuration')
const titleIcon = appIcon('import')
useMeta({ title })

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Release'),
    icon: appIcon('release'),
  },
  {
    text: title,
    icon: titleIcon,
  },
])

// State
const step = ref(1)
const templateSource = ref('bundled')
const templateError = ref(null)
const customTemplateFile = ref(null)
const selectedDistro = ref(null)
const selectedExistingProject = ref(null)
const newProjectName = ref('')
const selectedDeploymentNames = ref([])
const editableDeployments = ref([])
const editingDeployments = ref(false)
const editableProject = reactive({ platform: '', pms: '', architecture: '' })
const editingProject = ref(false)
const editableApps = ref([])
const selectedAppNames = ref([])
const editingApps = ref(false)
const packageFiles = reactive({})
const existingProjects = ref([])

const {
  template,
  isRunning,
  currentStep,
  progressPercent,
  logs,
  error: importError,
  createdResources,
  loadTemplate,
  runImport,
  reset: resetImporter,
} = useImporter()

// Computed
const projectName = computed(() => {
  if (selectedExistingProject.value) return selectedExistingProject.value
  return newProjectName.value?.trim() || ''
})

const selectedDistroData = computed(() =>
  template.value?.distros.find((d) => d.name === selectedDistro.value),
)

const hasInternalDeployments = computed(() =>
  editableDeployments.value.some(
    (d) => d.source === 'I' && selectedDeploymentNames.value.includes(d.name),
  ),
)

const selectedInternalDeployments = computed(() =>
  editableDeployments.value.filter(
    (d) => d.source === 'I' && selectedDeploymentNames.value.includes(d.name),
  ),
)

// Methods
const onCustomTemplateSelected = async (file) => {
  if (!file) return
  templateError.value = null

  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const { valid, errors } = validateTemplate(parsed)

    if (!valid) {
      templateError.value = `${$gettext('Invalid template')}:\n${errors.join('\n')}`
      template.value = null
      return
    }

    template.value = parsed
    selectedDistro.value = null
  } catch (err) {
    templateError.value = `${$gettext('Invalid template file')}: ${err.message}`
    template.value = null
  }
}

const clearCustomTemplate = () => {
  customTemplateFile.value = null
  template.value = null
  selectedDistro.value = null
  templateError.value = null
}

const onSelectExistingProject = (val) => {
  selectedExistingProject.value = val
  if (val) newProjectName.value = ''
}

const goToStep2 = async () => {
  const distro = selectedDistroData.value
  if (distro) {
    editableProject.platform = distro.platform
    editableProject.pms = distro.pms
    editableProject.architecture = distro.architecture
    newProjectName.value = distro.name
  }
  editingProject.value = false

  try {
    const response = await api.get('/api/v1/token/projects/')
    existingProjects.value = response.data.results || []
  } catch {
    existingProjects.value = []
  }
  step.value = 2
}

const prepareStep3 = () => {
  const raw =
    (template.value.deployments[selectedDistro.value] || []).filter(
      (d) => !d.ignored,
    ) || []

  editableDeployments.value = raw.map((d) => ({
    ...d,
    packages_to_install_text: Array.isArray(d.packages_to_install)
      ? d.packages_to_install.join('\n')
      : d.packages_to_install || '',
  }))

  selectedDeploymentNames.value = editableDeployments.value.map((d) => d.name)
  editingDeployments.value = false

  const rawApps = template.value.applications || []
  editableApps.value = rawApps.map((a) => ({
    ...a,
    packages_to_install_text: Array.isArray(a.packages_to_install)
      ? a.packages_to_install.join('\n')
      : a.packages_to_install || '',
  }))
  selectedAppNames.value = editableApps.value.map((a) => a.name)
  editingApps.value = false

  step.value = 3
}

const addDeployment = () => {
  const newDep = {
    name: `New Deployment ${editableDeployments.value.length + 1}`,
    source: 'E',
    enabled: true,
    base_url: '',
    suite: '',
    components: '',
    options: '',
    frozen: false,
    included_attributes: [],
    store: '',
    packages_to_install_text: '',
  }
  editableDeployments.value.push(newDep)
  selectedDeploymentNames.value.push(newDep.name)
}

const removeDeployment = (index) => {
  const name = editableDeployments.value[index].name
  editableDeployments.value.splice(index, 1)
  selectedDeploymentNames.value = selectedDeploymentNames.value.filter(
    (n) => n !== name,
  )
}

const removeApp = (index) => {
  const name = editableApps.value[index].name
  editableApps.value.splice(index, 1)
  selectedAppNames.value = selectedAppNames.value.filter((n) => n !== name)
}

const onUpdatePackageFiles = (depName, files) => {
  packageFiles[depName] = files
}

const syncEditableToTemplate = () => {
  const distro = template.value.distros.find(
    (d) => d.name === selectedDistro.value,
  )
  if (distro) {
    distro.platform = editableProject.platform
    distro.pms = editableProject.pms
    distro.architecture = editableProject.architecture
  }

  editableDeployments.value.forEach((dep) => {
    if (dep.packages_to_install_text !== undefined) {
      dep.packages_to_install = dep.packages_to_install_text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  })
  template.value.deployments[selectedDistro.value] = editableDeployments.value

  editableApps.value.forEach((app) => {
    if (app.packages_to_install_text !== undefined) {
      app.packages_to_install = app.packages_to_install_text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  })
  template.value.applications = editableApps.value.filter((a) =>
    selectedAppNames.value.includes(a.name),
  )
}

const startImport = () => {
  syncEditableToTemplate()
  step.value = 5
  runImport(
    selectedDistro.value,
    projectName.value,
    selectedDeploymentNames.value,
    packageFiles,
  )
}

const downloadRecipe = () => {
  syncEditableToTemplate()

  const distro = selectedDistroData.value
  const cleanForExport = (item) => {
    const copy = { ...item }
    delete copy.packages_to_install_text
    return copy
  }

  const recipe = {
    distros: distro ? [distro] : [],
    deployments: {
      [selectedDistro.value]: editableDeployments.value
        .filter((d) => selectedDeploymentNames.value.includes(d.name))
        .map(cleanForExport),
    },
    applications: editableApps.value
      .filter((a) => selectedAppNames.value.includes(a.name))
      .map(cleanForExport),
  }

  const blob = new Blob([JSON.stringify(recipe, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `migasfree-recipe-${selectedDistro.value}-${projectName.value || 'custom'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const resetWizard = () => {
  step.value = 1
  templateSource.value = 'bundled'
  customTemplateFile.value = null
  selectedDistro.value = null
  selectedExistingProject.value = null
  newProjectName.value = ''
  selectedDeploymentNames.value = []
  editableDeployments.value = []
  editingDeployments.value = false
  Object.assign(editableProject, { platform: '', pms: '', architecture: '' })
  editingProject.value = false
  editableApps.value = []
  selectedAppNames.value = []
  editingApps.value = false
  Object.keys(packageFiles).forEach((key) => delete packageFiles[key])
  resetImporter()
}

// Lifecycle
onMounted(async () => {
  try {
    await loadTemplate()
  } catch {
    templateError.value = $gettext(
      'Could not load the import template. Please check that the file exists.',
    )
  }
})
</script>

<style scoped>
.import-stepper {
  background: transparent;
}
</style>
