import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Breadcrumbs from 'src/components/ui/Breadcrumbs.vue'

describe('Breadcrumbs.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(Breadcrumbs, {
      props: {
        items: [],
        ...props,
      },
      global: {
        stubs: {
          'q-breadcrumbs': {
            template: '<nav class="q-breadcrumbs"><slot /></nav>',
          },
          'q-breadcrumbs-el': {
            template:
              '<span class="q-breadcrumbs-el" :data-to="to"><slot /></span>',
            props: ['icon', 'to', 'label'],
          },
        },
      },
    })
  }

  it('renders correctly with empty items', () => {
    const wrapper = createWrapper({ items: [] })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findAll('.q-breadcrumbs-el')).toHaveLength(0)
  })

  it('renders correctly with items', () => {
    const items = [
      { text: 'Home', to: 'home', icon: 'home' },
      { text: 'Products', to: 'products-list', icon: 'list' },
      { text: 'Detail', to: { name: 'product-detail', params: { id: 1 } } },
    ]
    const wrapper = createWrapper({ items })
    expect(wrapper.findAll('.q-breadcrumbs-el')).toHaveLength(3)
  })

  it('goTo returns route object for string input', () => {
    const wrapper = createWrapper({ items: [] })
    const result = wrapper.vm.goTo('home')
    expect(result).toEqual({ name: 'home' })
  })

  it('goTo returns the same object for object input', () => {
    const wrapper = createWrapper({ items: [] })
    const routeObj = { name: 'detail', params: { id: 1 } }
    const result = wrapper.vm.goTo(routeObj)
    expect(result).toEqual(routeObj)
  })

  it('goTo returns empty string for invalid input', () => {
    const wrapper = createWrapper({ items: [] })
    // null is typeof 'object' in JS, so it gets returned as-is
    expect(wrapper.vm.goTo(null)).toBe(null)
    // undefined is not string or object, returns empty string
    expect(wrapper.vm.goTo(undefined)).toBe('')
    // Numbers are also invalid, returns empty string
    expect(wrapper.vm.goTo(123)).toBe('')
  })
})
