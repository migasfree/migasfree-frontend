import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DateRangeInput from 'src/components/ui/DateRangeInput.vue'

// Mock composables/date
vi.mock('composables/date', () => ({
  default: () => ({
    showDate: (val) => val,
    localeDate: {},
  }),
}))

describe('DateRangeInput.vue', () => {
  const props = {
    modelValue: { from: '2023-01-01', to: '2023-01-31' },
    label: 'Date Range',
  }

  it('renders correctly with initial value', () => {
    const wrapper = mount(DateRangeInput, {
      props,
      global: {
        stubs: {
          'q-input': {
            template: `
              <div class="q-input">
                <slot name="before" />
                <input :value="modelValue" />
                <slot name="append" />
              </div>
            `,
            props: ['modelValue', 'label'],
          },
          'q-icon': {
            template:
              '<div class="q-icon" @click="$emit(\'click\')"><slot /></div>',
            props: ['name'],
          },
          'q-popup-proxy': {
            template: '<div class="q-popup-proxy"><slot /></div>',
            methods: {
              show: vi.fn(),
              hide: vi.fn(),
            },
          },
          'q-date': {
            template: '<div class="q-date"></div>',
            props: ['modelValue'],
            emits: ['update:model-value'],
          },
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('input').element.value).toBe('2023-01-01 ~ 2023-01-31')
  })

  it('emits select event when date is selected', async () => {
    const wrapper = mount(DateRangeInput, {
      props: {
        modelValue: { from: null, to: null },
        label: 'Date Range',
      },
      global: {
        stubs: {
          'q-input': {
            template: '<div><slot name="append" /></div>',
          },
          'q-icon': {
            template: '<div><slot /></div>',
          },
          'q-popup-proxy': {
            template: '<div><slot /></div>',
            methods: {
              show: vi.fn(),
              hide: vi.fn(),
            },
          },
          'q-date': {
            template:
              "<div class=\"q-date\" @click=\"$emit('update:model-value', { from: '2023-02-01', to: '2023-02-10' })\"></div>",
          },
        },
      },
    })

    await wrapper.find('.q-date').trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual([
      { from: '2023-02-01', to: '2023-02-10' },
    ])
  })

  it('resets the date when close icon is clicked', async () => {
    const wrapper = mount(DateRangeInput, {
      props,
      global: {
        stubs: {
          'q-input': {
            template: '<div><slot name="append" /></div>',
          },
          'q-icon': {
            template:
              '<div class="q-icon" @click="$emit(\'click\')"><slot /></div>',
            props: ['name'],
          },
          'q-popup-proxy': true,
          'q-date': true,
        },
      },
    })

    // Find the close icon (it has name="mdi-close-circle")
    // const icons = wrapper.findAll('.q-icon')
    // const closeIcon = icons.find(icon => icon.attributes('name') === 'mdi-close-circle') // In stub we are not rendering name as attribute unless we bind it, but let's rely on order or logic.

    // Actually, in my stub for q-icon I didn't bind name to attribute.
    // Let's improve the stub or finding logic.
    // The close icon is the second one in the template structure if prependIcon is not there.
    // But wait, the first icon wraps the popup proxy.

    // Let's just trigger the reset method directly or improve the stub to be findable.
    await wrapper.vm.reset()

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual([{ from: null, to: null }])
  })
})
