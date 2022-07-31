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
      required: true,
    },
  },
  setup() {
    const goTo = (to) => {
      if (typeof to === 'object') {
        return to
      } else if (typeof to === 'string') {
        return { name: to }
      }
      return ''
    }

    return {
      goTo,
    }
  },
}
</script>

<style scoped>
.body--light span.q-breadcrumbs__el {
  color: black;
}

.body--dark span.q-breadcrumbs__el {
  color: white;
}
</style>
