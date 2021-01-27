<template>
  <transition name="info">
    <div v-if="element && !isLoading">
      <p>
        <translate>Device</translate>: <strong>{{ element.name }}</strong>
        <span v-if="element.location">({{ element.location }})</span>
      </p>

      <q-list v-if="element.logical_devices.length > 0">
        <q-item-label header
          ><translate>Computers in Logical Devices</translate></q-item-label
        >
        <q-item v-for="item in element.logical_devices" :key="item.id">
          <MigasLink
            model="devices/capabilities"
            :pk="item.capability.id"
            :value="item.capability.name"
            icon="mdi-format-list-bulleted-type"
          />
          <div v-for="attribute in item.attributes" :key="attribute.id">
            <MigasLink
              v-if="attribute.property_att.prefix === 'CID'"
              model="computers"
              :pk="attribute.value"
              :value="attribute.value"
            />
          </div>
        </q-item>
      </q-list>
    </div>

    <div v-if="isLoading">
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
