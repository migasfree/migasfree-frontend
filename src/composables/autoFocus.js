import { ref, onMounted, nextTick } from 'vue'

/**
 * Composable for accessible autofocus behavior.
 *
 * Instead of using the `autofocus` HTML attribute (which has accessibility issues),
 * this composable provides programmatic focus that:
 * - Only focuses on initial mount (not on every re-render)
 * - Respects user preferences
 * - Works correctly in SPAs with route changes
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.immediate=true] - Focus immediately on mount
 * @param {number} [options.delay=100] - Delay in ms before focusing
 * @returns {Object} - { inputRef, focus }
 *
 * @example
 * // In your component setup:
 * const { inputRef, focus } = useAutoFocus()
 *
 * // In your template:
 * <q-input ref="inputRef" v-model="value" />
 */
export default function useAutoFocus(options = {}) {
  const { immediate = true, delay = 100 } = options

  const inputRef = ref(null)

  const focus = () => {
    nextTick(() => {
      setTimeout(() => {
        if (inputRef.value) {
          // Quasar q-input exposes focus() method
          if (typeof inputRef.value.focus === 'function') {
            inputRef.value.focus()
          }
          // For native inputs
          else if (inputRef.value.$el) {
            const input = inputRef.value.$el.querySelector('input, textarea')
            if (input) input.focus()
          }
        }
      }, delay)
    })
  }

  onMounted(() => {
    if (immediate) {
      focus()
    }
  })

  return {
    inputRef,
    focus,
  }
}
