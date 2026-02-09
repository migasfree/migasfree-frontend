<template>
  <q-btn
    :flat="flat"
    :icon="currentIcon"
    :size="size"
    :color="currentColor"
    :aria-label="$gettext('Copy')"
    @click.stop="copy"
    ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
  >
</template>

<script>
import { ref, computed } from 'vue'
import { appIcon } from 'composables/element'
import useCopyPaste from 'composables/copyPaste'

export default {
  name: 'CopyToClipboard',
  props: {
    content: {
      type: String,
      required: true,
    },
    flat: {
      type: Boolean,
      required: false,
      default: true,
    },
    size: {
      type: String,
      required: false,
      default: 'sm',
    },
  },
  setup(props) {
    const { contentToClipboard } = useCopyPaste()
    const copied = ref(false)

    const currentIcon = computed(() =>
      copied.value ? appIcon('yes') : appIcon('copy'),
    )
    const currentColor = computed(() => (copied.value ? 'positive' : 'primary'))

    const copy = async () => {
      await contentToClipboard(props.content)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }

    return {
      currentIcon,
      currentColor,
      copy,
    }
  },
}
</script>
