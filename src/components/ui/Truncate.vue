<template>
  <template v-if="!modelValue">
    <div v-if="formatted"></div>
    <div v-else></div>
  </template>
  <template v-else-if="modelValue.length <= len">
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
import DOMPurify from 'dompurify'

export default {
  name: 'Truncate',
  props: {
    modelValue: {
      type: [String, null],
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
    const safeModelValue = computed(() => {
      // Ensure we always have a string
      return props.modelValue !== null && props.modelValue !== undefined
        ? String(props.modelValue)
        : ''
    })

    const truncatedValue = computed(() => {
      if (!safeModelValue.value) return ''

      const clipped = clip(safeModelValue.value, props.len, {
        html: true,
        maxLines: 3,
      })
      // Sanitize the clipped value as well, just in case
      return DOMPurify.sanitize(clipped)
    })

    const localValue = computed(() => {
      if (!safeModelValue.value) return ''

      let content = safeModelValue.value
      if (!props.formatted) {
        content = content.replaceAll('\n', '<br />')
      }
      return DOMPurify.sanitize(content)
    })

    return { truncatedValue, localValue }
  },
}
</script>
