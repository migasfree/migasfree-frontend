<template>
  <q-breadcrumbs>
    <q-breadcrumbs-el
      v-for="(item, index) in items"
      :key="index"
      :icon="item.icon"
      :to="goTo(item.to)"
      :label="item.text"
    />
  </q-breadcrumbs>
</template>

<script>
export default {
  name: 'Breadcrumbs',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  methods: {
    goTo(to) {
      if (to) {
        return { name: to }
      }
      return ''
    }
  }
}
</script>
