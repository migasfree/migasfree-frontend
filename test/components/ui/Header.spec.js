import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Header from 'src/components/ui/Header.vue'

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
}))

// Mock Quasar
const mockDialog = vi.fn(() => ({
  onOk: vi.fn((cb) => {
    cb()
    return { onCancel: vi.fn() }
  }),
}))

vi.mock('quasar', () => ({
  useQuasar: () => ({
    dialog: mockDialog,
  }),
}))

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('Header.vue', () => {
  const createWrapper = (props = {}, slots = {}) => {
    return mount(Header, {
      props: {
        title: 'Test Title',
        ...props,
      },
      slots,
      global: {
        mocks: {
          $router: { push: mockPush },
          ...mockGettext,
        },
        stubs: {
          'q-toolbar': {
            template: '<div class="q-toolbar"><slot /></div>',
          },
          'q-toolbar-title': {
            template: '<div class="q-toolbar-title"><slot /></div>',
          },
          'q-icon': {
            template: '<i class="q-icon" :data-name="name"></i>',
            props: ['name', 'size'],
          },
          'q-chip': {
            template: '<span class="q-chip"><slot /></span>',
            props: ['size', 'color', 'textColor'],
          },
          'q-btn': {
            template:
              '<button class="q-btn" :data-icon="icon" @click="$emit(\'click\')"><slot /></button>',
            props: [
              'icon',
              'color',
              'textColor',
              'ariaLabel',
              'loading',
              'disable',
            ],
          },
          'q-tooltip': true,
        },
      },
    })
  }

  beforeEach(() => {
    mockPush.mockClear()
    mockDialog.mockClear()
  })

  it('renders correctly with title', () => {
    const wrapper = createWrapper({ title: 'My Header' })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('My Header')
  })

  it('renders icon when provided', () => {
    const wrapper = createWrapper({ title: 'Test', icon: 'mdi-home' })
    expect(wrapper.find('.q-icon').exists()).toBe(true)
  })

  it('does not render icon when not provided', () => {
    const wrapper = createWrapper({ title: 'Test', icon: null })
    expect(wrapper.find('.q-icon').exists()).toBe(false)
  })

  it('shows results chip when results > 0', () => {
    const wrapper = createWrapper({ title: 'Test', results: 42 })
    expect(wrapper.find('.q-chip').exists()).toBe(true)
    expect(wrapper.find('.q-chip').text()).toContain('42')
  })

  it('does not show results chip when results is 0', () => {
    const wrapper = createWrapper({ title: 'Test', results: 0 })
    expect(wrapper.find('.q-chip').exists()).toBe(false)
  })

  it('does not show results chip when results is null', () => {
    const wrapper = createWrapper({ title: 'Test', results: null })
    expect(wrapper.find('.q-chip').exists()).toBe(false)
  })

  it('shows add button when addRoute is provided', () => {
    const wrapper = createWrapper({ title: 'Test', addRoute: 'create-item' })
    const buttons = wrapper.findAll('.q-btn')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('shows export button when hasExportButton and results > 0', () => {
    const wrapper = createWrapper({
      title: 'Test',
      hasExportButton: true,
      results: 10,
    })
    const buttons = wrapper.findAll('.q-btn')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('does not show export button when results is 0', () => {
    const wrapper = createWrapper({
      title: 'Test',
      hasExportButton: true,
      results: 0,
    })
    // Export button should not be visible
    expect(wrapper.exists()).toBe(true)
  })

  it('emits exportAll on export button click when results <= 1000', async () => {
    const wrapper = createWrapper({
      title: 'Test',
      hasExportButton: true,
      results: 100,
    })
    // Trigger export action
    wrapper.vm.exportAction()
    expect(wrapper.emitted('exportAll')).toBeTruthy()
  })

  it('shows confirmation dialog when results > 1000', async () => {
    const wrapper = createWrapper({
      title: 'Test',
      hasExportButton: true,
      results: 2000,
    })
    wrapper.vm.exportAction()
    expect(mockDialog).toHaveBeenCalled()
  })

  it('renders append slot content', () => {
    const wrapper = createWrapper(
      { title: 'Test' },
      { append: '<span class="custom-slot">Appended</span>' },
    )
    expect(wrapper.html()).toContain('custom-slot')
  })

  it('renders actions slot content', () => {
    const wrapper = createWrapper(
      { title: 'Test' },
      { actions: '<button class="custom-action">Action</button>' },
    )
    expect(wrapper.html()).toContain('custom-action')
  })
})
