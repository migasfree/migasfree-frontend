import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useRoute, useRouter } from 'vue-router'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import { useElement, modelIcon } from 'composables/element'

const defaultElementData = () => {}

export default function useDetail(
  originalTitle,
  model,
  routes,
  breadcrumbs,
  element,
  elementData = defaultElementData
) {
  const uiStore = useUiStore()
  const route = useRoute()
  const router = useRouter()
  const { $gettext } = useGettext()
  const { emit } = getCurrentInstance()
  const { attributeValue, elementIcon } = useElement()

  const loading = ref(false)

  const elementText = computed(() => {
    if (model === 'features' || model === 'tags') {
      return element.id ? attributeValue(element) : ''
    }

    if (model === 'user-profiles') {
      return element.id ? element.username : ''
    }

    if (model === 'packages') {
      return element.id ? element.fullname : ''
    }

    if (model === 'devices/drivers') {
      return element.id ? element.name.split('/').reverse()[0] : ''
    }

    if (model === 'computers') {
      return element.id ? element.__str__ : ''
    }

    return element.id ? (element.name ? element.name : element.__str__) : ''
  })

  if (route.params.id) {
    if (!['package-information', 'computer-hardware'].includes(route.name)) {
      breadcrumbs.push({
        text: $gettext('Results'),
        to: routes.list,
        icon: 'mdi-table-large',
      })
      breadcrumbs.push({
        text: 'Id',
      })
    }
  } else {
    breadcrumbs.push({ text: $gettext('Add'), icon: 'mdi-plus-circle' })
  }

  const getElementIcon = () => {
    if (model === 'computers') return elementIcon(element.status)
    if (model === 'features') return elementIcon(element.property_att.prefix)
    return modelIcon(model)
  }

  const addElement = () => {
    emit('resetElement')
    emit('resetRelated')

    if (breadcrumbs.length === 5) breadcrumbs.pop()
    breadcrumbs[3].text = $gettext('Add')
    breadcrumbs[3].icon = 'mdi-plus-circle'
    router.push({ name: routes.add })
    emit('setTitle', originalTitle)
  }

  const updateElement = async (action = null) => {
    if (element.id) {
      loading.value = true
      await api
        .patch(`/api/v1/token/${model}/${element.id}/`, elementData())
        .then((response) => {
          emit('updateRelated')

          uiStore.notifySuccess($gettext('Data has been changed!'))
          if (action === 'return') {
            router.push({ name: routes.list })
          } else if (action === 'add') {
            addElement()
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => (loading.value = false))
    } else {
      loading.value = true
      const data = elementData()
      await api
        .post(
          `/api/v1/token/${model}/`,
          data,
          data instanceof FormData
            ? {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            : {}
        )
        .then((response) => {
          Object.assign(element, response.data)
          emit('updateRelated')
          emit('setRelated')

          uiStore.notifySuccess($gettext('Data has been added!'))

          if (action === 'return') {
            router.push({ name: routes.list })
          } else if (action === 'add') {
            emit('resetElement')
            emit('resetRelated')

            router.push({ name: routes.add })
          } else {
            if (breadcrumbs.length === 4) {
              breadcrumbs.pop()
              breadcrumbs.push({
                text: $gettext('Results'),
                to: routes.list,
                icon: 'mdi-table-large',
              })
              breadcrumbs.push({
                text: elementText.value,
                icon: getElementIcon(),
              })
              emit('setTitle', `${originalTitle}: ${elementText.value}`)
            }
            router.push({
              name: routes.detail,
              params: { id: element.id },
            })
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => (loading.value = false))
    }
  }

  const remove = async () => {
    await api
      .delete(`/api/v1/token/${model}/${element.id}/`)
      .then((response) => {
        emit('postRemove')
        router.push({ name: routes.list })
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  onMounted(async () => {
    if (route.params.id) {
      await api
        .get(`/api/v1/token/${model}/${route.params.id}/`)
        .then((response) => {
          Object.assign(element, response.data)
          emit('setRelated')
          if ('to' in breadcrumbs.find((x) => x.text === 'Id'))
            breadcrumbs.find((x) => x.text === 'Id').to.params.id = element.id
          breadcrumbs.find((x) => x.text === 'Id').icon = getElementIcon()
          breadcrumbs.find((x) => x.text === 'Id').text = elementText.value
          emit('setTitle', `${originalTitle}: ${elementText.value}`)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }

    emit('loadRelated')
  })

  return {
    loading,
    elementText,
    addElement,
    updateElement,
    remove,
  }
}
