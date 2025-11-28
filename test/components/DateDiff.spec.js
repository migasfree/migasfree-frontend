import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DateDiff from 'src/components/DateDiff.vue'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
  $ngettext: (msg1, msg2, n) => (n === 1 ? msg1 : msg2),
  interpolate: (msg, values) => {
    let res = msg
    for (const key in values) {
      res = res.replace(`%{${key}}`, values[key])
    }
    return res
  },
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

describe('DateDiff.vue', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(DateDiff, {
      global: {
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'q-chip': {
            template: '<div class="q-chip"><slot /></div>',
          },
          'q-tooltip': true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('calculates diff correctly', () => {
    const now = new Date()
    const past = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2) // 2 days ago

    const wrapper = mount(DateDiff, {
      props: {
        begin: past,
        end: now,
      },
      global: {
        mocks: {
          ...mockGettext,
        },
        stubs: {
          'q-chip': {
            template: '<div class="q-chip"><slot /></div>',
          },
          'q-tooltip': true,
        },
      },
    })

    expect(wrapper.text()).toContain('2 days')
  })
})
