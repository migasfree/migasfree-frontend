import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CopyToClipboard from 'src/components/ui/CopyToClipboard.vue'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock composables
const mockContentToClipboard = vi.fn()

vi.mock('composables/element', () => ({
  appIcon: (name) => `mdi-${name}`,
}))

vi.mock('composables/copyPaste', () => ({
  default: () => ({
    contentToClipboard: mockContentToClipboard,
  }),
}))

describe('CopyToClipboard.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(CopyToClipboard, {
      props: {
        content: 'test content',
        ...props,
      },
      global: {
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'q-btn': {
            template:
              '<button class="q-btn" @click="$emit(\'click\', $event)"><slot /></button>',
            props: ['flat', 'icon', 'size', 'color', 'ariaLabel'],
          },
          'q-tooltip': true,
        },
      },
    })
  }

  beforeEach(() => {
    mockContentToClipboard.mockClear()
  })

  it('renders correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.q-btn').exists()).toBe(true)
  })

  it('calls contentToClipboard on click', async () => {
    const content = 'text to copy'
    const wrapper = createWrapper({ content })
    await wrapper.find('.q-btn').trigger('click')
    expect(mockContentToClipboard).toHaveBeenCalledWith(content)
  })

  it('uses flat prop correctly', () => {
    const wrapper = createWrapper({ flat: false })
    expect(wrapper.exists()).toBe(true)
  })

  it('uses size prop correctly', () => {
    const wrapper = createWrapper({ size: 'lg' })
    expect(wrapper.exists()).toBe(true)
  })
})
