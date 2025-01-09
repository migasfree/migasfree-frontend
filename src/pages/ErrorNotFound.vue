<template>
  <div
    class="fullscreen bg-brown-7 text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2">{{ $gettext('Oops. Nothing here...') }}</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        size="xl"
        :to="{ name: 'home' }"
        :label="$gettext('Go Home')"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorNotFound',
})
</script>
