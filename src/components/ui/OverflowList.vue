<template>
  <q-list v-if="items.length > 0" bordered>
    <q-expansion-item
      :label="label"
      default-opened
      :icon="icon"
      :content-inset-level="0.5"
    >
      <q-list class="overflow">
        <q-item v-for="item in items" :key="item.id">
          <MigasLink :model="model" :pk="item.id" :value="item.value" />
        </q-item>
      </q-list>
    </q-expansion-item>
  </q-list>
</template>

<script>
import MigasLink from 'components/MigasLink'

export default {
  name: 'OverflowList',
  components: { MigasLink },
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
      required: true
    }
  }
}
</script>
