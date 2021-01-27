<template>
  <transition name="info">
    <div v-if="element && !isLoading && !loading">
      <p>
        <translate>Device</translate>: <strong>{{ element.name }}</strong>
        <span v-if="element.location"> ({{ element.location }})</span>
      </p>

      <q-list
        v-if="
          'logical_devices' in element && element.logical_devices.length > 0
        "
      >
        <q-item-label header
          ><translate
            >Computers in Logical Devices (by Capability)</translate
          ></q-item-label
        >
        <q-item v-for="item in element.logical_devices" :key="item.id">
          <MigasLink
            model="devices/capabilities"
            :pk="item.capability.id"
            :value="item.capability.name"
            icon="mdi-format-list-bulleted-type"
          />
          <q-list v-for="computer in item.computers" :key="computer.id">
            <q-item>
              <MigasLink
                model="computers"
                :pk="computer.id"
                :value="computer.__str__ || ''"
                :icon="elementIcon(computer.status)"
              />
            </q-item>
          </q-list>
        </q-item>
      </q-list>
    </div>

    <div v-if="isLoading || loading">
      <q-spinner-dots color="primary" size="3em" />
    </div>
  </transition>
</template>

<script>
import MigasLink from 'components/MigasLink'
import { elementMixin } from 'mixins/element'

export default {
  name: 'ReplacementInfo',
  components: {
    MigasLink
  },
  mixins: [elementMixin],
  props: {
    element: {
      type: Object,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      sentinel: false,
      loading: true
    }
  },
  watch: {
    element: {
      handler: function(val, oldVal) {
        if (
          !this.sentinel &&
          'logical_devices' in val &&
          val.logical_devices.length > 0
        ) {
          this.sentinel = true
          this.loading = true
          this.loadComputers()
        }
      },
      deep: true
    }
  },
  methods: {
    async loadComputers() {
      Object.entries(this.element.logical_devices).map(([key, item]) => {
        if ('attributes' in item) {
          Object.entries(item.attributes).map(async ([keyAtt, att]) => {
            let computers = []
            if (att.property_att.prefix === 'CID') {
              await this.$axios
                .get(`/api/v1/token/computers/${parseInt(att.value)}`)
                .then((response) => {
                  computers.push(response.data)
                })
            }
            this.$set(this.element.logical_devices[key], 'computers', computers)

            if (!item.attributes[key + 1]) {
              this.loading = false
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.info-enter-active {
  transition: all 0.8s ease;
}
.info-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.info-enter,
.info-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
