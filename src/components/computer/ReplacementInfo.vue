<template>
  <div v-if="element">
    <p>Computer: {{ element.__str__ }}</p>
    <p>
      Status: <q-icon :name="elementIcon(element.status)" />
      {{ element.status }}
    </p>
    <p v-if="element.tags.length > 0">
      Tags:
      <MigasLink
        v-for="tag in element.tags"
        :key="tag.id"
        model="tags"
        :pk="tag.id"
        :value="attributeValue(tag)"
        icon="mdi-tag"
      />
    </p>
    <template v-if="element.devices">
      <p v-if="element.default_logical_device">
        Default device: {{ element.default_logical_device }}
      </p>
      <p v-if="element.assigned_logical_devices_to_cid">
        Devices:
        <MigasLink
          v-for="device in element.assigned_logical_devices_to_cid"
          :key="device.id"
          model="devices/devices"
          :pk="device.id"
          :value="device.name"
          icon="mdi-printer"
        />
      </p>
      <p v-if="element.inflicted_logical_devices">
        Inflicted Devices:
        <MigasLink
          v-for="device in element.inflicted_logical_devices"
          :key="device.id"
          model="devices/devices"
          :pk="device.id"
          :value="device.name"
          icon="mdi-printer"
        />
      </p>
    </template>
  </div>
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
    }
  }
}
</script>
