import { getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useGettext } from 'vue3-gettext'

import { useUiStore } from 'stores/ui'
import { api } from 'boot/axios'

import { appIcon } from 'composables/element'
import { useSmartRequest } from 'composables/useSmartRequest'

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
  const { smartRequest, smartExportRequest } = useSmartRequest()

  const loadItems = async () => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      const response = await smartRequest(
        `/api/v1/token/${model.value}/`,
        queryParams(),
      )
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

  const remove = async (id, reload = true) => {
    try {
      await api.delete(`/api/v1/token/${model.value}/${id}/`)
      emit('postRemove', id)
      uiStore.notifySuccess($gettext('Item deleted!'))
      if (reload) loadItems()
    } catch (error) {
      uiStore.notifyError(error)
    }
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

  const _export = async (url, params = {}) => {
    isLoadingExport.value = true
    try {
      const { data, headers } = await smartExportRequest(url, params)

      // Prefer filename from server (Content‑Disposition), fall back to model name
      const filename = headers['content-disposition']
        ? headers['content-disposition'].split('filename=')[1]
        : `${model.value}.csv`

      const blobURL = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = blobURL
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobURL) // free memory
    } catch (error) {
      uiStore.notifyError(error)
    } finally {
      isLoadingExport.value = false
    }
  }

  const exportData = async () => {
    const items = selectedRows.value.map((item) => item.id)

    if (items.length === 0) return

    // Use smart export with id__in filter parameter
    // This will automatically use POST if the ID list is too long
    await _export(`/api/v1/token/${model.value}/export/`, {
      id__in: items.join(','),
    })
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

  const exportAll = async () => {
    const params = paramsToBackend(route.query)
    Object.assign(params, queryParams())
    delete params.page
    delete params.page_size

    await _export(`/api/v1/token/${model.value}/export/`, params)
  }

  const updateChecked = async (id, value, reload = true) => {
    try {
      await api.patch(`/api/v1/token/${model.value}/${id}/`, { checked: value })
      uiStore.notifySuccess($gettext('Changed item check value!'))
      if (reload) await loadItems()
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const updateItemsChecked = async (value) => {
    const items = selectedRows.value.map(({ id }) => id)
    if (items.length === 0) return

    await Promise.all(
      items.map((id, idx) =>
        updateChecked(id, value, idx === items.length - 1),
      ),
    )
  }

  const updateEnabled = async (id, value, reload = true) => {
    const payload =
      model.value === 'user-profiles'
        ? { is_active: value }
        : { enabled: value }

    try {
      await api.patch(`/api/v1/token/${model.value}/${id}/`, payload)
      uiStore.notifySuccess($gettext('Changed item enable value!'))
      if (reload) loadItems()
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const updateItemsEnabled = async (value) => {
    const items = selectedRows.value.map(({ id }) => id)
    if (items.length === 0) return

    await Promise.all(
      items.map((id, idx) =>
        updateEnabled(id, value, idx === items.length - 1),
      ),
    )
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
  }
}
