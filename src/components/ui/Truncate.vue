<template>
  <div>
    <template v-if="value.length <= len">
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
  </div>
</template>

<script>
import clip from 'text-clipper'

export default {
  name: 'Truncate',
  props: {
    value: {
      type: String,
      required: true
    },
    len: {
      type: Number,
      required: false,
      default: 250
    },
    formatted: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  computed: {
    truncatedValue() {
      return clip(this.value, this.len, {
        html: true,
        maxLines: 3
      })
    },

    localValue() {
      if (this.formatted) return this.value
      else return this.value.replaceAll('\n', '<br />')
    }
  }
}
</script>
