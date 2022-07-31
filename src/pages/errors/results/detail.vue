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
                :label="$gettext('Checked?')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-icon
                name="mdi-calendar-plus"
                size="sm"
                class="vertical-middle"
              />
              <span class="vertical-middle">{{
                showDate(element.created_at)
              }}</span>
              <q-tooltip self="bottom middle"
                >{{ $gettext('Date') }} ({{
                  diffForHumans(element.created_at)
                }})</q-tooltip
              >
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
              <q-list bordered>
                <q-toolbar>
                  <q-toolbar-title
                    ><div v-translate class="text-body1">
                      Description
                    </div></q-toolbar-title
                  >
                  <q-btn
                    flat
                    icon="mdi-content-copy"
                    color="primary"
                    @click="copyInfo"
                  />
                </q-toolbar>

                <q-item :inset-level="0.5">
                  <pre class="overflow">{{ element.description }}</pre>
                </q-item>
              </q-list>
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
import { copyToClipboard } from 'quasar'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'

import { useElement, modelIcon } from 'composables/element'
import useDate from 'composables/date'

export default {
  components: {
    ItemDetail,
    MigasLink,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()
    const { showDate, diffForHumans } = useDate()
    const { elementIcon } = useElement()

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
        icon: 'mdi-home',
      },
      {
        text: $gettext('Data'),
        icon: 'mdi-database-search',
      },
      {
        text: $gettext('Errors'),
        to: 'errors-dashboard',
        icon: modelIcon(model),
      },
    ])

    const isValid = true

    const elementData = () => {
      return {
        checked: element.checked,
      }
    }

    const copyInfo = () => {
      copyToClipboard(element.description).then(() => {
        uiStore.notifySuccess($gettext('Text copied to clipboard'))
      })
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
      copyInfo,
      showDate,
      diffForHumans,
      elementIcon,
      elementData,
      setTitle,
    }
  },
}
</script>
