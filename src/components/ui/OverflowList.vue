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
            :model="model"
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
import { elementMixin } from 'mixins/element'

export default {
  name: 'OverflowList',
  components: { MigasLink },
  mixins: [elementMixin],
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: false,
      default: ''
    },
    items: {
      type: Array,
      required: true
    },
    model: {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>
