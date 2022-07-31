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
      :header-link="false"
      @reset-element="resetElement"
      @set-title="setTitle"
    >
      <template #fields>
        <q-card-section>
          <div class="row q-pa-md q-gutter-md">
            <div class="col-md col-sm">
              <q-input
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
              <q-select
                v-model="element.permissions"
                outlined
                use-input
                map-options
                multiple
                counter
                input-debounce="0"
                :label="$gettext('Permissions')"
                :options="permissions"
                @filter="filterPermissions"
                @filter-abort="abortFilterPermissions"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section v-translate class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>

                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    {{ scope.opt.name }}
                  </q-item>
                </template>

                <template #selected-item="scope">
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
              </q-select>
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

import ItemDetail from 'components/ui/ItemDetail'

import { modelIcon } from 'composables/element'

export default {
  components: {
    ItemDetail,
  },
  setup() {
    const { $gettext } = useGettext()

    const title = ref($gettext('Group'))
    const windowTitle = ref(title.value)
    useMeta(() => {
      return {
        title: windowTitle.value,
      }
    })

    const routes = {
      list: 'groups-list',
      add: 'group-add',
      detail: 'group-detail',
    }
    const model = 'accounts/groups'

    const permissions = ref([])

    let element = reactive({
      id: 0,
      permissions: [],
    })

    const breadcrumbs = reactive([
      {
        text: $gettext('Dashboard'),
        to: 'home',
        icon: 'mdi-home',
      },
      {
        text: $gettext('Configuration'),
        icon: 'mdi-cogs',
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

    const filterPermissions = async (val, update, abort) => {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      await api
        .get('/api/v1/token/accounts/permissions', {
          params: { search: val.toLowerCase() },
        })
        .then((response) => {
          permissions.value = response.data.results
        })

      update(() => {})
    }

    const abortFilterPermissions = () => {
      // console.log('delayed filter aborted')
    }

    return {
      breadcrumbs,
      title,
      model,
      routes,
      element,
      permissions,
      isValid,
      elementData,
      resetElement,
      setTitle,
      filterPermissions,
      abortFilterPermissions,
    }
  },
}
</script>
