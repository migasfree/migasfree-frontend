import { describe, it, expect, vi, beforeEach } from 'vitest'
import useCopyPaste from 'src/composables/copyPaste'

// Mock vue3-gettext
vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    $gettext: (msg) => msg,
  }),
}))

// Mock Quasar copyToClipboard
const mockCopyToClipboard = vi.fn()
vi.mock('quasar', () => ({
  copyToClipboard: (...args) => mockCopyToClipboard(...args),
}))

// Mock stores/ui
const mockNotifySuccess = vi.fn()
const mockNotifyError = vi.fn()
vi.mock('stores/ui', () => ({
  useUiStore: () => ({
    notifySuccess: mockNotifySuccess,
    notifyError: mockNotifyError,
  }),
}))

// Mock boot/axios
const mockApiGet = vi.fn()
vi.mock('boot/axios', () => ({
  api: {
    get: (...args) => mockApiGet(...args),
  },
}))

describe('useCopyPaste composable', () => {
  let copyPaste

  beforeEach(() => {
    copyPaste = useCopyPaste()
    mockCopyToClipboard.mockClear()
    mockNotifySuccess.mockClear()
    mockNotifyError.mockClear()
    mockApiGet.mockClear()
  })

  describe('hasPaste', () => {
    it('is a computed ref', () => {
      expect(copyPaste.hasPaste).toBeDefined()
      expect(typeof copyPaste.hasPaste.value).toBe('boolean')
    })
  })

  describe('contentToClipboard', () => {
    it('copies content and shows success notification', async () => {
      mockCopyToClipboard.mockResolvedValueOnce()

      await copyPaste.contentToClipboard('test content')

      expect(mockCopyToClipboard).toHaveBeenCalledWith('test content')
      expect(mockNotifySuccess).toHaveBeenCalledWith(
        'Content copied to clipboard',
      )
    })

    it('shows error notification on failure', async () => {
      const error = new Error('Copy failed')
      mockCopyToClipboard.mockRejectedValueOnce(error)

      await copyPaste.contentToClipboard('test content')

      expect(mockNotifyError).toHaveBeenCalledWith(error)
    })
  })

  describe('copyList', () => {
    it('copies list of items as JSON', async () => {
      mockCopyToClipboard.mockResolvedValueOnce()

      const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
      copyPaste.copyList('computers', items)

      expect(mockCopyToClipboard).toHaveBeenCalledWith(
        JSON.stringify({ computers: [1, 2, 3] }),
      )
    })

    it('does nothing when list is empty', () => {
      copyPaste.copyList('computers', [])

      expect(mockCopyToClipboard).not.toHaveBeenCalled()
    })
  })

  describe('pasteList', () => {
    it('shows error when callback is not a function', async () => {
      await copyPaste.pasteList(null)

      expect(mockNotifyError).toHaveBeenCalledWith('Invalid callback function')
    })

    it('shows error when callback is undefined', async () => {
      await copyPaste.pasteList(undefined)

      expect(mockNotifyError).toHaveBeenCalledWith('Invalid callback function')
    })
  })
})
