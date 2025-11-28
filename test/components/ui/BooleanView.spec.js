import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BooleanView from 'src/components/ui/BooleanView.vue'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock composables/element
vi.mock('composables/element', () => ({
  appIcon: (name) => `icon-${name}`,
}))

describe('BooleanView.vue', () => {
  it('renders correctly when value is true', () => {
    const wrapper = mount(BooleanView, {
      props: {
        value: true,
      },
      global: {
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'q-icon': {
            template: '<div class="q-icon" :class="color"><slot /></div>',
            props: ['name', 'color'],
          },
          'q-tooltip': {
            template: '<span><slot /></span>',
          },
        },
      },
    })

    const icon = wrapper.find('.q-icon')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('positive')
    expect(wrapper.vm.iconName).toBe('icon-yes')
    expect(wrapper.text()).toContain('Yes')
  })

  it('renders correctly when value is false', () => {
    const wrapper = mount(BooleanView, {
      props: {
        value: false,
      },
      global: {
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'q-icon': {
            template: '<div class="q-icon" :class="color"><slot /></div>',
            props: ['name', 'color'],
          },
          'q-tooltip': {
            template: '<span><slot /></span>',
          },
        },
      },
    })

    const icon = wrapper.find('.q-icon')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('negative')
    expect(wrapper.vm.iconName).toBe('icon-no')
    expect(wrapper.text()).toContain('No')
  })
})
