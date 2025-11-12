import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useRoute, useRouter } from 'vue-router'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import { appIcon, modelIcon, useElement } from 'composables/element'

const defaultElementData = () => {}

export default function useDetail(
  originalTitle,
  model,
  routes,
  breadcrumbs,
  element,
  elementData = defaultElementData,
) {
  const uiStore = useUiStore()
  const route = useRoute()
  const router = useRouter()
  const { $gettext } = useGettext()
  const { emit } = getCurrentInstance()
  const { attributeValue, elementIcon } = useElement()

  const loading = ref(false)

  const elementTextFormatters = {
    features: (el) => (el.id ? attributeValue(el) : ''),
    tags: (el) => (el.id ? attributeValue(el) : ''),
    'user-profiles': (el) => (el.id ? el.username : ''),
    packages: (el) => (el.id ? el.fullname : ''),
    'devices/drivers': (el) => (el.id ? el.name.split('/').reverse()[0] : ''),
    computers: (el) => (el.id ? el.__str__ : ''),
  }

  const elementText = computed(() => {
    const formatter = elementTextFormatters[model]
    return formatter
      ? formatter(element)
      : element.id
        ? element.name || element.__str__
        : ''
  })

  const setupBreadcrumbs = () => {
    if (route.params.id) {
      if (!['package-information', 'computer-hardware'].includes(route.name)) {
        while (breadcrumbs.length > 3) {
          breadcrumbs.pop()
        }
        breadcrumbs.push({
          text: $gettext('Results'),
          icon: appIcon('results'),
          to: routes.list,
        })
        breadcrumbs.push({
          text: 'Id',
        })
      }
    } else if (breadcrumbs.length === 3 && route.name.endsWith('-add')) {
      breadcrumbs.push({ text: $gettext('Add'), icon: appIcon('add') })
    }
  }

  setupBreadcrumbs()

  const getElementIcon = computed(() => {
    if (model === 'computers') return elementIcon(element.status)
    if (model === 'features') return elementIcon(element.property_att.prefix)
    return modelIcon(model)
  })

  const addElement = () => {
    emit('resetElement')
    emit('resetRelated')

    while (breadcrumbs.length > 3) {
      breadcrumbs.pop()
    }
    breadcrumbs.push({
      text: $gettext('Add'),
      icon: appIcon('add'),
    })

    router.push({ name: routes.add })
    emit('setTitle', originalTitle)
  }

  const updateBreadcrumbs = () => {
    while (breadcrumbs.length > 3) {
      breadcrumbs.pop()
    }
    breadcrumbs.push({
      text: $gettext('Results'),
      icon: appIcon('results'),
      to: routes.list,
    })
    breadcrumbs.push({
      text: elementText.value,
      icon: getElementIcon.value,
    })
  }

  const updateElement = async (action = null) => {
    try {
      const isUpdate = Boolean(element.id)
      const data = elementData()
      const config =
        data instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : {}

      loading.value = true

      const url = `/api/v1/token/${model}/${isUpdate ? `${element.id}/` : ''}`
      const method = isUpdate ? api.patch : api.post
      const response = await method(url, data, config)

      // Update element if it's a create operation
      if (!isUpdate) {
        Object.assign(element, response.data)
        emit('setRelated')
      }

      // Common success handling
      emit('updateRelated')
      uiStore.notifySuccess(
        isUpdate
          ? $gettext('Data has been changed!')
          : $gettext('Data has been added!'),
      )

      if (action === 'return') {
        router.push({ name: routes.list })
      } else if (action === 'add') {
        addElement()
      } else {
        if (breadcrumbs.length === 4) {
          updateBreadcrumbs()
          emit('setTitle', `${originalTitle}: ${elementText.value}`)
        }
        router.push({
          name: routes.detail,
          params: { id: element.id },
        })
      }
    } catch (error) {
      uiStore.notifyError(error)
    } finally {
      loading.value = false
    }
  }

  const remove = async () => {
    try {
      await api.delete(`/api/v1/token/${model}/${element.id}/`)
      emit('postRemove')
      router.push({ name: routes.list })
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  onMounted(async () => {
    if (route.params.id) {
      try {
        const { data } = await api.get(
          `/api/v1/token/${model}/${route.params.id}/`,
        )
        Object.assign(element, data)

        emit('setRelated')

        const idCrumb = breadcrumbs.find((x) => x.text === 'Id')
        if (idCrumb) {
          if ('to' in idCrumb) idCrumb.to.params.id = element.id
          idCrumb.icon = getElementIcon.value
          idCrumb.text = elementText.value
        }

        emit('setTitle', `${originalTitle}: ${elementText.value}`)
      } catch (error) {
        uiStore.notifyError(error)
      }
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
