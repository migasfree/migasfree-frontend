<template>
  <template v-if="!modelValue">
    <div></div>
  </template>

  <template v-else-if="modelValue.length <= len">
    <pre v-if="formatted" class="pre-wrap">{{ localValue }}</pre>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else v-html="localValue"></div>
  </template>

  <q-list v-else bordered class="truncate-list">
    <q-expansion-item
      header-class="truncate-header"
      expand-icon-class="truncate-icon"
    >
      <template #header>
        <div class="truncate-preview-container full-width">
          <pre v-if="formatted" class="truncate-preview pre-wrap">{{
            localValue
          }}</pre>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-else class="truncate-preview" v-html="localValue"></div>
          <div class="truncate-ellipsis text-primary text-weight-bold">…</div>
        </div>
      </template>

      <q-card>
        <q-card-section>
          <pre v-if="formatted" class="pre-wrap">{{ localValue }}</pre>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-else v-html="localValue"></div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script setup>
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps({
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
})

const safeModelValue = computed(() => {
  return props.modelValue !== null && props.modelValue !== undefined
    ? String(props.modelValue)
    : ''
})

const localValue = computed(() => {
  if (!safeModelValue.value) return ''

  let content = safeModelValue.value
  if (!props.formatted) {
    content = content.replaceAll('\n', '<br />')
  }
  return DOMPurify.sanitize(content)
})
</script>

<style scoped>
.pre-wrap {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  font-family: inherit;
}

.truncate-list {
  border-radius: 8px;
  overflow: hidden;
  background: rgba(var(--brand-primary-rgb), 0.03);
}

.truncate-preview-container {
  position: relative;
  padding-right: 20px;
}

.truncate-preview {
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.truncate-ellipsis {
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.9) 50%
  );
  padding-left: 10px;
}

[data-theme='dark'] .truncate-ellipsis {
  background: linear-gradient(to right, transparent, rgba(30, 30, 30, 0.9) 50%);
}

.truncate-header {
  min-height: 48px;
  align-items: flex-start;
}

:deep(.truncate-icon) {
  align-self: flex-start;
  margin-top: 8px;
}
</style>
