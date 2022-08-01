<template>
  <template v-if="modelValue.length <= len">
    <pre v-if="formatted">{{ localValue }}</pre>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else v-html="localValue"></div>
  </template>
  <q-list v-else bordered>
    <q-expansion-item>
      <template #header>
        <pre v-if="formatted" class="overflow">{{ truncatedValue }} …</pre>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else class="overflow" v-html="truncatedValue"></div>
      </template>
      <pre v-if="formatted">{{ localValue }}</pre>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else v-html="localValue"></div>
    </q-expansion-item>
  </q-list>
</template>

<script>
import { computed } from 'vue'
import clip from 'text-clipper'

export default {
  name: 'Truncate',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    len: {
      type: Number,
      required: false,
      default: 250,
    },
    formatted: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup(props) {
    const truncatedValue = computed(() => {
      return clip(props.modelValue, props.len, {
        html: true,
        maxLines: 3,
      })
    })

    const localValue = computed(() => {
      if (props.formatted) return props.modelValue
      else return props.modelValue.replaceAll('\n', '<br />')
    })

    return { truncatedValue, localValue }
  },
}
</script>
