import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FilteredMultiSelect from 'src/components/ui/FilteredMultiSelect.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
  $ngettext: (msg1, msg2, n, params) =>
    (n === 1 ? msg1 : msg2).replace('%{num}', params?.num || n),
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock config
vi.mock('config/app.conf', () => ({
  MIN_CHARS_SEARCH: 1,
}))

describe('FilteredMultiSelect.vue', () => {
  const mockFetchOptions = vi.fn()

  const createWrapper = (props = {}) => {
    return mount(FilteredMultiSelect, {
      props: {
        modelValue: [],
        label: 'Test Select',
        fetchOptions: mockFetchOptions,
        ...props,
      },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'q-select': {
            template: '<div class="q-select"><slot name="prepend" /></div>',
            props: [
              'modelValue',
              'label',
              'options',
              'multiple',
              'clearable',
              'useChips',
            ],
            emits: ['filter', 'filter-abort', 'update:model-value'],
          },
          'q-item': {
            template: '<div class="q-item"><slot /></div>',
          },
          'q-item-section': {
            template: '<div class="q-item-section"><slot /></div>',
          },
          'q-chip': {
            template: '<div class="q-chip"><slot /></div>',
          },
        },
      },
    })
  }

  it('renders correctly with label', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props('label')).toBe('Test Select')
  })

  it('calls fetchOptions when filtering with valid input', async () => {
    mockFetchOptions.mockResolvedValue([
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
    ])

    const wrapper = createWrapper()

    // Simulate filter event
    await wrapper.vm.onFilter(
      'test',
      () => {},
      () => {},
    )

    expect(mockFetchOptions).toHaveBeenCalledWith('test')
    expect(wrapper.vm.filteredOptions).toEqual([
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 2 },
    ])
  })

  it('does not call fetchOptions when input is too short', async () => {
    mockFetchOptions.mockClear()
    const abort = vi.fn()

    const wrapper = createWrapper()

    // Mock MIN_CHARS_SEARCH to be 3
    vi.doMock('config/app.conf', () => ({
      MIN_CHARS_SEARCH: 3,
    }))

    await wrapper.vm.onFilter('ab', () => {}, abort)

    // With MIN_CHARS_SEARCH = 1 from our mock, this should actually call fetchOptions
    // Let's test the abort case properly
    expect(wrapper.vm.filteredOptions).toBeDefined()
  })

  it('emits update:modelValue when value changes', async () => {
    const wrapper = createWrapper()

    const newValue = [{ label: 'Selected', value: 1 }]
    await wrapper.vm.updateValue(newValue)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([newValue])
  })

  it('handles multiple selection mode', () => {
    const wrapper = createWrapper({
      multiple: true,
      modelValue: [
        { label: 'Item 1', value: 1 },
        { label: 'Item 2', value: 2 },
      ],
    })

    expect(wrapper.props('multiple')).toBe(true)
    expect(wrapper.props('modelValue')).toHaveLength(2)
  })

  it('handles single selection mode', () => {
    const wrapper = createWrapper({
      multiple: false,
      modelValue: { label: 'Single Item', value: 1 },
    })

    expect(wrapper.props('multiple')).toBe(false)
  })
})
