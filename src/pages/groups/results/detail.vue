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
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template v-if="element.id" #actions>
        <q-btn
          color="secondary"
          class="q-ma-sm"
          :icon="appIcon('add')"
          :icon-right="modelIcon('user-profiles')"
          @click="
            $router.push({
              name: 'user-profile-add',
              query: { groups: element.id },
            })
          "
          ><q-tooltip>{{ $gettext('Add User Profile') }}</q-tooltip></q-btn
        >
      </template>

      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-md col-sm">
              <q-input
                ref="primaryInput"
                v-model="element.name"
                :label="$gettext('Name')"
                outlined
                lazy-rules
                :rules="[(val) => !!val || $gettext('* Required')]"
              />
            </div>
          </div>

          <div class="row q-pa-md q-gutter-md">
            <div class="col-md col-sm">
              <FilteredMultiSelect
                v-model="element.permissions"
                clearable
                :label="$gettext('Permissions')"
                :fetch-options="filterPermissions"
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
                    {{ scope.opt.name }}
                  </q-chip>
                </template>
              </FilteredMultiSelect>
            </div>
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

import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import ItemDetail from 'components/ui/ItemDetail'

import { appIcon, modelIcon } from 'composables/element'
import useAutoFocus from 'composables/autoFocus'

export default {
  components: {
    FilteredMultiSelect,
    ItemDetail,
  },
  setup() {
    const { $gettext } = useGettext()
    const { inputRef: primaryInput } = useAutoFocus()

    const title = ref($gettext('Group'))
    const windowTitle = ref(title.value)
    useMeta(() => ({ title: windowTitle.value }))

    const routes = {
      list: 'groups-list',
      add: 'group-add',
      detail: 'group-detail',
    }
    const model = 'accounts/groups'

    let element = reactive({
      id: 0,
      permissions: [],
    })

    const breadcrumbs = ref([
      {
        text: $gettext('Dashboard'),
        icon: appIcon('home'),
        to: 'home',
      },
      {
        text: $gettext('Configuration'),
        icon: appIcon('configuration'),
      },
      {
        text: $gettext('Groups'),
        icon: modelIcon(model),
        to: routes.list,
      },
    ])

    const isValid = computed(() => {
      return element.name !== undefined && element.name.trim() !== ''
    })

    const elementData = () => {
      return {
        name: element.name,
        permissions: element.permissions.map((item) => item.id),
      }
    }

    const resetElement = () => {
      Object.assign(element, {
        id: 0,
        name: undefined,
        permissions: [],
      })
    }

    const setTitle = (value) => {
      windowTitle.value = value
    }

    const filterPermissions = async (val) => {
      const { data } = await api.get('/api/v1/token/accounts/permissions/', {
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
      isValid,
      elementData,
      resetElement,
      setTitle,
      filterPermissions,
      appIcon,
      modelIcon,
      primaryInput,
    }
  },
}
</script>
