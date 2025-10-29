<template>
  <q-btn
    :flat="flat"
    icon="mdi-content-copy"
    :size="size"
    color="primary"
    :aria-label="$gettext('Copy')"
    @click.stop="contentToClipboard(content)"
    ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
  >
</template>

<script>
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
  setup() {
    const { contentToClipboard } = useCopyPaste()

    return {
      contentToClipboard,
    }
  },
}
</script>
