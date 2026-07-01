import { ref } from 'vue'
import { api } from 'boot/axios'

/**
 * Composable that encapsulates the "Copy Deployments to Project" feature.
 *
 * Usage:
 *   const { showCopyModal, openCopyModal, getDeploymentsToCopy, copyDeployment } = useCopyDeployments()
 */
export function useCopyDeployments() {
  const showCopyModal = ref(false)

  const openCopyModal = () => {
    showCopyModal.value = true
  }

  const getDeploymentsToCopy = async (projectId) => {
    const { data } = await api.get(
      '/api/v1/token/deployments/internal-sources/',
      {
        params: {
          project__id: projectId,
          page_size: 10000,
        },
      },
    )
    const list = data.results || []
    return list.map((d) => ({
      id: d.id,
      label: d.name,
      enabled: d.enabled,
      original: d,
    }))
  }

  const copyDeployment = async (item, destinationProjectId) => {
    const { data } = await api.post(
      `/api/v1/token/deployments/internal-sources/${item.id}/copy/`,
      { project: destinationProjectId },
    )
    return data
  }

  return {
    showCopyModal,
    openCopyModal,
    getDeploymentsToCopy,
    copyDeployment,
  }
}
