<template>
  <q-list v-if="items.length > 0" bordered>
    <q-expansion-item default-opened :icon="icon" :content-inset-level="0.5">
      <template #header>
        <q-item-section>
          <q-chip>
            <q-avatar color="info" text-color="black">{{
              items.length
            }}</q-avatar>
            {{ label }}
          </q-chip>
        </q-item-section>
      </template>

      <q-list class="overflow">
        <q-item v-for="(item, index) in items" :key="index">
          <MigasLink
            v-if="model"
            :model="getModel(item)"
            :pk="item.id"
            :icon="item.icon || elementIcon(item.status) || ''"
            :value="item.value || item.name || item.__str__"
            :tooltip="item.summary || ''"
          />
          <div v-else>{{ item }}</div>
        </q-item>
      </q-list>
    </q-expansion-item>
  </q-list>
</template>

<script>
import MigasLink from 'components/MigasLink'

import { useElement } from 'composables/element'

export default {
  name: 'OverflowList',
  components: { MigasLink },
  props: {
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: false,
      default: '',
    },
    items: {
      type: Array,
      required: true,
    },
    model: {
      type: String,
      required: false,
      default: '',
    },
  },
  setup(props) {
    const { elementIcon } = useElement()

    const getModel = (item) => {
      if ('model' in item) return item.model
      return props.model
    }

    return { elementIcon, getModel }
  },
}
</script>
