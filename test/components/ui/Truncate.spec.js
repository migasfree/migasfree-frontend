import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Truncate from 'src/components/ui/Truncate.vue'

// Mock text-clipper
vi.mock('text-clipper', () => ({
  // eslint-disable-next-line no-unused-vars
  default: (text, len, options) => {
    if (text.length <= len) return text
    return text.substring(0, len)
  },
}))

describe('Truncate.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(Truncate, {
      props: {
        modelValue: '',
        ...props,
      },
      global: {
        stubs: {
          'q-list': {
            template: '<div class="q-list"><slot /></div>',
          },
          'q-expansion-item': {
            template:
              '<div class="q-expansion-item"><slot name="header" /><slot /></div>',
          },
        },
      },
    })
  }

  it('renders short text without truncation', () => {
    const shortText = 'Short text'
    const wrapper = createWrapper({ modelValue: shortText, len: 250 })
    expect(wrapper.text()).toContain(shortText)
    expect(wrapper.find('.q-expansion-item').exists()).toBe(false)
  })

  it('renders long text with expansion', () => {
    const longText = 'A'.repeat(300)
    const wrapper = createWrapper({ modelValue: longText, len: 250 })
    expect(wrapper.find('.q-expansion-item').exists()).toBe(true)
  })

  it('uses pre tag when formatted is true', () => {
    const text = 'Formatted text'
    const wrapper = createWrapper({ modelValue: text, formatted: true })
    expect(wrapper.find('pre').exists()).toBe(true)
  })

  it('uses div when formatted is false', () => {
    const text = 'Plain text'
    const wrapper = createWrapper({ modelValue: text, formatted: false })
    expect(wrapper.find('pre').exists()).toBe(false)
    expect(wrapper.find('div').exists()).toBe(true)
  })

  it('replaces newlines with br when formatted is false', () => {
    const textWithNewlines = 'Line1\nLine2\nLine3'
    const wrapper = createWrapper({
      modelValue: textWithNewlines,
      formatted: false,
    })
    expect(wrapper.vm.localValue).toContain('<br />')
  })

  it('keeps newlines when formatted is true', () => {
    const textWithNewlines = 'Line1\nLine2\nLine3'
    const wrapper = createWrapper({
      modelValue: textWithNewlines,
      formatted: true,
    })
    expect(wrapper.vm.localValue).toBe(textWithNewlines)
  })

  it('respects custom len prop', () => {
    const text = 'A'.repeat(100)
    const wrapper = createWrapper({ modelValue: text, len: 50 })
    expect(wrapper.find('.q-expansion-item').exists()).toBe(true)
  })
})
