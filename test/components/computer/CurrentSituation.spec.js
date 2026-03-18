import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import CurrentSituation from 'components/computer/CurrentSituation.vue'

const mocks = vi.hoisted(() => ({
  api: {
    patch: vi.fn(),
  },
  smartRequest: {
    smartRequest: vi.fn(),
  },
}))

vi.mock('boot/axios', () => ({
  api: mocks.api,
}))

vi.mock('composables/smartRequest', () => ({
  useSmartRequest: () => mocks.smartRequest,
}))

vi.mock('composables/element', () => ({
  useElement: () => ({
    elementIcon: vi.fn(() => 'mdi-test'),
    attributeValue: vi.fn((opt) => opt.value || 'mock-value'),
  }),
  appIcon: () => 'mdi-icon',
  modelIcon: () => 'mdi-model-icon',
}))

const mockGettext = {
  $gettext: (msg) => msg,
}

vi.mock('vue3-gettext', () => ({
  useGettext: () => mockGettext,
}))

vi.mock('quasar', () => ({
  useQuasar: () => ({
    dark: { isActive: false },
  }),
}))

describe('CurrentSituation.vue', () => {
  let wrapper

  const props = {
    cid: 123,
    status: 'OK',
    comment: 'Test comment',
    tags: [{ id: 1, name: 'Tag1', value: 'Value1', description: 'Desc1' }],
    attributeSets: [],
    domains: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mocks.smartRequest.smartRequest.mockImplementation((url) => {
      if (url.includes('/status/')) {
        return Promise.resolve({
          data: { choices: { OK: 'Operative', RET: 'Retired' } },
        })
      }
      if (url.includes('/errors/')) {
        return Promise.resolve({ data: { unchecked: 2, total: 5 } })
      }
      if (url.includes('/faults/')) {
        return Promise.resolve({ data: { unchecked: 0, total: 1 } })
      }
      if (url.includes('/tags/')) {
        return Promise.resolve({
          data: { results: [{ id: 2, name: 'Tag2' }] },
        })
      }
      return Promise.resolve({ data: {} })
    })

    mocks.api.patch.mockResolvedValue({})
  })

  const createWrapper = () => {
    return mount(CurrentSituation, {
      props,
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              ui: { notifySuccess: vi.fn(), notifyError: vi.fn() },
            },
            createSpy: vi.fn,
            stubActions: true,
          }),
        ],
        mocks: {
          ...mockGettext,
          $q: { dark: { isActive: false } },
          appIcon: () => 'mdi-icon',
          modelIcon: () => 'mdi-model-icon',
        },
        stubs: {
          MigasLink: true,
          OverflowList: true,
          FilteredMultiSelect: {
            template: `<div class="filtered-multi-select">
              <slot name="option" :scope="{opt: {id: 2, value: 'val'}, itemProps: {}}" />
              <slot name="selected-item" :scope="{opt: {id: 1, value: 'val'}, index: 0, tabindex: 0, removeAtIndex: () => {}}" />
            </div>`,
            props: ['label', 'fetchOptions', 'modelValue'],
          },
          'q-card': { template: '<div><slot /></div>' },
          'q-card-section': { template: '<div><slot /></div>' },
          'q-icon': true,
          'q-badge': { template: '<span><slot /></span>' },
          'q-select': {
            template: `<div class="q-select">
              <slot name="option" :opt="{icon:'a', label:'l', value:'v'}" :itemProps="{}" />
              <slot name="selected-item" :opt="{icon:'a', label:'l', value:'v'}" :itemProps="{}" />
            </div>`,
          },
          'q-input': true,
          'q-btn': true,
          'q-item': { template: '<div><slot /></div>' },
          'q-item-section': { template: '<div><slot /></div>' },
          'q-item-label': { template: '<div><slot /></div>' },
          'q-chip': { template: '<div><slot /></div>' },
          'router-link': { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
  }

  it('fetches data on mount using smartRequest', async () => {
    wrapper = createWrapper()
    await flushPromises()

    expect(mocks.smartRequest.smartRequest).toHaveBeenCalledWith(
      '/api/v1/token/computers/status/',
    )
    expect(mocks.smartRequest.smartRequest).toHaveBeenCalledWith(
      `/api/v1/token/computers/${props.cid}/errors/`,
    )
    expect(mocks.smartRequest.smartRequest).toHaveBeenCalledWith(
      `/api/v1/token/computers/${props.cid}/faults/`,
    )

    // Check component state after mounting
    expect(wrapper.vm.errors.unchecked).toBe(2)
    expect(wrapper.vm.errors.total).toBe(5)
    expect(wrapper.vm.faults.unchecked).toBe(0)
    expect(wrapper.vm.faults.total).toBe(1)
    expect(wrapper.vm.statusOptions.length).toBe(2)
  })

  it('saves data using api.patch and emits updated', async () => {
    wrapper = createWrapper()
    await flushPromises()

    await wrapper.vm.save()

    expect(mocks.api.patch).toHaveBeenCalledWith(
      `/api/v1/token/computers/${props.cid}/`,
      {
        status: props.status,
        comment: props.comment,
        tags: [1], // From props.tags
      },
    )

    expect(wrapper.emitted().updated).toBeTruthy()
    expect(wrapper.emitted().updated[0][0]).toEqual({
      status: props.status,
      comment: props.comment,
      tags: props.tags,
    })
  })

  it('filterTags calls smartRequest with search param', async () => {
    wrapper = createWrapper()
    await flushPromises()

    const results = await wrapper.vm.filterTags('SearchTerm')

    expect(mocks.smartRequest.smartRequest).toHaveBeenCalledWith(
      '/api/v1/token/tags/',
      {
        params: { search: 'searchterm' },
      },
    )
    expect(results).toEqual([{ id: 2, name: 'Tag2' }])
  })
})
