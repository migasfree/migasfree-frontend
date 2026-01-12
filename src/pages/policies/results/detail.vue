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
      @reset-related="resetRelated"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">{{ $gettext('General') }}</div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col">
              <q-input
                ref="primaryInput"
                v-model="element.name"
                outlined
                :label="$gettext('Name')"
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <q-checkbox
                v-model="element.enabled"
                left-label
                :label="$gettext('Enabled?')"
              />
              <p class="text-caption">
                {{
                  $gettext(
                    'If you uncheck this field, the policy is disabled for all computers.',
                  )
                }}
              </p>
            </div>

            <div class="col-6 col-md col-sm">
              <q-checkbox
                v-model="element.exclusive"
                left-label
                :label="$gettext('Exclusive?')"
              />
              <p class="text-caption">
                {{
                  $gettext(
                    'If you check this field, it orders to uninstall the Applications assigned in the priorities that have not been met.',
                  )
                }}
              </p>
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col">
              <q-input
                v-model="element.comment"
                outlined
                type="textarea"
                :label="$gettext('Comment')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">
            {{ $gettext('Application Area') }}
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-6 col-md col-sm">
              <SelectAttributes
                v-model="element.included_attributes"
                :label="$gettext('Included Attributes')"
              />
            </div>

            <div class="col-6 col-md col-sm">
              <SelectAttributes
                v-model="element.excluded_attributes"
                :label="$gettext('Excluded Attributes')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-h5 q-mt-sm q-mb-xs">
            {{ $gettext('Policy Groups') }}
          </div>

          <q-list
            v-if="policyGroups.length > 0"
            class="q-pa-md"
            bordered
            separator
          >
            <q-item v-for="(line, index) in policyGroups" :key="index">
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
                      v-model="line.priority"
                      outlined
                      type="number"
                      :label="$gettext('Priority')"
                      lazy-rules
                      :rules="[(val) => !!val || $gettext('* Required')]"
                    />
                  </div>

                  <div class="col-5 col-md col-sm">
                    <FilteredMultiSelect
                      v-model="line.applications"
                      :label="$gettext('Applications')"
                      :fetch-options="filterApplications"
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
                          :tabindex="scope.tabindex"
                          class="q-ma-md"
                          @remove="scope.removeAtIndex(scope.index)"
                        >
                          <MigasLink
                            model="catalog/apps"
                            :pk="scope.opt.id"
                            :value="scope.opt.name"
                          />
                        </q-chip>
                      </template>
                    </FilteredMultiSelect>
                  </div>
                </div>

                <div class="row q-pa-md q-gutter-md">
                  <div class="col-5 col-md col-sm">
                    <SelectAttributes
                      v-model="line.included_attributes"
                      :label="$gettext('Included Attributes')"
                    />
                  </div>

                  <div class="col-5 col-md col-sm">
                    <SelectAttributes
                      v-model="line.excluded_attributes"
                      :label="$gettext('Excluded Attributes')"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-pa-md">
            <q-btn
              :icon="appIcon('add')"
              :label="$gettext('Add other Policy Group')"
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

import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'
import MigasLink from 'components/MigasLink'
import SelectAttributes from 'components/ui/SelectAttributes'

import { appIcon, modelIcon } from 'composables/element'
import useAutoFocus from 'composables/autoFocus'

export default {
  components: {
    FilteredMultiSelect,
    ItemDetail,
    MigasLink,
    SelectAttributes,
  },
  setup() {
    const uiStore = useUiStore()
    const { $gettext } = useGettext()
    const { inputRef: primaryInput } = useAutoFocus()

    const title = ref($gettext('Policy'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'policies-list',
      add: 'policy-add',
      detail: 'policy-detail',
    }
    const model = 'catalog/policies'

    let element = reactive({
      id: 0,
      enabled: false,
      exclusive: false,
      included_attributes: [],
      excluded_attributes: [],
    })

    const policyGroups = ref([])
    const removedPolicyGroups = ref([])

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
        text: $gettext('Policies'),
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
          `/api/v1/token/catalog/policy-groups/?policy__id=${element.id}`,
        )
        policyGroups.value = data.results
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const elementData = () => {
      return {
        name: element.name,
        comment: element.comment,
        enabled: element.enabled,
        exclusive: element.exclusive,
        included_attributes: element.included_attributes.map((item) => item.id),
        excluded_attributes: element.excluded_attributes.map((item) => item.id),
      }
    }

    const updateRelated = async () => {
      const policyPromises = policyGroups.value.map(async (line) => {
        if (line.priority === undefined) return

        const payload = {
          policy: element.id,
          priority: line.priority,
          included_attributes: line.included_attributes.map((item) => item.id),
          excluded_attributes: line.excluded_attributes.map((item) => item.id),
          applications: line.applications.map((item) => item.id),
        }

        try {
          if (line.id > 0) {
            await api.patch(
              `/api/v1/token/catalog/policy-groups/${line.id}/`,
              payload,
            )
          } else {
            await api.post('/api/v1/token/catalog/policy-groups/', payload)
          }
        } catch (error) {
          uiStore.notifyError(error)
        }
      })

      const deletePromises = removedPolicyGroups.value.map(async (id) => {
        try {
          await api.delete(`/api/v1/token/catalog/policy-groups/${id}/`)
        } catch (error) {
          uiStore.notifyError(error)
        }
      })

      await Promise.all([...policyPromises, ...deletePromises])
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        comment: undefined,
        enabled: false,
        exclusive: false,
        included_attributes: [],
        excluded_attributes: [],
      })
    }

    const resetRelated = () => {
      policyGroups.value = []
      removedPolicyGroups.value = []
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const addInline = () => {
      policyGroups.value.push({
        id: 0,
        priority: policyGroups.value.length
          ? parseInt(
              policyGroups.value[policyGroups.value.length - 1].priority,
            ) + 1
          : 1,
        included_attributes: [],
        excluded_attributes: [],
        applications: [],
      })
    }

    const removeInline = (index) => {
      const removedItem = policyGroups.value.splice(index, 1)[0]
      if (removedItem.id > 0) {
        removedPolicyGroups.value.push(removedItem.id)
      }
    }

    const filterApplications = async (val) => {
      const { data } = await api.get('/api/v1/token/catalog/apps/', {
        params: { search: val.toLowerCase() },
      })

      return data.results
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      policyGroups,
      removedPolicyGroups,
      isValid,
      elementData,
      loadRelated,
      updateRelated,
      resetElement,
      resetRelated,
      setTitle,
      addInline,
      removeInline,
      filterApplications,
      appIcon,
      primaryInput,
    }
  },
}
</script>
