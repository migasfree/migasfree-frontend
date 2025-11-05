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
          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-checkbox
                v-model="element.checked"
                left-label
                autofocus
                :label="$gettext('Checked?')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <MigasLink
                v-if="element.fault_definition"
                model="fault-definitions"
                :pk="element.fault_definition.id"
                :value="element.fault_definition.name"
                :tooltip="$gettext('Fault Definition')"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <MigasLink
                v-if="element.computer"
                model="computers"
                :pk="element.computer.id"
                :value="element.computer.__str__ || ''"
                :icon="elementIcon(element.computer.status)"
                :tooltip="element.computer.summary"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <MigasLink
                v-if="element.project"
                model="projects"
                :pk="element.project.id"
                :value="element.project.name"
                :tooltip="$gettext('Project')"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col">
              <DateView
                :value="element.created_at"
                icon="mdi-calendar-plus"
                :tooltip-text="$gettext('Date')"
              />
            </div>
          </div>

          <div class="row q-pa-md">
            <div class="col">
              <q-input
                v-model="element.result"
                :label="$gettext('Result')"
                type="textarea"
                class="pre overflow"
                readonly
                outlined
              />
              <CopyToClipboard size="md" :content="element.result" />
            </div>
          </div>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import CopyToClipboard from 'components/ui/CopyToClipboard'
import DateView from 'components/ui/DateView'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'

export default {
  components: {
    CopyToClipboard,
    DateView,
    ItemDetail,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon } = useElement()

    const title = ref($gettext('Fault'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'faults-list',
      detail: 'fault-detail',
    }
    const model = 'faults'

    let element = reactive({ id: 0 })

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Data'),
        icon: appIcon('data'),
      },
      {
        text: $gettext('Faults'),
        icon: modelIcon(model),
        to: 'faults-dashboard',
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

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      isValid,
      elementIcon,
      elementData,
      setTitle,
    }
  },
}
</script>
