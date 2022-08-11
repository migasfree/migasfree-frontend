<template>
  <q-btn-dropdown
    color="primary"
    outline
    split
    no-caps
    push
    dense
    :loading="loading"
    :to="link"
    @show="getRelations"
  >
    <template #label>
      <q-icon v-if="hasIcon" left :name="getIcon" />
      {{ value }}
      <q-tooltip v-if="tooltip">
        <q-list v-for="(item, index) in tooltipToView" :key="index" dense>
          <q-item>
            <q-item-section v-if="item.icon" avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.text }}</q-item-section>
          </q-item>
        </q-list>
      </q-tooltip>
    </template>

    <q-list>
      <q-item
        v-for="(item, index) in validRelations"
        :key="index"
        v-close-popup
        v-ripple
        dense
      >
        <q-item-section>
          <q-chip
            outline
            color="primary"
            size="md"
            clickable
            @click="$router.push(item.to)"
          >
            <q-avatar color="primary" text-color="white"
              >{{ humanNumber(item.count)
              }}<q-tooltip>{{ item.count }}</q-tooltip></q-avatar
            >
            {{ item.text }}
          </q-chip>

          <div v-if="item.actions.length > 0" class="q-gutter-sm">
            <q-btn
              v-for="action in item.actions"
              :key="action.title"
              color="primary"
              size="sm"
              no-caps
              type="a"
              :label="action.title"
              :href="action.url"
              ><q-tooltip>{{ action.description }}</q-tooltip></q-btn
            >
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { abbreviateNumber } from 'js-abbreviation-number'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import { modelIcon, useElement } from 'composables/element'

export default {
  name: 'MigasLink',
  props: {
    model: { type: String, required: true },
    pk: { type: Number, required: true },
    value: { type: String, required: true },
    tooltip: { type: String, required: false, default: '' },
    icon: { type: String, required: false, default: '' },
  },
  setup(props) {
    const uiStore = useUiStore()
    const router = useRouter()
    const pluralize = require('pluralize')
    const { computerStatus, elementIcon } = useElement()

    const relations = ref([])
    const loading = ref(false)

    const link = computed(() => {
      return `/${normalizeModel(props.model)}/results/${props.pk}`
    })

    const tooltipToView = computed(() => {
      switch (props.model) {
        case 'computers':
          const pieces = props.tooltip.split(',')
          return [
            {
              icon: elementIcon(pieces[0].trim()),
              text: computerStatus(pieces[0].trim()),
            },
            { icon: modelIcon('projects'), text: pieces[1].trim() },
            { icon: 'mdi-ip-network', text: pieces[2].trim() },
            { icon: modelIcon('users'), text: pieces[3].trim() },
          ]
        default:
          return [{ icon: '', text: props.tooltip.trim() }]
      }
    })

    const validRelations = computed(() => {
      const valid = []
      let name = ''

      Object.entries(relations.value).map(([key, item]) => {
        let to = '#'
        if (item.model && item.pk) {
          name = `${normalizeModel(pluralize.singular(item.model))}-detail`
          if (name === 'logical-devices-detail') name = 'logical-device-detail'
          if (
            !router.resolve({ name, params: { id: item.pk } }).matched.length >
            0
          )
            return

          to = {
            name: `${normalizeModel(pluralize.singular(item.model))}-detail`,
            params: {
              id: item.pk,
            },
          }
        } else if (item.model) {
          name = `${item.model.replaceAll(' ', '-')}-list`
          if (!router.resolve({ name }).matched.length > 0) return

          to = {
            name: `${item.model.replaceAll(' ', '-')}-list`,
          }
        } else if (item.api) {
          if (
            item.api.model === 'catalog/project-packages' ||
            item.api.model === 'catalog/policy-groups'
          )
            return
          name = `${normalizeModel(item.api.model)}-list`
          if (!router.resolve({ name }).matched.length > 0) return

          to = {
            name: `${normalizeModel(item.api.model)}-list`,
            query: normalizeQuery(item.api.query),
          }
        }

        valid.push({
          count: item.count,
          text: item.text,
          actions: item.actions,
          to,
        })
      })

      return valid
    })

    const getIcon = computed(() => {
      if (props.icon) return props.icon
      return modelIcon(props.model)
    })

    const hasIcon = computed(() => {
      return getIcon.value !== ''
    })

    const normalizeQuery = (obj) => {
      const normalizedObj = {}
      Object.entries(obj).map(([key, val]) => {
        if (key.includes('__')) normalizedObj[key.replaceAll('__', '_')] = val
        else normalizedObj[key] = val
      })

      return normalizedObj
    }

    const normalizeModel = (model) => {
      model = model
        .replaceAll(' ', '-')
        .replace('devices/', '')
        .replace('catalog/', '')
      switch (model) {
        case 'synchronizations':
          return 'syncs'
        case 'applications':
          return 'apps'
        case 'application':
          return 'app'
        case 'type':
          return 'device-type'
        case 'types':
          return 'device-types'
        case 'logical':
          return 'logical-devices'
        case 'apps':
          return 'applications'
        case 'attributes':
          return 'features'
        case 'properties':
          return 'formulas'
        default:
          return model
      }
    }

    const humanNumber = (value) => {
      return abbreviateNumber(value, 0)
    }

    const getRelations = async () => {
      const url = `/api/v1/token/${props.model}/${props.pk}/relations/`

      if (
        relations.value.length > 0 &&
        relations.value.some(
          (el) => el.pk === props.pk && el.model === props.model
        )
      ) {
        return
      }

      loading.value = true
      await api
        .get(url)
        .then((response) => {
          relations.value = response.data
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
        .finally(() => {
          loading.value = false
        })
    }

    return {
      relations,
      loading,
      link,
      tooltipToView,
      validRelations,
      getIcon,
      hasIcon,
      humanNumber,
      getRelations,
    }
  },
}
</script>
