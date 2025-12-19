import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { axe } from 'vitest-axe'

// Mock vue3-gettext
vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    $gettext: (msg) => msg,
  }),
}))

// Import components to test
import Breadcrumbs from 'src/components/ui/Breadcrumbs.vue'
import BooleanView from 'src/components/ui/BooleanView.vue'

describe('Accessibility (a11y)', () => {
  describe('Breadcrumbs', () => {
    it('should have no critical a11y violations', async () => {
      const wrapper = mount(Breadcrumbs, {
        props: {
          items: [
            { text: 'Home', to: 'home', icon: 'home' },
            { text: 'Products', to: 'products' },
          ],
        },
        global: {
          stubs: {
            'q-breadcrumbs': {
              template:
                '<nav aria-label="Breadcrumb" class="q-breadcrumbs"><slot /></nav>',
            },
            'q-breadcrumbs-el': {
              template: '<a class="q-breadcrumbs-el" href="#"><slot /></a>',
              props: ['icon', 'to', 'label'],
            },
          },
        },
      })

      const results = await axe(wrapper.element)
      // Check for critical violations only
      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical',
      )
      expect(criticalViolations).toHaveLength(0)
    })
  })

  describe('BooleanView', () => {
    it('should have no critical a11y violations when true', async () => {
      const wrapper = mount(BooleanView, {
        props: { value: true },
        global: {
          stubs: {
            'q-icon': {
              template:
                '<span role="img" aria-label="Yes" class="q-icon"></span>',
              props: ['name', 'color', 'size'],
            },
            'q-tooltip': true,
          },
        },
      })

      const results = await axe(wrapper.element)
      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical',
      )
      expect(criticalViolations).toHaveLength(0)
    })

    it('should have no critical a11y violations when false', async () => {
      const wrapper = mount(BooleanView, {
        props: { value: false },
        global: {
          stubs: {
            'q-icon': {
              template:
                '<span role="img" aria-label="No" class="q-icon"></span>',
              props: ['name', 'color', 'size'],
            },
            'q-tooltip': true,
          },
        },
      })

      const results = await axe(wrapper.element)
      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical',
      )
      expect(criticalViolations).toHaveLength(0)
    })
  })
})
