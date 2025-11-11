import { getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'

import { useUiStore } from 'stores/ui'
import { api } from 'boot/axios'

import { appIcon } from 'composables/element'

export function useDataOperations(deps) {
  const {
    model,
    detailRoute,
    isLoading,
    isLoadingExport,
    rows,
    totalRecords,
    selectedRows,
    queryParams,
  } = deps

  const route = useRoute()
  const router = useRouter()
  const $q = useQuasar()
  const { $gettext } = useGettext()
  const uiStore = useUiStore()
  const { emit } = getCurrentInstance()

  const loadItems = async () => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      const response = await api.get(`/api/v1/token/${model.value}/`, {
        params: queryParams(),
      })
      totalRecords.value = response.data.count
      rows.value = response.data.results
    } catch (error) {
      uiStore.notifyError(error)
    } finally {
      isLoading.value = false
    }
  }

  const edit = (id) => {
    router.push({ name: detailRoute.value, params: { id } })
  }

  const remove = (id, reload = true) => {
    api
      .delete(`/api/v1/token/${model.value}/${id}/`)
      .then(() => {
        emit('postRemove', id)
        uiStore.notifySuccess($gettext('Item deleted!'))
        if (reload) loadItems()
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  const confirmRemove = (id) => {
    let items = []
    let message = $gettext('Are you sure you want to remove this item?')

    if (typeof id === 'number' && id > 0) {
      items.push(id)
    } else {
      message = $gettext('Are you sure you want to remove all these items?')
      items = selectedRows.value.map((item) => item.id)
    }

    if (items.length === 0) return

    $q.dialog({
      message,
      ok: {
        color: 'negative',
        label: $gettext('Delete'),
        icon: appIcon('delete'),
      },
      cancel: {
        flat: true,
        label: $gettext('Cancel'),
      },
      persistent: true,
    }).onOk(() => {
      items.forEach((id) => {
        remove(id, items[items.length - 1] === id)
      })
    })
  }

  const _export = (url, params = {}) => {
    isLoadingExport.value = true
    api
      .get(url, {
        params,
        responseType: 'blob',
      })
      .then((response) => {
        let fileURL = window.URL.createObjectURL(new Blob([response.data]))
        let fileLink = document.createElement('a')

        fileLink.href = fileURL
        fileLink.setAttribute('download', `${model.value}.csv`)
        document.body.appendChild(fileLink)

        fileLink.click()
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
      .finally(() => {
        isLoadingExport.value = false
      })
  }

  const exportData = () => {
    const items = selectedRows.value.map((item) => item.id)

    if (items.length === 0) return

    _export(`/api/v1/token/${model.value}/export/?id__in=${items.join(',')}`)
  }

  const paramsToBackend = (obj) => {
    const ret = {}
    Object.entries(obj).map(([key, val]) => {
      const lastUnderscore = key.lastIndexOf('_')
      if (lastUnderscore > 0) {
        const newKey = `${key.substring(0, lastUnderscore)}__${key.substring(
          lastUnderscore + 1,
        )}`
        ret[newKey] = val
      } else ret[key] = val
    })

    return ret
  }

  const exportAll = () => {
    const params = paramsToBackend(route.query)
    Object.assign(params, queryParams())
    delete params.page
    delete params.page_size

    _export(`/api/v1/token/${model.value}/export/`, params)
  }

  const updateChecked = (id, value, reload = true) => {
    api
      .patch(`/api/v1/token/${model.value}/${id}/`, { checked: value })
      .then(() => {
        uiStore.notifySuccess($gettext('Changed item check value!'))
        if (reload) loadItems()
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  const updateItemsChecked = (value) => {
    const items = selectedRows.value.map((item) => item.id)
    if (items.length === 0) return

    items.forEach((id) => {
      updateChecked(id, value, items[items.length - 1] === id)
    })
  }

  const updateEnabled = (id, value, reload = true) => {
    let data = { enabled: value }
    if (model.value === 'user-profiles') data = { is_active: value }

    api
      .patch(`/api/v1/token/${model.value}/${id}/`, data)
      .then(() => {
        uiStore.notifySuccess($gettext('Changed item enable value!'))
        if (reload) loadItems()
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  const updateItemsEnabled = (value) => {
    const items = selectedRows.value.map((item) => item.id)
    if (items.length === 0) return

    items.forEach((id) => {
      updateEnabled(id, value, items[items.length - 1] === id)
    })
  }

  const regenerateMetadata = async (id) => {
    await api
      .get(`/api/v1/token/${model.value}/internal-sources/${id}/metadata/`)
      .then((response) => {
        uiStore.notifySuccess(response.data.detail)
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  return {
    loadItems,
    edit,
    remove,
    confirmRemove,
    exportData,
    exportAll,
    updateChecked,
    updateItemsChecked,
    updateEnabled,
    updateItemsEnabled,
    regenerateMetadata,
  }
}
