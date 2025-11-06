<template>
  <q-banner rounded class="bg-light-blue-2 text-black q-ma-md">
    <template #avatar>
      <q-icon :name="appIcon('information')" color="black" />
    </template>
    {{ message }}
  </q-banner>
</template>

<script>
import { appIcon } from 'composables/element'

export default {
  name: 'BannerInfo',
  props: {
    message: { type: String, required: true },
  },
  setup() {
    return { appIcon }
  },
}
</script>
