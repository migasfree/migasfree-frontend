import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import RemoveDialog from 'src/components/ui/RemoveDialog.vue'

// Mock dependencies
vi.mock('composables/element', () => ({
  appIcon: vi.fn((name) => `mdi-${name}`),
}))

vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    $gettext: (msg) => msg,
  }),
}))

// Mock Subcomponents
const QDialogStub = {
  name: 'QDialog',
  template: '<div class="q-dialog"><slot></slot></div>',
  props: ['modelValue'],
}
const QCardStub = { template: '<div class="q-card"><slot></slot></div>' }
const QCardSectionStub = {
  template: '<div class="q-card-section"><slot></slot></div>',
}
const QAvatarStub = { template: '<div class="q-avatar"></div>' }
const QCardActionsStub = {
  template: '<div class="q-card-actions"><slot></slot></div>',
}
const QBtnStub = {
  name: 'QBtn',
  template:
    '<button class="q-btn" @click="$emit(\'click\')">{{ label }}</button>',
  props: ['label', 'icon', 'color', 'flat'],
}

// Mock global
const globalMocks = {
  $gettext: (msg) => msg,
}

describe('RemoveDialog.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(RemoveDialog, {
      global: {
        mocks: globalMocks,
        stubs: {
          QDialog: QDialogStub,
          QCard: QCardStub,
          QCardSection: QCardSectionStub,
          QAvatar: QAvatarStub,
          QCardActions: QCardActionsStub,
          QBtn: QBtnStub,
        },
        directives: {
          'close-popup': {},
        },
      },
      props: {
        modelValue: true,
        ...props,
      },
    })
  }

  it('renders correctly with default message', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.q-dialog').exists()).toBe(true)
    expect(wrapper.text()).toContain(
      'Are you sure you want to remove this item?',
    )
  })

  it('renders correctly with custom message', () => {
    const message = 'Custom remove message'
    const wrapper = mountComponent({ message })
    expect(wrapper.text()).toContain(message)
  })

  it('emits "canceled" when Cancel button is clicked', async () => {
    const wrapper = mountComponent()
    const buttons = wrapper.findAllComponents(QBtnStub)
    // The stub renders label text, so .text() matching or props matching works.
    // Let's use props matching as per latest file state
    const cancelBtn = buttons.find((b) => b.props('label') === 'Cancel')

    expect(cancelBtn).toBeDefined()
    await cancelBtn.trigger('click')
    expect(wrapper.emitted('canceled')).toBeTruthy()
  })

  it('emits "confirmed" when Delete button is clicked', async () => {
    const wrapper = mountComponent()
    const buttons = wrapper.findAllComponents(QBtnStub)
    const deleteBtn = buttons.find((b) => b.props('label') === 'Delete')

    expect(deleteBtn).toBeDefined()
    await deleteBtn.trigger('click')
    expect(wrapper.emitted('confirmed')).toBeTruthy()
  })

  it('models showing state correctly', async () => {
    const wrapper = mountComponent({ modelValue: false })
    expect(wrapper.vm.showing).toBe(false)

    await wrapper.setProps({ modelValue: true })
    expect(wrapper.vm.showing).toBe(true)
  })
})
