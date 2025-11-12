<template>
  <Breadcrumbs :items="breadcrumbs" />

  <Header :title="originalTitle" :icon="titleIcon" :has-export-button="false">
    <template v-if="element.id" #append
      ><span class="vertical-middle">: </span>
      <MigasLink
        v-if="headerLink"
        :model="model"
        :pk="element.id"
        :value="headerValue"
        :icon="headerIcon"
        :tooltip="element.summary || element.description"
      />
      <template v-else
        ><span class="vertical-middle">{{ elementText }}</span></template
      >
    </template>

    <template #actions>
      <slot name="actions"></slot>

      <q-btn
        v-if="model === 'user-profiles' && element.id"
        class="q-ma-sm"
        :aria-label="$gettext('Change Password')"
        color="primary"
        :icon="appIcon('password')"
        @click="
          $router.push({
            name: 'user-profile-change-password',
            params: { id: element.id },
          })
        "
        ><q-tooltip>{{ $gettext('Change Password') }}</q-tooltip></q-btn
      >

      <q-btn
        v-if="model === 'deployments' && element.source === 'I'"
        class="q-ma-sm"
        :aria-label="$gettext('Regenerate Metadata')"
        color="primary"
        :icon="appIcon('regenerate')"
        @click="regenerateMetadata(element.id)"
        ><q-tooltip>{{ $gettext('Regenerate Metadata') }}</q-tooltip></q-btn
      >

      <q-btn
        v-if="
          model === 'packages' &&
          'store' in element &&
          element.store.id &&
          $route.name !== 'package-information'
        "
        class="q-ma-md"
        size="md"
        :icon="appIcon('information')"
        :aria-label="$gettext('Package Information')"
        color="primary"
        text-color="white"
        @click="
          $router.push({
            name: 'package-information',
            params: { id: element.id },
          })
        "
        ><q-tooltip>{{ $gettext('Package Information') }}</q-tooltip></q-btn
      >

      <q-btn
        v-if="model === 'packages' && element.url"
        class="q-ma-md"
        size="md"
        :icon="appIcon('download')"
        :aria-label="$gettext('Download')"
        color="primary"
        text-color="white"
        type="a"
        :href="`${server}${element.url}`"
        ><q-tooltip>{{ $gettext('Download') }}</q-tooltip></q-btn
      >

      <q-btn
        v-if="'add' in routes"
        class="q-ma-sm"
        color="primary"
        text-color="white"
        :aria-label="$gettext('Add')"
        :icon="appIcon('add')"
        @click="addElement"
        ><q-tooltip>{{ $gettext('Add') }}</q-tooltip></q-btn
      >
    </template>
  </Header>

  <BannerInfo v-if="noData" :message="$gettext('No data available.')" />

  <p v-if="element.id === 0 && $route.params.id" class="text-center">
    <q-spinner-dots color="primary" size="3em" />
  </p>

  <q-card
    v-else
    :bordered="!borderless"
    flat
    :class="borderless ? 'transparent' : ''"
  >
    <slot name="fields"></slot>

    <q-card-actions v-if="visibleActions" class="justify-around">
      <q-btn
        v-if="addButton"
        flat
        color="primary"
        :label="$gettext('Save and add other')"
        :icon="appIcon('add')"
        :loading="loading"
        :disabled="!isValid || loading"
        @click="updateElement('add')"
      />

      <q-btn
        v-if="continueButton"
        flat
        color="primary"
        :label="$gettext('Save and continue editing')"
        :icon="appIcon('save-edit')"
        :loading="loading"
        :disabled="!isValid || loading"
        @click="updateElement"
      />

      <q-btn
        v-if="saveButton"
        :label="$gettext('Save')"
        color="primary"
        :icon="appIcon('save')"
        :loading="loading"
        :disabled="!isValid || loading"
        @click="updateElement('return')"
      />
    </q-card-actions>
  </q-card>

  <div
    v-if="removeButton && $route.params.id && element.id && !noData"
    class="row q-pa-md"
  >
    <q-btn
      flat
      :icon="appIcon('delete')"
      :color="$q.dark.isActive ? 'white' : 'negative'"
      :class="{ 'reversed-delete': $q.dark.isActive }"
      :label="$gettext('Delete')"
      @click="confirmRemove = true"
    />
  </div>

  <RemoveDialog
    v-model="confirmRemove"
    @confirmed="remove"
    @canceled="confirmRemove = !confirmRemove"
  />
</template>

<script>
import { defineComponent, ref, computed } from 'vue'

import BannerInfo from 'components/ui/BannerInfo'
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import useDetail from 'composables/detail'
import { appIcon, modelIcon, useElement } from 'composables/element'

export default defineComponent({
  name: 'ItemDetail',
  components: {
    BannerInfo,
    Breadcrumbs,
    Header,
    MigasLink,
    RemoveDialog,
  },
  props: {
    originalTitle: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: false,
      default: null,
    },
    breadcrumbs: {
      type: Array,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    routes: {
      type: Object,
      required: true,
    },
    element: {
      type: Object,
      required: true,
    },
    elementData: {
      type: Function,
      required: false,
      default: () => {},
    },
    isValid: {
      type: Boolean,
      required: true,
    },
    addButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    continueButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    saveButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    removeButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    headerLink: {
      type: Boolean,
      required: false,
      default: true,
    },
    noData: {
      type: Boolean,
      required: false,
      default: false,
    },
    visibleActions: {
      type: Boolean,
      required: false,
      default: true,
    },
    borderless: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: [
    'loadRelated',
    'updateRelated',
    'setRelated',
    'resetRelated',
    'postRemove',
    'resetElement',
    'setTitle',
  ],
  setup(props) {
    const uiStore = useUiStore()

    const confirmRemove = ref(false)
    const titleIcon = props.icon || modelIcon(props.model)

    const { loading, elementText, addElement, updateElement, remove } =
      useDetail(
        props.originalTitle,
        props.model,
        props.routes,
        props.breadcrumbs,
        props.element,
        props.elementData,
      )

    const { elementIcon, attributeValue } = useElement()

    const headerValue = computed(() => {
      if (props.model === 'features' || props.model === 'tags') {
        return attributeValue(props.element)
      }

      return elementText.value
    })

    const headerIcon = computed(() => {
      if (props.model === 'features') {
        return elementIcon(props.element.property_att.prefix)
      }

      if (props.model === 'computers') {
        return elementIcon(props.element.status)
      }

      return modelIcon(props.model)
    })

    const regenerateMetadata = async (id) => {
      try {
        const { data } = await api.get(
          `/api/v1/token/${props.model}/internal-sources/${id}/metadata/`,
        )
        uiStore.notifySuccess(data.detail)
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    return {
      server: uiStore.server,
      titleIcon,
      loading,
      elementText,
      headerValue,
      headerIcon,
      confirmRemove,
      remove,
      addElement,
      updateElement,
      regenerateMetadata,
      appIcon,
    }
  },
})
</script>
