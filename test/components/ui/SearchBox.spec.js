import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBox from 'src/components/ui/SearchBox.vue'

// Mock vue3-gettext
const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

// Mock composables
vi.mock('composables/element', () => ({
  appIcon: (name) => `mdi-${name}`,
  modelIcon: (name) => `mdi-${name}`,
}))

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('SearchBox.vue', () => {
  const createWrapper = () => {
    return mount(SearchBox, {
      global: {
        mocks: {
          $q: { dark: { isActive: false } },
          ...mockGettext,
        },
        stubs: {
          'q-btn-group': {
            template: '<div class="q-btn-group"><slot /></div>',
          },
          'q-input': {
            template:
              '<input class="q-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keydown="$emit(\'keydown\', $event)" />',
            props: [
              'modelValue',
              'label',
              'dense',
              'borderless',
              'clearable',
              'bgColor',
            ],
          },
          'q-btn-dropdown': {
            template:
              '<div class="q-btn-dropdown"><slot name="label" /><slot /></div>',
          },
          'q-list': {
            template: '<div class="q-list"><slot /></div>',
          },
          'q-item': {
            template:
              '<div class="q-item" @click="$emit(\'click\')"><slot /></div>',
          },
          'q-item-section': {
            template: '<span class="q-item-section"><slot /></span>',
          },
          'q-icon': {
            template: '<i class="q-icon"></i>',
            props: ['name', 'size'],
          },
          'q-separator': true,
        },
      },
    })
  }

  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.q-input').exists()).toBe(true)
  })

  it('has search options available', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.options).toBeDefined()
    expect(wrapper.vm.options.length).toBeGreaterThan(0)
  })

  it('includes Computers option', () => {
    const wrapper = createWrapper()
    const computersOption = wrapper.vm.options.find(
      (o) => o.route === 'computers-list',
    )
    expect(computersOption).toBeDefined()
    expect(computersOption.label).toBe('Computers')
  })

  it('includes Attributes option', () => {
    const wrapper = createWrapper()
    const option = wrapper.vm.options.find((o) => o.route === 'features-list')
    expect(option).toBeDefined()
    expect(option.label).toBe('Attributes')
  })

  it('includes Tags option', () => {
    const wrapper = createWrapper()
    const option = wrapper.vm.options.find((o) => o.route === 'tags-list')
    expect(option).toBeDefined()
  })

  it('includes Deployments option', () => {
    const wrapper = createWrapper()
    const option = wrapper.vm.options.find(
      (o) => o.route === 'deployments-list',
    )
    expect(option).toBeDefined()
  })

  it('includes Packages option', () => {
    const wrapper = createWrapper()
    const option = wrapper.vm.options.find((o) => o.route === 'packages-list')
    expect(option).toBeDefined()
  })

  it('includes Devices option', () => {
    const wrapper = createWrapper()
    const option = wrapper.vm.options.find((o) => o.route === 'devices-list')
    expect(option).toBeDefined()
  })

  it('search function navigates with query', () => {
    const wrapper = createWrapper()
    wrapper.vm.searchText = 'test query'
    wrapper.vm.selectedScope = { route: 'computers-list', icon: 'mdi-laptop' }
    wrapper.vm.search()
    expect(mockPush).toHaveBeenCalledWith({
      name: 'computers-list',
      query: { search: 'test query' },
    })
  })

  it('updates selected icon and route on search', () => {
    const wrapper = createWrapper()
    wrapper.vm.selectedScope = { route: 'packages-list', icon: 'mdi-package' }
    wrapper.vm.search()
    expect(wrapper.vm.selectedIcon).toBe('mdi-package')
    expect(wrapper.vm.selectedRoute).toBe('packages-list')
  })

  it('default selected route is computers-list', () => {
    const wrapper = createWrapper()
    expect(wrapper.vm.selectedRoute).toBe('computers-list')
  })
})
