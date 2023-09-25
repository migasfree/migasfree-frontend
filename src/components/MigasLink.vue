<template>
  <q-btn-dropdown
    split
    no-caps
    dense
    auto-close
    :class="$q.dark.isActive ? 'text-info' : 'text-primary'"
    :loading="loading"
    :to="link"
    @before-show="getRelations"
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
        v-ripple
        dense
      >
        <q-item-section>
          <q-chip
            outline
            :color="$q.dark.isActive ? 'info' : 'primary'"
            size="md"
            clickable
            @click="$router.push(item.to)"
          >
            <q-avatar
              :color="$q.dark.isActive ? 'info' : 'primary'"
              :text-color="$q.dark.isActive ? 'black' : 'white'"
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
    const validRelations = ref([])
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

    const filterRelations = () => {
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

        validRelations.value.push({
          count: item.count,
          text: item.text,
          actions: item.actions,
          to,
        })
      })
    }

    const getRelations = async () => {
      const url = `/api/v1/token/${props.model}/${props.pk}/relations/`

      if (
        relations.value.length > 0 &&
        relations.value.some(
          (el) => el.pk === props.pk && el.model === props.model,
        )
      ) {
        return
      }

      loading.value = true
      await api
        .get(url)
        .then((response) => {
          relations.value = response.data
          filterRelations()
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
      validRelations,
      loading,
      link,
      tooltipToView,
      getIcon,
      hasIcon,
      humanNumber,
      getRelations,
    }
  },
}
</script>
