import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import CodeEditor from 'src/components/ui/CodeEditor.vue'
import { reactive } from 'vue'

const mockDark = reactive({ isActive: false })

// Mock useQuasar
vi.mock('quasar', () => ({
  useQuasar: () => ({
    dark: mockDark,
  }),
}))

// Mock Subcomponents
const VAceEditorStub = {
  name: 'VAceEditor',
  template: '<div class="v-ace-editor-stub"></div>',
  props: ['value', 'lang', 'theme'],
}
const CopyToClipboardStub = {
  name: 'CopyToClipboard',
  template: '<div class="copy-to-clipboard-stub"></div>',
  props: ['content'],
}

describe('CodeEditor.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(CodeEditor, {
      global: {
        stubs: {
          VAceEditor: VAceEditorStub,
          CopyToClipboard: CopyToClipboardStub,
        },
      },
      props: {
        modelValue: 'print("hello")',
        ...props,
      },
    })
  }

  it('renders correctly', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(VAceEditorStub).exists()).toBe(true)
    expect(wrapper.findComponent(CopyToClipboardStub).exists()).toBe(true)
  })

  it('maps language props correctly to highlightLang', () => {
    const wrapper = mountComponent({ language: 'bash' })
    expect(wrapper.vm.highlightLang).toBe('sh')

    const wrapper2 = mountComponent({ language: 'python' })
    expect(wrapper2.vm.highlightLang).toBe('python')
  })

  it('updates editorTheme based on dark mode', async () => {
    mockDark.isActive = false
    const wrapper = mountComponent()
    expect(wrapper.vm.editorTheme).toBe('chrome')

    mockDark.isActive = true
    // Trigger reactivity
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.editorTheme).toBe('cobalt')
  })

  it('updates model value when code changes', () => {
    const wrapper = mountComponent()
    // Access computed writable 'code'
    wrapper.vm.code = 'new code'
    expect(wrapper.emitted('update:model-value')[0]).toEqual(['new code'])
  })
})
