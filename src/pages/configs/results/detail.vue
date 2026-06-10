<template>
  <q-page padding>
    <ItemDetail
      :key="$route.fullPath"
      :breadcrumbs="breadcrumbs"
      :original-title="title"
      :model="model"
      :routes="routes"
      :element="element"
      :element-data="elementData"
      :is-valid="isValid"
      :header-link="false"
      @load-related="loadRelated"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #append>
        <div
          v-if="element.id"
          class="header-metadata row items-center no-wrap q-gutter-x-xs"
        >
          <MigasLink
            v-if="element.project"
            model="mgi/config"
            :pk="element.id"
            :value="
              typeof element.project === 'object'
                ? `${element.project.name} (${element.template_id})`
                : `${element.project} (${element.template_id})`
            "
            :hide-icon="true"
          />
        </div>
      </template>

      <template #fields>
        <!-- General Section -->
        <q-card-section>
          <div v-if="!element.id" class="row q-col-gutter-lg q-pt-sm">
            <div class="col-12 col-md-6">
              <q-select
                v-model="element.project"
                :label="$gettext('Project')"
                :options="projects"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ $gettext('No projects available') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="element.template_id"
                :label="$gettext('Template ID')"
                placeholder="e.g. debian-12-desktop"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-col-gutter-lg q-pt-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="element.build_type"
                :label="$gettext('Build Type')"
                :options="buildTypes"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="element.image_format"
                :label="$gettext('Image Format')"
                :options="imageFormats"
                option-value="id"
                option-label="name"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-col-gutter-lg q-pt-md">
            <div class="col-12">
              <q-input
                v-model="element.base_os"
                :label="$gettext('Base OS')"
                placeholder="e.g. debian, ubuntu, windows"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Blueprint Section (Partitioning & Provisioning) -->
        <q-card-section>
          <div
            class="text-h5 q-mt-sm q-mb-md text-weight-medium row items-center"
          >
            <q-icon
              name="mdi-application-cog-outline"
              size="sm"
              class="q-mr-sm color-primary"
            />
            {{ $gettext('System Blueprint') }}
          </div>

          <div class="row q-col-gutter-lg q-pt-sm">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs opacity-80">
                {{ $gettext('Partition Schema (YAML)') }}
              </div>
              <CodeEditor v-model="element.partition" language="yaml" />
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs opacity-80">
                {{ $gettext('Provisioning Script') }}
              </div>
              <CodeEditor v-model="element.provision_script" language="bash" />
            </div>
          </div>
        </q-card-section>

        <!-- Conditional Engine Options -->
        <q-card-section v-if="selectedBuildType === 'docker'">
          <div
            class="text-h5 q-mt-sm q-mb-md text-weight-medium row items-center text-blue-8"
          >
            <q-icon name="mdi-docker" size="sm" class="q-mr-sm" />
            {{ $gettext('Docker Build Configuration') }}
          </div>
          <div class="row q-col-gutter-lg q-pt-sm">
            <div class="col-12">
              <div class="text-subtitle2 q-mb-xs opacity-80">
                {{ $gettext('Dockerfile') }}
              </div>
              <CodeEditor v-model="element.dockerfile" language="dockerfile" />
            </div>
          </div>
        </q-card-section>

        <q-card-section v-else-if="selectedBuildType === 'qemu_win'">
          <div
            class="text-h5 q-mt-sm q-mb-md text-weight-medium row items-center text-purple-8"
          >
            <q-icon name="mdi-microsoft-windows" size="sm" class="q-mr-sm" />
            {{ $gettext('Windows QEMU Configuration') }}
          </div>
          <div class="row q-col-gutter-lg q-pt-sm">
            <div class="col-12">
              <q-input
                v-model.number="element.config.disk_size_gb"
                type="number"
                :label="$gettext('Disk Size (GB)')"
                lazy-rules
                :rules="[
                  (val) => !!val || $gettext('* Required'),
                  (val) =>
                    val >= 20 || $gettext('Disk size must be at least 20 GB'),
                ]"
              />
            </div>
          </div>
          <div class="row q-col-gutter-lg q-pt-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs opacity-80">
                {{ $gettext('Autounattend Template (XML)') }}
              </div>
              <CodeEditor
                v-model="element.config.autounattend_template"
                language="xml"
              />
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs opacity-80">
                {{ $gettext('SetupComplete Script') }}
              </div>
              <CodeEditor
                v-model="element.config.setupcomplete_template"
                language="bash"
              />
            </div>
          </div>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'
import CodeEditor from 'components/ui/CodeEditor'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon } from 'composables/element'

const uiStore = useUiStore()
const { $gettext } = useGettext()

const title = ref($gettext('Configuration'))
const windowTitle = ref(title.value)
useMeta(() => ({ title: windowTitle.value }))

const routes = {
  list: 'configs-list',
  add: 'config-add',
  detail: 'config-detail',
}
const model = 'mgi/config'

const element = reactive({
  id: 0,
  project: undefined,
  template_id: '',
  build_type: undefined,
  base_os: '',
  partition: '',
  provision_script: '',
  image_format: undefined,
  config: {
    autounattend_template: '',
    setupcomplete_template: '',
    disk_size_gb: 40,
  },
  dockerfile: '',
})

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Golden Images'),
    icon: appIcon('golden-images'),
  },
  {
    text: $gettext('Configurations'),
    icon: modelIcon(model),
    to: routes.list,
  },
])

const projects = ref([])

const buildTypes = [
  { id: 'docker', name: $gettext('Docker (Linux)') },
  { id: 'qemu_win', name: $gettext('QEMU Unattended (Windows)') },
  { id: 'qemu_lnx', name: $gettext('QEMU Preseed/Kickstart (Linux)') },
]

const imageFormats = [
  { id: 'raw', name: $gettext('RAW (.raw)') },
  { id: 'wim', name: $gettext('WIM (.wim)') },
  { id: 'squashfs', name: $gettext('SquashFS (.squashfs)') },
]

const selectedBuildType = computed(() => {
  if (!element.build_type) return null
  return typeof element.build_type === 'object'
    ? element.build_type.id
    : element.build_type
})

const isValid = computed(() => {
  const bt = selectedBuildType.value
  const baseValid =
    element.project !== undefined &&
    element.template_id !== undefined &&
    element.template_id.trim() !== '' &&
    bt !== undefined

  if (!baseValid) return false

  if (bt === 'docker') {
    return element.dockerfile !== undefined && element.dockerfile.trim() !== ''
  } else if (bt === 'qemu_win') {
    return (
      element.config?.autounattend_template !== undefined &&
      element.config.autounattend_template.trim() !== '' &&
      element.config?.setupcomplete_template !== undefined &&
      element.config.setupcomplete_template.trim() !== '' &&
      element.config?.disk_size_gb >= 20
    )
  }

  return true
})

const loadRelated = async () => {
  try {
    const { data } = await api.get('/api/v1/token/projects/')
    projects.value = data.results

    if (element.id && element.project) {
      const resolved = projects.value.find(
        (p) => p.id === element.project || p.id === element.project?.id,
      )
      if (resolved) {
        element.project = resolved
      }
    }
  } catch (error) {
    uiStore.notifyError(error)
  }

  if (element.id) {
    if (typeof element.build_type === 'string') {
      element.build_type = buildTypes.find((b) => b.id === element.build_type)
    }
    if (typeof element.image_format === 'string') {
      element.image_format = imageFormats.find(
        (i) => i.id === element.image_format,
      )
    }
  } else {
    // Set defaults for new configuration
    element.build_type = buildTypes[0] // Docker as default
    element.image_format = imageFormats[0] // RAW as default
  }

  // Ensure inner config object structure is set
  if (!element.config || typeof element.config !== 'object') {
    element.config = {
      autounattend_template: '',
      setupcomplete_template: '',
      disk_size_gb: 40,
    }
  } else if (element.config.disk_size_gb === undefined) {
    element.config.disk_size_gb = 40
  }
}

const elementData = () => {
  const bt = selectedBuildType.value
  const data = {
    project:
      typeof element.project === 'object'
        ? element.project.id
        : element.project,
    template_id: element.template_id,
    build_type: bt,
    base_os: element.base_os,
    partition: element.partition,
    provision_script: element.provision_script,
    image_format:
      typeof element.image_format === 'object'
        ? element.image_format.id
        : element.image_format,
    config: element.config,
  }

  if (bt === 'docker') {
    data.dockerfile = element.dockerfile
  }

  return data
}

const resetElement = () => {
  Object.assign(element, {
    id: 0,
    project: undefined,
    template_id: '',
    build_type: buildTypes[0],
    base_os: '',
    partition: '',
    provision_script: '',
    image_format: imageFormats[0],
    config: {
      autounattend_template: '',
      setupcomplete_template: '',
      disk_size_gb: 40,
    },
    dockerfile: '',
  })
}

const setTitle = (value) => {
  windowTitle.value = value
}
</script>

<style scoped>
.color-primary {
  color: var(--brand-primary);
}
</style>
