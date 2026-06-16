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
      :add-button="false"
      :header-link="false"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-col-gutter-lg items-center">
            <div class="col-12 col-sm-4">
              <q-checkbox
                ref="primaryInput"
                v-model="element.checked"
                left-label
                :label="$gettext('Checked?')"
                color="primary"
                class="text-weight-bold"
              />
            </div>

            <div class="col-12 col-sm-4">
              <DateView
                :value="element.created_at"
                icon="mdi-calendar-plus"
                :tooltip-text="$gettext('Date')"
              />
            </div>

            <div class="col-12 col-sm-4">
              <DateView
                v-if="element.synchronization"
                :value="element.synchronization.start_date"
                :icon="modelIcon('syncs')"
                :tooltip-text="$gettext('Synchronization')"
              />
            </div>
          </div>

          <div class="row q-px-md q-pb-md q-col-gutter-lg">
            <div class="col-12 col-sm-6">
              <div class="data-panel solid-panel q-pa-sm">
                <div class="tech-data-label q-mb-xs">
                  {{ $gettext('Computer') }}
                </div>
                <MigasLink
                  v-if="element.computer"
                  model="computers"
                  :pk="element.computer.id"
                  :value="element.computer.__str__ || ''"
                  :icon="elementIcon(element.computer.status)"
                  :tooltip="element.computer.summary"
                />
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="data-panel solid-panel q-pa-sm">
                <div class="tech-data-label q-mb-xs">
                  {{ $gettext('Project') }}
                </div>
                <MigasLink
                  v-if="element.project"
                  model="projects"
                  :pk="element.project.id"
                  :value="element.project.name"
                  :icon="modelIcon('projects')"
                />
              </div>
            </div>
          </div>

          <div class="row q-pa-md">
            <div class="col-12">
              <q-input
                v-model="element.description"
                :label="$gettext('Description')"
                type="textarea"
                filled
                readonly
                autogrow
                class="description-input"
              >
                <template #append>
                  <CopyToClipboard :content="element.description" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import CopyToClipboard from 'components/ui/CopyToClipboard'
import DateView from 'components/ui/DateView'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'
import useAutoFocus from 'composables/autoFocus'

const { $gettext } = useGettext()
const { elementIcon } = useElement()
const { inputRef: primaryInput } = useAutoFocus()

const title = ref($gettext('Error'))
const windowTitle = ref(title.value)
useMeta(() => ({ title: windowTitle.value }))

const routes = {
  list: 'errors-list',
  detail: 'error-detail',
}
const model = 'errors'

const element = reactive({ id: 0 })

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    to: 'home',
    icon: appIcon('home'),
  },
  {
    text: $gettext('Data'),
    icon: appIcon('data'),
  },
  {
    text: $gettext('Errors'),
    icon: modelIcon(model),
    to: 'errors-dashboard',
  },
])

const isValid = true

const elementData = () => {
  return {
    checked: element.checked,
  }
}

const setTitle = (value) => {
  windowTitle.value = value
}
</script>

<style scoped>
.description-input :deep(.q-field__native) {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
