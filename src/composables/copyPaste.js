import { computed } from 'vue'
import { copyToClipboard } from 'quasar'
import { useGettext } from 'vue3-gettext'
import { useUiStore } from 'stores/ui'
import { api } from 'boot/axios'

/**
 * Composable for clipboard operations (copy/paste lists of items).
 *
 * Provides functionality to:
 * - Copy content to clipboard with success notification
 * - Copy lists of items (serialized as JSON with IDs)
 * - Paste lists from clipboard and fetch items from API
 *
 * @returns {Object} Clipboard utilities
 * @property {ComputedRef<boolean>} hasPaste - Whether browser supports clipboard reading
 * @property {Function} contentToClipboard - Copy string content to clipboard
 * @property {Function} copyList - Copy array of items as JSON {model: [ids]}
 * @property {Function} pasteList - Read clipboard and fetch items via API
 *
 * @example
 * const { contentToClipboard, copyList, pasteList, hasPaste } = useCopyPaste()
 *
 * // Copy text
 * await contentToClipboard('Hello World')
 *
 * // Copy list of items
 * copyList('computers', [{id: 1}, {id: 2}])
 *
 * // Paste and fetch items
 * await pasteList((item) => myList.push(item))
 */
export default function useCopyPaste() {
  const uiStore = useUiStore()
  const { $gettext } = useGettext()

  const hasPaste = computed(() => {
    return 'clipboard' in navigator && 'readText' in navigator.clipboard
  })

  const contentToClipboard = async (value) => {
    try {
      await copyToClipboard(value)
      uiStore.notifySuccess($gettext('Content copied to clipboard'))
    } catch (error) {
      uiStore.notifyError(error)
    }
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
