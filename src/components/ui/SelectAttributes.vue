<template>
  <q-select
    v-model="localValue"
    outlined
    use-input
    map-options
    multiple
    input-debounce="0"
    :label="label"
    :options="attributes"
    @filter="filterAttributes"
    @filter-abort="abortFilterAttributes"
    @input="updateAttributes"
  >
    <template #no-option>
      <q-item>
        <q-item-section v-translate class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template #option="scope">
      <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
        {{ attributeValue(scope.opt) }}
      </q-item>
    </template>

    <template #selected-item="scope">
      <q-chip
        removable
        dense
        :tabindex="scope.tabindex"
        class="q-ma-md"
        @remove="scope.removeAtIndex(scope.index)"
      >
        <MigasLink
          :model="equivalentModel(scope.opt)"
          :pk="equivalentKey(scope.opt)"
          :value="attributeValue(scope.opt)"
          :icon="elementIcon(scope.opt.status)"
          :tooltip="scope.opt.summary"
        />
      </q-chip>
    </template>
  </q-select>
</template>

<script>
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'

export default {
  name: 'SelectAttributes',
  components: { MigasLink },
  mixins: [elementMixin],
  props: {
    value: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      localValue: this.value,
      attributes: []
    }
  },
  watch: {
    localValue(newValue) {
      this.$emit('input', newValue)
    },
    value: {
      handler: function(val, oldVal) {
        this.localValue = val
        this.updateAttributes()
      },
      deep: true
    }
  },
  methods: {
    filterAttributes(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/attributes/', { params: { search: needle } })
          .then((response) => {
            this.attributes = response.data.results
          })
        /* this.attributes = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterAttributes() {
      // console.log('delayed filter aborted')
    },

    updateAttributes() {
      Object.entries(this.value).map(([key, val]) => {
        if (!('status' in val)) {
          this.$axios
            .get(`/api/v1/token/attributes/${val.id}/badge/`)
            .then((response) => {
              Object.assign(this.value[key], response.data)
              this.$set(this.value[key], 'description', response.data.text)
            })
        }
      })
    }
  }
}
</script>
