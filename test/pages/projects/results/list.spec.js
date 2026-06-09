import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ProjectList from 'src/pages/projects/results/list.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock dependencies
const mocks = vi.hoisted(() => ({
  router: { push: vi.fn() },
  route: { query: {}, fullPath: '/projects' },
  api: { get: vi.fn(), post: vi.fn() },
  elementComposables: {
    appIcon: (key) => `icon-app-${key}`,
    modelIcon: (key) => `icon-model-${key}`,
  },
  quasar: {
    useMeta: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => mocks.router,
  useRoute: () => mocks.route,
}))

vi.mock('boot/axios', () => ({
  api: mocks.api,
}))

vi.mock('composables/element', () => mocks.elementComposables)

vi.mock('quasar', () => mocks.quasar)

vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    $gettext: (msg) => msg,
  }),
  createGettext: () => ({
    $gettext: (msg) => msg,
  }),
}))

// Mock composables/listConfig
vi.mock('composables/listConfig', () => ({
  useListConfig: () => ({
    modelIcon: (key) => `icon-model-${key}`,
    title: 'Projects',
    breadcrumbs: [],
    columns: [],
  }),
}))

// Mock composables/filterHelper
vi.mock('composables/filterHelper', () => ({
  useFilterHelper: () => ({
    setFilterItems: vi.fn(),
  }),
}))

describe('list.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.query = {}
    mocks.api.get.mockImplementation((url) => {
      if (url.includes('/platforms/')) {
        return Promise.resolve({ data: { results: [] } })
      }
      if (url.includes('/pms/')) {
        return Promise.resolve({ data: {} })
      }
      if (url.includes('/templates/')) {
        return Promise.resolve({
          data: {
            templates: [
              { id: 'debian-12-desktop', base_os: 'debian' },
              { id: 'ubuntu-24.04-server', base_os: 'ubuntu' },
            ],
          },
        })
      }
      return Promise.resolve({ data: {} })
    })
  })

  const createWrapper = (options = {}) => {
    return mount(ProjectList, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        mocks: {
          $gettext: (msg) => msg,
          $route: mocks.route,
        },
        stubs: {
          Breadcrumbs: {
            template: '<div class="breadcrumbs-stub">Breadcrumbs</div>',
          },
          TableResults: {
            template: `
              <div class="table-results-stub">
                <slot name="header-actions" />
                <slot name="actions" :props="{ row: { id: 42, name: 'Project 42' } }" />
              </div>
            `,
            methods: {
              loadItems: vi.fn(),
            },
          },
          BooleanView: true,
          MigasLink: true,
          'q-page': { template: '<div><slot /></div>' },
          'q-dialog': {
            template:
              '<div v-if="modelValue" class="q-dialog-stub"><slot /></div>',
            props: ['modelValue'],
          },
          'q-card': { template: '<div><slot /></div>' },
          'q-card-section': { template: '<div><slot /></div>' },
          'q-card-actions': { template: '<div><slot /></div>' },
          'q-form': {
            template:
              '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
          },
          'q-input': {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
          },
          'q-select': {
            template: `
              <div class="q-select-stub">
                <slot name="option" :itemProps="{}" :opt="{ id: 'debian-12-desktop', base_os: 'debian' }" />
                <slot name="no-option" />
              </div>
            `,
            props: ['modelValue', 'options'],
          },
          'q-btn': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          'q-icon': true,
          'q-space': true,
          'q-tooltip': true,
          'q-item': { template: '<div><slot /></div>' },
          'q-item-section': { template: '<div><slot /></div>' },
          'q-item-label': { template: '<div><slot /></div>' },
        },
        ...options,
      },
    })
  }

  it('renders TableResults and Breadcrumbs', async () => {
    wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.find('.table-results-stub').exists()).toBe(true)
    expect(wrapper.find('.breadcrumbs-stub').exists()).toBe(true)
  })

  it('opens template modal for create project on click and loads templates', async () => {
    wrapper = createWrapper()
    await flushPromises()

    // Trigger header action (Add from Template)
    const headerBtn = wrapper.find('.table-results-stub button')
    expect(headerBtn.exists()).toBe(true)
    await headerBtn.trigger('click')
    await flushPromises()

    expect(wrapper.vm.showTemplateModal).toBe(true)
    expect(mocks.api.get).toHaveBeenCalledWith(
      '/api/v1/token/projects/templates/',
    )
    expect(wrapper.vm.templates).toHaveLength(2)
  })

  it('submits import payload and calls API post with correct params when creating new project', async () => {
    wrapper = createWrapper()
    await flushPromises()

    // Open in create mode
    wrapper.vm.openTemplateModalForCreate()
    await flushPromises()

    wrapper.vm.templateModalData.projectName = 'New Project'
    wrapper.vm.templateModalData.templateId = 'debian-12-desktop'
    wrapper.vm.templateModalData.origin = 'remote'

    mocks.api.post.mockResolvedValueOnce({ data: {} })

    await wrapper.vm.submitTemplateImport()
    await flushPromises()

    expect(mocks.api.post).toHaveBeenCalledWith(
      '/api/v1/token/projects/templates/import/',
      {
        project_name: 'New Project',
        template_id: 'debian-12-desktop',
        origin: 'remote',
      },
    )
    expect(wrapper.vm.showTemplateModal).toBe(false)
  })

  it('filters templates by selected origin', async () => {
    wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.templates = [
      { id: 't1', origin: 'local' },
      { id: 't2', origin: 'remote' },
      { id: 't3' },
    ]

    wrapper.vm.templateModalData.origin = 'local'
    expect(wrapper.vm.filteredTemplates).toEqual([
      { id: 't1', origin: 'local' },
    ])

    wrapper.vm.templateModalData.origin = 'remote'
    expect(wrapper.vm.filteredTemplates).toEqual([
      { id: 't2', origin: 'remote' },
      { id: 't3' },
    ])
  })

  it('resets templateId when origin changes', async () => {
    wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.templateModalData.origin = 'local'
    wrapper.vm.templateModalData.templateId = 't1'

    wrapper.vm.templateModalData.origin = 'remote'
    await flushPromises()

    expect(wrapper.vm.templateModalData.templateId).toBeNull()
  })

  it('disables origin options if there are no templates for that origin', async () => {
    wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.templates = [{ id: 't1', origin: 'remote' }]

    const localOption = wrapper.vm.originOptions.find(
      (o) => o.value === 'local',
    )
    const remoteOption = wrapper.vm.originOptions.find(
      (o) => o.value === 'remote',
    )

    expect(localOption.disable).toBe(true)
    expect(remoteOption.disable).toBe(false)
  })

  it('validates form completeness', async () => {
    wrapper = createWrapper()
    await flushPromises()

    wrapper.vm.openTemplateModalForCreate()
    expect(wrapper.vm.isFormValid).toBe(false)

    wrapper.vm.templateModalData.origin = 'local'
    expect(wrapper.vm.isFormValid).toBe(false)

    wrapper.vm.templateModalData.projectName = '  '
    expect(wrapper.vm.isFormValid).toBe(false)

    wrapper.vm.templateModalData.projectName = 'New Project'
    expect(wrapper.vm.isFormValid).toBe(false)

    wrapper.vm.templateModalData.templateId = 't1'
    expect(wrapper.vm.isFormValid).toBe(true)
  })
})
