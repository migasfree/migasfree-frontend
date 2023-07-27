<template>
  <transition name="info">
    <div v-if="element && !isLoading">
      <p>
        <translate>Computer</translate>: <strong>{{ element.__str__ }}</strong>
      </p>

      <p>
        <translate>Status</translate>:
        <q-icon :name="elementIcon(element.status)" size="sm" />
        <strong>{{ computerStatus(element.status) }}</strong>
      </p>

      <q-list v-if="'tags' in element && element.tags.length > 0">
        <q-item-label header><translate>Tags</translate></q-item-label>
        <q-item v-for="tag in element.tags" :key="tag.id">
          <MigasLink model="tags" :pk="tag.id" :value="attributeValue(tag)" />
        </q-item>
      </q-list>

      <template v-if="'devices' in element">
        <p v-if="element.devices.default_logical_device">
          <translate>Default Device</translate>:
          <strong>{{ defaultDevice(element.devices) }}</strong>
        </p>

        <q-list
          v-if="element.devices.assigned_logical_devices_to_cid.length > 0"
        >
          <q-item-label header><translate>Devices</translate></q-item-label>
          <q-item
            v-for="device in element.devices.assigned_logical_devices_to_cid"
            :key="device.id"
          >
            <MigasLink
              model="devices/devices"
              :pk="device.id"
              :value="device.__str__"
            />
          </q-item>
        </q-list>

        <q-list v-if="element.devices.inflicted_logical_devices.length > 0">
          <q-item-label header
            ><translate>Inflicted Devices</translate></q-item-label
          >
          <q-item
            v-for="device in element.devices.inflicted_logical_devices"
            :key="device.id"
          >
            <MigasLink
              model="devices/devices"
              :pk="device.id"
              :value="device.__str__"
            />
          </q-item>
        </q-list>
      </template>
    </div>
    <div v-else-if="isLoading">
      <q-spinner-dots color="primary" size="3em" />
    </div>
  </transition>
</template>

<script>
import MigasLink from 'components/MigasLink'

import { useElement } from 'composables/element'

export default {
  name: 'ReplacementInfo',
  components: {
    MigasLink,
  },
  props: {
    element: {
      type: Object,
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const { attributeValue, computerStatus, elementIcon } = useElement()

    const defaultDevice = (devices) => {
      const defaultLogicalDeviceId = devices.default_logical_device
      const assignedDevice = devices.assigned_logical_devices_to_cid.find(
        (device) => device.id === defaultLogicalDeviceId,
      )
      if (assignedDevice) return assignedDevice.__str__

      const inflictedDevice = devices.inflicted_logical_devices.find(
        (device) => device.id === defaultLogicalDeviceId,
      )
      if (inflictedDevice) return inflictedDevice.__str__

      return null
    }

    return { attributeValue, computerStatus, elementIcon, defaultDevice }
  },
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
