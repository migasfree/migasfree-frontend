<template>
  <q-banner rounded class="bg-light-blue-2 text-black q-ma-md">
    <template #avatar>
      <q-icon name="mdi-information-outline" color="black" />
    </template>
    {{ message }}
  </q-banner>
</template>

<script>
export default {
  name: 'BannerInfo',
  props: {
    message: { type: String, required: true },
  },
}
</script>
