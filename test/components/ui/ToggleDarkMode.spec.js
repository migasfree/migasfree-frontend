import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ToggleDarkMode from 'src/components/ui/ToggleDarkMode.vue'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock Quasar
const mockDark = {
  isActive: false,
  toggle: vi.fn(),
}

const mockCookies = {
  set: vi.fn(),
}

vi.mock('quasar', () => ({
  useQuasar: () => ({
    dark: mockDark,
    cookies: mockCookies,
  }),
}))

describe('ToggleDarkMode.vue', () => {
  const createWrapper = () => {
    return mount(ToggleDarkMode, {
      global: {
        mocks: {
          $q: {
            dark: mockDark,
          },
          ...mockGettext,
        },
        stubs: {
          'q-btn': {
            template:
              '<button class="q-btn" @click="$emit(\'click\')"><slot /></button>',
            props: ['flat', 'round', 'icon'],
          },
          'q-tooltip': {
            template: '<span class="q-tooltip"><slot /></span>',
          },
        },
      },
    })
  }

  beforeEach(() => {
    mockDark.isActive = false
    mockDark.toggle.mockClear()
    mockCookies.set.mockClear()
  })

  it('renders correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.q-btn').exists()).toBe(true)
  })

  it('toggles dark mode on click', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.q-btn').trigger('click')
    expect(mockDark.toggle).toHaveBeenCalled()
  })

  it('saves preference to cookie on toggle', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.q-btn').trigger('click')
    expect(mockCookies.set).toHaveBeenCalledWith(
      'darkMode',
      mockDark.isActive,
      { expires: '30d' },
    )
  })

  it('shows correct tooltip text for light mode', () => {
    mockDark.isActive = false
    const wrapper = createWrapper()
    expect(wrapper.find('.q-tooltip').text()).toContain('Switch to Dark mode')
  })

  it('shows correct tooltip text for dark mode', () => {
    mockDark.isActive = true
    const wrapper = createWrapper()
    expect(wrapper.find('.q-tooltip').text()).toContain('Switch to Light mode')
  })
})
