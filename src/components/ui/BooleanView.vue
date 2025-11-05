<template>
  <q-icon :name="iconName" :color="iconColor" size="md">
    <q-tooltip>{{ tooltipText }}</q-tooltip>
  </q-icon>
</template>

<script>
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'

import { appIcon } from 'composables/element'

export default {
  name: 'BooleanView',
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const { $gettext } = useGettext()

    const iconName = computed(() => appIcon(props.value ? 'yes' : 'no'))
    const iconColor = computed(() => (props.value ? 'positive' : 'negative'))
    const tooltipText = computed(() => $gettext(props.value ? 'Yes' : 'No'))

    return { iconName, iconColor, tooltipText }
  },
}
</script>
