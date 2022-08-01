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

  const copyList = (model, value) => {
    if (value.length > 0) {
      const content = value.map((item) => item.id)

      copyToClipboard(JSON.stringify({ [model]: content })).then(() => {
        uiStore.notifySuccess($gettext('Content copied to clipboard'))
      })
    }
  }

  const pasteList = (element) => {
    if (element != null) {
      let data = null

      if (!('readText' in navigator.clipboard)) {
        uiStore.notifyError(
          $gettext('This browser does not implement clipboard reading')
        )
        return
      }

      navigator.clipboard.readText().then((value) => {
        if (value) {
          try {
            data = JSON.parse(value)
          } catch (error) {
            console.error(error, value)
          }

          if (typeof data === 'object') {
            const model = Object.keys(data)[0]
            data[model].map((item) => {
              if (typeof item === 'number')
                api
                  .get(`/api/v1/token/${model}/${item}/`)
                  .then((response) => {
                    element.add(response.data)
                  })
                  .catch((error) => {
                    uiStore.notifyError(error)
                  })
            })
          }
        }
      })
    }
  }

  return { hasPaste, copyList, pasteList }
}
