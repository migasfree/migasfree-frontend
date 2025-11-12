import { computed } from 'vue'
import { copyToClipboard } from 'quasar'
import { useGettext } from 'vue3-gettext'
import { useUiStore } from 'stores/ui'
import { api } from 'boot/axios'

export default function useCopyPaste() {
  const uiStore = useUiStore()
  const { $gettext } = useGettext()

  const hasPaste = computed(() => {
    return 'clipboard' in navigator && 'readText' in navigator.clipboard
  })

  const contentToClipboard = async (value) => {
    copyToClipboard(value).then(() => {
      uiStore.notifySuccess($gettext('Content copied to clipboard'))
    })
  }

  const copyList = (model, value) => {
    if (value.length > 0) {
      const content = value.map((item) => item.id)

      contentToClipboard(JSON.stringify({ [model]: content }))
    }
  }

  const pasteList = async (addCallback) => {
    if (!addCallback || typeof addCallback !== 'function') {
      uiStore.notifyError($gettext('Invalid callback function'))
      return
    }

    if (!('readText' in navigator.clipboard)) {
      uiStore.notifyError(
        $gettext('This browser does not implement clipboard reading'),
      )
      return
    }

    try {
      const value = await navigator.clipboard.readText()
      if (!value) return

      const data = JSON.parse(value)
      if (typeof data !== 'object' || data == null) return

      const model = Object.keys(data)[0]
      const items = Array.isArray(data[model]) ? data[model] : []
      const numberIds = items.filter((id) => typeof id === 'number')

      for (const id of numberIds) {
        try {
          const { data } = await api.get(`/api/v1/token/${model}/${id}/`)
          addCallback(data)
        } catch (error) {
          uiStore.notifyError(error)
        }
      }
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  return { hasPaste, contentToClipboard, copyList, pasteList }
}
