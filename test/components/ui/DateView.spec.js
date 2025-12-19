import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DateView from 'src/components/ui/DateView.vue'

// Mock composables/date
const mockShowDate = vi.fn((date) => `Formatted: ${date}`)
// eslint-disable-next-line no-unused-vars
const mockDiffForHumans = vi.fn((date) => '2 days ago')

vi.mock('composables/date', () => ({
  default: () => ({
    showDate: mockShowDate,
    diffForHumans: mockDiffForHumans,
  }),
}))

describe('DateView.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(DateView, {
      props: {
        value: null,
        ...props,
      },
      global: {
        stubs: {
          'q-icon': {
            template: '<i class="q-icon" :data-name="name"></i>',
            props: ['name', 'size'],
          },
          'q-tooltip': {
            template: '<span class="q-tooltip"><slot /></span>',
          },
        },
      },
    })
  }

  beforeEach(() => {
    mockShowDate.mockClear()
    mockDiffForHumans.mockClear()
  })

  it('renders correctly with no value', () => {
    const wrapper = createWrapper({ value: null })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('span').exists()).toBe(false)
  })

  it('renders date when value is provided', () => {
    const dateValue = '2024-01-15T10:30:00Z'
    const wrapper = createWrapper({ value: dateValue })
    expect(wrapper.find('span').exists()).toBe(true)
    expect(mockShowDate).toHaveBeenCalledWith(dateValue)
  })

  it('shows icon when icon prop is provided', () => {
    const wrapper = createWrapper({ value: '2024-01-15', icon: 'event' })
    expect(wrapper.find('.q-icon').exists()).toBe(true)
  })

  it('does not show icon when icon prop is empty', () => {
    const wrapper = createWrapper({ value: '2024-01-15', icon: '' })
    expect(wrapper.find('.q-icon').exists()).toBe(false)
  })

  it('shows tooltip with diffForHumans', () => {
    const dateValue = '2024-01-15'
    const wrapper = createWrapper({ value: dateValue })
    expect(wrapper.find('.q-tooltip').exists()).toBe(true)
    expect(mockDiffForHumans).toHaveBeenCalledWith(dateValue)
  })

  it('shows tooltipText in tooltip when provided', () => {
    const wrapper = createWrapper({
      value: '2024-01-15',
      tooltipText: 'Created at',
    })
    expect(wrapper.find('.q-tooltip').text()).toContain('Created at')
  })

  it('only shows diffForHumans when tooltipText is not provided', () => {
    const wrapper = createWrapper({ value: '2024-01-15' })
    const tooltip = wrapper.find('.q-tooltip')
    expect(tooltip.text()).toContain('2 days ago')
  })
})
