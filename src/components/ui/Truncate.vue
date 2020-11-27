<template>
  <div>
    <template v-if="value.length <= len">
      <pre>{{ value }}</pre>
    </template>
    <q-list v-else bordered>
      <q-expansion-item>
        <template v-slot:header>
          <pre class="overflow">{{ truncatedValue }} …</pre>
        </template>
        <pre>{{ value }}</pre>
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
    }
  },
  computed: {
    truncatedValue() {
      return clip(this.value, this.len, {
        html: true,
        maxLines: 3
      })
    }
  }
}
</script>
