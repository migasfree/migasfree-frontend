<template>
  <div class="row">
    <q-item class="col-12">
      <template v-if="addRoutes.length > 0">
        <q-item-section v-for="(item, index) in addRoutes" :key="index" avatar>
          <q-btn
            fab-mini
            dark
            color="primary"
            icon="mdi-plus"
            @click="$router.push({ name: item.route })"
          >
            <q-tooltip v-if="item.title">{{ item.title }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </template>

      <q-item-section>
        <h2 class="text-h3">
          {{ title }} <q-chip v-if="results !== null">{{ results }}</q-chip>
          <slot name="append"></slot>
        </h2>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
export default {
  name: 'Header',
  props: {
    title: { type: String, required: true },
    results: { type: Number, required: false, default: null },
    addRoutes: {
      type: Array,
      required: false,
      default() {
        return []
      }
    }
  }
}
</script>
