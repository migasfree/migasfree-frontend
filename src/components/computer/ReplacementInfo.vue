<template>
  <transition name="info">
    <div v-if="element && !isLoading">
      <p>
        <translate>Computer</translate>: <strong>{{ element.__str__ }}</strong>
      </p>

      <p>
        <translate>Status</translate>:
        <q-icon :name="elementIcon(element.status)" />
        <strong>{{ element.status }}</strong>
      </p>

      <q-list v-if="element.tags.length > 0">
        <q-item-label header><translate>Tags</translate></q-item-label>
        <q-item v-for="tag in element.tags" :key="tag.id">
          <MigasLink
            model="tags"
            :pk="tag.id"
            :value="attributeValue(tag)"
            icon="mdi-tag"
          />
        </q-item>
      </q-list>

      <template v-if="element.devices">
        <p v-if="element.default_logical_device">
          <translate>Default Device</translate>:
          <strong>{{ element.default_logical_device }}</strong>
        </p>

        <q-list v-if="element.assigned_logical_devices_to_cid">
          <q-item-label header><translate>Devices</translate></q-item-label>
          <q-item
            v-for="device in element.assigned_logical_devices_to_cid"
            :key="device.id"
          >
            <MigasLink
              model="devices/devices"
              :pk="device.id"
              :value="device.name"
              icon="mdi-printer"
            />
          </q-item>
        </q-list>

        <q-list v-if="element.inflicted_logical_devices">
          <q-item-label header
            ><translate>Inflicted Devices</translate></q-item-label
          >
          <q-item
            v-for="device in element.inflicted_logical_devices"
            :key="device.id"
          >
            <MigasLink
              model="devices/devices"
              :pk="device.id"
              :value="device.name"
              icon="mdi-printer"
            />
          </q-item>
        </q-list>
      </template>
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
