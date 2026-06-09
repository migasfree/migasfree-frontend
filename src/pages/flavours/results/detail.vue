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
      @load-related="loadRelated"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <!-- General Section -->
        <q-card-section>
          <div
            class="text-h5 q-mt-sm q-mb-md text-weight-medium row items-center"
          >
            <q-icon
              name="mdi-information-outline"
              size="sm"
              class="q-mr-sm color-primary"
            />
            {{ $gettext('Flavour Details') }}
          </div>

          <div class="row q-col-gutter-lg q-pt-sm">
            <div class="col-12 col-md-6">
              <q-select
                v-model="element.config"
                :label="$gettext('Configuration')"
                :options="configs"
                option-value="id"
                option-label="template_id"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="element.name"
                :label="$gettext('Flavour Name')"
                placeholder="e.g. Desktop, Server, Minimal"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-col-gutter-lg q-pt-md">
            <div class="col-12 col-md-8">
              <q-input
                v-model="element.hostname"
                :label="$gettext('System Hostname')"
                placeholder="e.g. workgroup-pc"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              >
                <template #prepend>
                  <q-icon name="mdi-dns-outline" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-4 flex items-center">
              <q-checkbox
                v-model="element.enabled"
                left-label
                :label="$gettext('Enabled?')"
              />
            </div>
          </div>

          <div class="row q-col-gutter-lg q-pt-md">
            <div class="col-12">
              <q-input
                v-model="element.description"
                type="textarea"
                rows="3"
                :label="$gettext('Description')"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Identity & Timezone Section -->
        <q-card-section>
          <div
            class="text-h5 q-mt-sm q-mb-md text-weight-medium row items-center"
          >
            <q-icon
              name="mdi-account-key-outline"
              size="sm"
              class="q-mr-sm color-primary"
            />
            {{ $gettext('Credentials & Localization') }}
          </div>

          <div class="row q-col-gutter-lg q-pt-sm">
            <div class="col-12 col-md-6">
              <q-input
                v-model="element.user"
                :label="$gettext('Default User')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="element.password"
                type="password"
                :label="$gettext('Default Password')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-col-gutter-lg q-pt-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="element.timezone"
                :label="$gettext('System Timezone')"
                placeholder="Europe/Madrid"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="element.tags"
                multiple
                use-chips
                :label="$gettext('Associated Tags')"
                :options="tagsOptions"
                option-value="id"
                :option-label="
                  (opt) =>
                    typeof opt === 'string'
                      ? opt
                      : opt
                        ? attributeValue(opt)
                        : ''
                "
              />
            </div>
          </div>
        </q-card-section>

        <!-- Keyboard & Console Section -->
        <q-card-section>
          <div
            class="text-h5 q-mt-sm q-mb-md text-weight-medium row items-center"
          >
            <q-icon
              name="mdi-keyboard-outline"
              size="sm"
              class="q-mr-sm color-primary"
            />
            {{ $gettext('Keyboard & System Console') }}
          </div>

          <div class="row q-col-gutter-lg q-pt-sm">
            <div class="col-12 col-md-3">
              <q-input
                v-model="element.keymap"
                :label="$gettext('Keymap')"
                placeholder="e.g. us, es"
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="element.keyboard_model"
                :label="$gettext('Keyboard Model')"
                placeholder="e.g. pc105"
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="element.charmap"
                :label="$gettext('Charmap')"
                placeholder="e.g. UTF-8"
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="element.codeset"
                :label="$gettext('Codeset')"
                placeholder="e.g. guess, Lat15"
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

import { appIcon, modelIcon, useElement } from 'composables/element'

const uiStore = useUiStore()
const { $gettext } = useGettext()
const { attributeValue } = useElement()

const title = ref($gettext('MGI Flavour'))
const windowTitle = ref(title.value)
useMeta(() => ({ title: windowTitle.value }))

const routes = {
  list: 'flavours-list',
  add: 'flavour-add',
  detail: 'flavour-detail',
}
const model = 'mgi/flavour'

const element = reactive({
  id: 0,
  config: undefined,
  name: '',
  description: '',
  enabled: true,
  user: '',
  password: '',
  keymap: 'us',
  keyboard_model: 'pc105',
  charmap: 'UTF-8',
  codeset: 'guess',
  timezone: 'Europe/Madrid',
  hostname: '',
  tags: [],
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
    text: $gettext('Flavours'),
    icon: modelIcon(model),
    to: routes.list,
  },
])

const configs = ref([])
const tagsOptions = ref([])

const isValid = computed(() => {
  return (
    element.config !== undefined &&
    element.name !== undefined &&
    element.name.trim() !== '' &&
    element.hostname !== undefined &&
    element.hostname.trim() !== '' &&
    element.user !== undefined &&
    element.user.trim() !== '' &&
    element.password !== undefined &&
    element.password.trim() !== ''
  )
})

const loadRelated = async () => {
  try {
    const [configsResponse, tagsResponse] = await Promise.all([
      api.get('/api/v1/token/mgi/config/'),
      api.get('/api/v1/token/tags/'),
    ])

    configs.value = configsResponse.data.results
    tagsOptions.value = tagsResponse.data.results

    if (element.id) {
      // Resolve MGI configuration
      if (element.config) {
        const resolvedConf = configs.value.find(
          (c) => c.id === element.config || c.id === element.config?.id,
        )
        if (resolvedConf) {
          element.config = resolvedConf
        }
      }

      // Resolve comma-separated tags string back to array of tag objects
      if (typeof element.tags === 'string' && tagsOptions.value.length > 0) {
        const names = element.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
        element.tags = tagsOptions.value.filter(
          (t) =>
            names.includes(t.name) ||
            names.includes(t.__str__) ||
            names.includes(attributeValue(t)),
        )
      }
    }
  } catch (error) {
    uiStore.notifyError(error)
  }
}

const elementData = () => {
  return {
    config:
      typeof element.config === 'object' ? element.config.id : element.config,
    name: element.name,
    description: element.description,
    enabled: element.enabled,
    user: element.user,
    password: element.password,
    keymap: element.keymap,
    keyboard_model: element.keyboard_model,
    charmap: element.charmap,
    codeset: element.codeset,
    timezone: element.timezone,
    hostname: element.hostname,
    tags: element.tags.map((t) => (typeof t === 'object' ? t.id : t)),
  }
}

const resetElement = () => {
  Object.assign(element, {
    id: 0,
    config: undefined,
    name: '',
    description: '',
    enabled: true,
    user: '',
    password: '',
    keymap: 'us',
    keyboard_model: 'pc105',
    charmap: 'UTF-8',
    codeset: 'guess',
    timezone: 'Europe/Madrid',
    hostname: '',
    tags: [],
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
