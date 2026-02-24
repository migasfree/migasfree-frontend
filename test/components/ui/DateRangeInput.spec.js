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
  const defaultProps = {
    modelValue: { from: '2023-01-01', to: '2023-01-31' },
    label: 'Date Range',
  }

  const createWrapper = (props = {}, options = {}) => {
    return mount(DateRangeInput, {
      props: { ...defaultProps, ...props },
      global: {
        mocks: {
          $gettext: (msg) => msg,
        },
        directives: {
          'close-popup': {},
        },
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
            template:
              "<div class=\"q-date\" @click=\"$emit('update:model-value', { from: '2023-02-01', to: '2023-02-10' })\"></div>",
            props: ['modelValue'],
            emits: ['update:model-value'],
          },
          'q-tooltip': true,
          'q-btn': true,
          ...options.stubs,
        },
      },
    })
  }

  it('renders correctly with initial value', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('input').element.value).toBe('2023-01-01 ~ 2023-01-31')
  })

  it('emits select event when date is selected', async () => {
    const wrapper = createWrapper({ modelValue: { from: null, to: null } })
    await wrapper.find('.q-date').trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual([
      { from: '2023-02-01', to: '2023-02-10' },
    ])
  })

  it('resets the date when close icon is clicked', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.reset(new Event('click'))
    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual([{ from: null, to: null }])
  })
})
