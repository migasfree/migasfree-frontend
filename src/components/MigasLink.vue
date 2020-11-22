<template>
  <q-btn-dropdown
    color="primary"
    outline
    split
    no-caps
    push
    dense
    :loading="loading"
    :to="link"
    @show="getRelations"
  >
    <template v-slot:label>
      <q-icon v-if="icon" left :name="icon" />
      {{ value }}
      <q-tooltip v-if="tooltip" content-style="font-size: 14px">
        {{ tooltip }}
      </q-tooltip>
    </template>

    <q-list>
      <q-item
        v-for="(item, index) in relations"
        :key="index"
        v-close-popup
        v-ripple
        dense
        clickable
      >
        <q-item-section>
          <q-chip outline color="primary" size="md">
            <q-avatar color="primary" text-color="white">{{
              item.count
            }}</q-avatar>
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
export default {
  props: {
    model: { type: String, required: true },
    pk: { type: Number, required: true },
    value: { type: String, required: true },
    tooltip: { type: String, required: false, default: '' },
    icon: { type: String, required: false, default: '' }
  },
  data() {
    return {
      relations: [],
      loading: false
    }
  },
  computed: {
    link() {
      return `/${this.model}/results/${this.pk}`
    }
  },
  methods: {
    async getRelations() {
      const url = `/api/v1/token/${this.model}/${this.pk}/relations/`

      console.log(this.relations)
      if (this.relations.length > 0) return

      this.loading = true
      await this.$axios
        .get(url)
        .then((response) => {
          this.relations = response.data
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.loading = false))
    }
  }
}
</script>
