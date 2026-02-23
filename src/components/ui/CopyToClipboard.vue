<template>
  <MicroInteractionButton
    :icon="appIcon('copy')"
    :success-icon="appIcon('yes')"
    :tooltip="showTooltip ? $gettext('Copy') : ''"
    :success-tooltip="showTooltip ? $gettext('Copied!') : ''"
    :action="copy"
    :flat="flat"
    :size="size"
  />
</template>

<script setup>
import { appIcon } from 'composables/element'
import useCopyPaste from 'composables/copyPaste'
import MicroInteractionButton from 'components/ui/MicroInteractionButton.vue'

defineOptions({ name: 'CopyToClipboard' })

const props = defineProps({
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
  showTooltip: {
    type: Boolean,
    default: true,
  },
})

const { contentToClipboard } = useCopyPaste()

const copy = async () => {
  await contentToClipboard(props.content)
}
</script>
