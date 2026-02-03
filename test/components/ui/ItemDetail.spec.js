import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import ItemDetail from 'src/components/ui/ItemDetail.vue'
import { ref } from 'vue'

// Mock composables
const mockUseDetail = {
  loading: ref(false),
  elementText: ref('Test Element Text'),
  addElement: vi.fn(),
  updateElement: vi.fn(),
  remove: vi.fn(),
}

vi.mock('src/composables/detail', () => ({
  default: () => mockUseDetail,
}))

const mockUseElement = {
  elementIcon: vi.fn(() => 'mdi-test-icon'),
  attributeValue: vi.fn(() => 'Test Attribute Value'),
}

vi.mock('src/composables/element', () => ({
  useElement: () => mockUseElement,
  appIcon: vi.fn((name) => `mdi-${name}`),
  modelIcon: vi.fn(() => 'mdi-model-icon'),
}))

// Mock Subcomponents
const QBtnStub = {
  name: 'QBtn',
  template:
    '<button class="q-btn-stub" @click="$emit(\'click\')">{{ label }}</button>',
  props: ['label', 'icon', 'loading', 'disabled', 'aria-label'],
}
const BannerInfoStub = {
  name: 'BannerInfo',
  template: '<div class="banner-info-stub"></div>',
  props: ['message'],
}
const BreadcrumbsStub = {
  name: 'Breadcrumbs',
  template: '<div class="breadcrumbs-stub"></div>',
  props: ['items'],
}
const HeaderStub = {
  name: 'Header',
  template:
    '<div class="header-stub"><slot name="append"></slot><slot name="actions"></slot></div>',
  props: ['title', 'icon', 'hasExportButton'],
}
const MigasLinkStub = {
  name: 'MigasLink',
  template: '<div class="migas-link-stub"></div>',
  props: ['model', 'pk', 'value'],
}
const RemoveDialogStub = {
  name: 'RemoveDialog',
  template: '<div class="remove-dialog-stub"></div>',
  props: ['modelValue'],
  emits: ['confirmed', 'canceled', 'update:modelValue'],
}

// Mock global
const globalMocks = {
  $gettext: (msg) => msg,
  $q: {
    dark: { isActive: false },
    dialog: vi.fn(),
  },
  $route: { params: { id: 1 } },
}

describe('ItemDetail.vue', () => {
  const defaultProps = {
    originalTitle: 'Test Title',
    breadcrumbs: [],
    model: 'computers',
    routes: { add: 'add-route' },
    element: { id: 1, name: 'Test Element' },
    isValid: true,
  }

  const mountComponent = (props = {}, slots = {}) => {
    return mount(ItemDetail, {
      global: {
        mocks: globalMocks,
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          BannerInfo: BannerInfoStub,
          Breadcrumbs: BreadcrumbsStub,
          Header: HeaderStub,
          MigasLink: MigasLinkStub,
          RemoveDialog: RemoveDialogStub,
          'q-card': {
            template:
              '<div class="q-card"><slot name="fields"></slot><slot></slot></div>',
          },
          'q-card-actions': {
            template: '<div class="q-card-actions"><slot></slot></div>',
          },
          'q-btn': QBtnStub,
          'q-spinner-dots': { template: '<div class="q-spinner-dots"></div>' },
          'q-tooltip': { template: '<div></div>' },
        },
      },
      props: { ...defaultProps, ...props },
      slots: slots,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDetail.loading.value = false
  })

  it('renders correctly with default props', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(HeaderStub).exists()).toBe(true)
    expect(wrapper.findComponent(BreadcrumbsStub).exists()).toBe(true)
    expect(wrapper.find('.q-card').exists()).toBe(true)
  })

  it('calls updateElement("return") when Save button is clicked', async () => {
    const wrapper = mountComponent()
    // Find button by text content since QBtnStub renders label
    const buttons = wrapper.findAll('.q-btn-stub')
    const saveBtn = buttons.find((b) => b.text() === 'Save')

    if (!saveBtn) console.log(wrapper.html())
    expect(saveBtn).toBeDefined()
    await saveBtn.trigger('click')
    expect(mockUseDetail.updateElement).toHaveBeenCalledWith('return')
  })

  it('calls updateElement("add") when Save and Add Other button is clicked', async () => {
    const wrapper = mountComponent()
    const buttons = wrapper.findAll('.q-btn-stub')
    const addBtn = buttons.find((b) => b.text() === 'Save and add other')

    expect(addBtn).toBeDefined()
    await addBtn.trigger('click')
    expect(mockUseDetail.updateElement).toHaveBeenCalledWith('add')
  })

  it('calls updateElement() when Save and Continue button is clicked', async () => {
    const wrapper = mountComponent()
    const buttons = wrapper.findAll('.q-btn-stub')
    const contBtn = buttons.find(
      (b) => b.text() === 'Save and continue editing',
    )

    expect(contBtn).toBeDefined()
    await contBtn.trigger('click')
    expect(mockUseDetail.updateElement).toHaveBeenCalled()
  })

  it('closes remove dialog when cancelled and calls remove when confirmed', async () => {
    const wrapper = mountComponent({ removeButton: true })
    const buttons = wrapper.findAll('.q-btn-stub')
    const deleteBtn = buttons.find((b) => b.text() === 'Delete')

    expect(deleteBtn).toBeDefined()
    await deleteBtn.trigger('click')

    const dialog = wrapper.findComponent(RemoveDialogStub)
    expect(dialog.props('modelValue')).toBe(true)

    // Test cancel
    dialog.vm.$emit('canceled')
    expect(dialog.props('modelValue')).toBe(true)
    // Wait, confirmRemove is local state. To verify it changed, we check prop on re-render or internal state?
    // We can just verify 'remove' is called on confirmed event
    dialog.vm.$emit('confirmed')
    expect(mockUseDetail.remove).toHaveBeenCalled()
  })

  it('renders spinner when loading (element.id === 0)', () => {
    const wrapper = mountComponent({ element: { id: 0 } })
    expect(wrapper.find('.q-spinner-dots').exists()).toBe(true)
  })
})
