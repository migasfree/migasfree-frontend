<template>
  <div>
    <q-select
      ref="attributes"
      v-model="localValue"
      outlined
      use-input
      map-options
      multiple
      counter
      input-debounce="0"
      clearable
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

    <div v-if="hasPaste" class="row">
      <q-btn
        flat
        icon="mdi-content-copy"
        color="primary"
        @click.stop="copyList(model, 'attributes')"
        ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
      >

      <q-btn
        flat
        icon="mdi-content-paste"
        color="primary"
        @click.stop="pasteList('attributes')"
        ><q-tooltip>{{ $gettext('Paste') }}</q-tooltip></q-btn
      >
    </div>
  </div>
</template>

<script>
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'
import { copyPasteMixin } from 'mixins/copyPaste'

export default {
  name: 'SelectAttributes',
  components: { MigasLink },
  mixins: [elementMixin, copyPasteMixin],
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
      attributes: [],
      model: 'attributes'
    }
  },
  watch: {
    localValue(newValue) {
      if (newValue === null) newValue = []
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
  mounted() {
    this.updateAttributes()
  },
  methods: {
    async filterAttributes(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      await this.$axios
        .get(`/api/v1/token/${this.model}/`, {
          params: { search: val.toLowerCase() }
        })
        .then((response) => {
          this.attributes = response.data.results
        })

      update(() => {})
    },

    abortFilterAttributes() {
      // console.log('delayed filter aborted')
    },

    updateAttributes() {
      Object.entries(this.value).map(([key, val]) => {
        if (
          !('status' in val) &&
          (val.property_att.prefix === 'CID' ||
            val.property_att.prefix === 'SET' ||
            val.property_att.prefix === 'DMN')
        ) {
          this.$axios
            .get(`/api/v1/token/${this.model}/${val.id}/badge/`)
            .then((response) => {
              this.$set(
                this.value,
                key,
                Object.assign({}, this.value[key], response.data)
              )
              this.$set(this.value[key], 'description', response.data.text)
            })
        }
      })
    }
  }
}
</script>
