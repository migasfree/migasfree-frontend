<template>
  <q-page padding>
    <ItemDetail
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
              <DateView
                :value="element.created_at"
                icon="mdi-calendar-plus"
                :tooltip-text="$gettext('Date')"
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

          <div class="row q-pa-md">
            <div class="col">
              <q-input
                v-model="element.description"
                :label="$gettext('Description')"
                type="textarea"
                class="pre overflow"
                readonly
                outlined
              />
              <q-btn
                flat
                icon="mdi-content-copy"
                color="primary"
                @click="contentToClipboard(element.description)"
                ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
              >
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

import ItemDetail from 'components/ui/ItemDetail'
import DateView from 'components/ui/DateView'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'
import useCopyPaste from 'composables/copyPaste'

export default {
  components: {
    ItemDetail,
    DateView,
    MigasLink,
  },
  setup() {
    const { $gettext } = useGettext()
    const { elementIcon } = useElement()
    const { contentToClipboard } = useCopyPaste()

    const title = ref($gettext('Error'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'errors-list',
      detail: 'error-detail',
    }
    const model = 'errors'

    let element = reactive({ id: 0 })

    const breadcrumbs = reactive([
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

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      isValid,
      contentToClipboard,
      elementIcon,
      elementData,
      setTitle,
    }
  },
}
</script>
