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
      @update-related="updateRelated"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.name"
                outlined
                autofocus
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <q-input
                v-model="element.description"
                outlined
                type="textarea"
                :label="$gettext('Description')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('Delays') }}</div>

          <q-list v-if="delays.length > 0" class="q-pa-md" bordered separator>
            <q-item v-for="(delay, index) in delays" :key="index">
              <q-item-section side top>
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  :icon="appIcon('delete')"
                  @click="removeInline(index)"
                  ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
                >
              </q-item-section>

              <q-item-section>
                <div class="row q-pa-md q-gutter-md">
                  <div class="col-5 col-md col-sm">
                    <q-input
                      v-model="delay.delay"
                      outlined
                      type="number"
                      :label="$gettext('Delay')"
                      lazy-rules
                      :rules="[(val) => !!val || $gettext('* Required')]"
                    />
                  </div>

                  <div class="col-5 col-md col-sm">
                    <q-input
                      v-model="delay.duration"
                      outlined
                      type="number"
                      :label="$gettext('Duration')"
                      lazy-rules
                      :rules="[(val) => !!val || $gettext('* Required')]"
                    />
                  </div>
                </div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col-10 col-md col-sm">
                    <SelectAttributes
                      v-model="delay.attributes"
                      :label="$gettext('Attributes')"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-pa-md">
            <q-btn
              :icon="appIcon('add')"
              :label="$gettext('Add other Delay')"
              @click="addInline"
            />
          </div>
        </q-card-section>
      </template>
    </ItemDetail>
  </q-page>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import ItemDetail from 'components/ui/ItemDetail'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
    SelectAttributes,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()

    const title = ref($gettext('Schedule'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'schedules-list',
      add: 'schedule-add',
      detail: 'schedule-detail',
    }
    const model = 'schedules'

    let element = reactive({ id: 0 })

    const delays = ref([])
    const removedDelays = ref([])

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
        text: $gettext('Schedules'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return element.name !== undefined && element.name.trim() !== ''
    })

    const loadRelated = async () => {
      if (!element.id) return

      try {
        const { data } = await api.get(
          `/api/v1/token/schedule-delays/?schedule__id=${element.id}`,
        )
        delays.value = data.results
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const elementData = () => {
      return {
        name: element.name,
        description: element.description,
      }
    }

    const updateRelated = async () => {
      const delayPromises = delays.value.map(async (delay) => {
        if (delay.delay === undefined || delay.duration === undefined) {
          return
        }

        const payload = {
          schedule: element.id,
          delay: delay.delay,
          duration: delay.duration,
          attributes: delay.attributes.map((item) => item.id),
        }

        try {
          if (delay.id > 0) {
            await api.patch(
              `/api/v1/token/schedule-delays/${delay.id}/`,
              payload,
            )
          } else {
            await api.post('/api/v1/token/schedule-delays/', payload)
          }
        } catch (error) {
          uiStore.notifyError(error)
        }
      })

      const deletePromises = removedDelays.value.map(async (id) => {
        try {
          await api.delete(`/api/v1/token/schedule-delays/${id}/`)
        } catch (error) {
          uiStore.notifyError(error)
        }
      })

      // Wait for all requests to finish
      await Promise.all([...delayPromises, ...deletePromises])
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        auto_register_computers: false,
        name: undefined,
        platform: undefined,
        pms: undefined,
        architecture: undefined,
      })
      delays.value.splice(0)
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const addInline = () => {
      delays.value.push({
        id: 0,
        delay: delays.value.length
          ? parseInt(delays.value[delays.value.length - 1].delay) + 1
          : 0,
        duration: 1,
        attributes: [],
      })
    }

    const removeInline = (index) => {
      const removedItem = delays.value.splice(index, 1)[0]
      if (removedItem.id > 0) {
        removedDelays.value.push(removedItem.id)
      }
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      delays,
      removedDelays,
      isValid,
      elementData,
      loadRelated,
      updateRelated,
      resetElement,
      setTitle,
      addInline,
      removeInline,
      appIcon,
    }
  },
}
</script>
