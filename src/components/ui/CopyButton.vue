<template>
  <q-btn
    flat
    icon="mdi-content-copy"
    size="sm"
    color="primary"
    :aria-label="$gettext('Copy')"
    @click.stop="contentToClipboard(content)"
    ><q-tooltip>{{ $gettext('Copy') }}</q-tooltip></q-btn
  >
</template>

<script>
import useCopyPaste from 'composables/copyPaste'

export default {
  name: 'CopyButton',
  props: {
    content: {
      type: String,
      required: true,
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
