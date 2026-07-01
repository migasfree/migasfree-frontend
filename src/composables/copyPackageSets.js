import { ref } from 'vue'
import { api } from 'boot/axios'

/**
 * Composable that encapsulates the "Copy Package Sets to Project" feature.
 *
 * Usage:
 *   const { showCopyModal, openCopyModal, getPackageSetsToCopy, copyPackageSet } =
 *     useCopyPackageSets()
 */
export function useCopyPackageSets() {
  const showCopyModal = ref(false)

  const openCopyModal = () => {
    showCopyModal.value = true
  }

  const getPackageSetsToCopy = async (projectId) => {
    const { data } = await api.get('/api/v1/token/package-sets/', {
      params: {
        project__id: projectId,
        page_size: 10000,
      },
    })
    const list = data.results || []
    return list.map((pset) => ({
      id: pset.id,
      label: pset.name,
      store: pset.store?.name || '',
      original: pset,
    }))
  }

  const copyPackageSet = async (item, destinationProjectId) => {
    const { data } = await api.post(
      `/api/v1/token/package-sets/${item.id}/copy/`,
      { project: destinationProjectId },
    )
    return data
  }

  return {
    showCopyModal,
    openCopyModal,
    getPackageSetsToCopy,
    copyPackageSet,
  }
}
