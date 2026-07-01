import { ref } from 'vue'
import { api } from 'boot/axios'

/**
 * Composable that encapsulates the "Copy Applications to Project" feature.
 *
 * Usage:
 *   const { showCopyModal, openCopyModal, getAppsToCopy, copyApp } = useCopyApplications()
 */
export function useCopyApplications() {
  const showCopyModal = ref(false)

  const openCopyModal = () => {
    showCopyModal.value = true
  }

  const getAppsToCopy = async (projectId) => {
    const { data } = await api.get('/api/v1/token/catalog/apps/', {
      params: {
        packages_by_project__project__id: projectId,
        page_size: 10000,
      },
    })
    const list = data.results || []
    return list.map((app) => {
      const projectPackage = app.packages_by_project?.find(
        (p) => p.project?.id === projectId,
      )
      return {
        id: app.id,
        label: app.name,
        packages_to_install: projectPackage
          ? projectPackage.packages_to_install
          : [],
        original: app,
      }
    })
  }

  const copyApp = async (item, destinationProjectId) => {
    await api.post('/api/v1/token/catalog/project-packages/', {
      application: item.id,
      project: destinationProjectId,
      packages_to_install: item.packages_to_install || [],
    })
  }

  return {
    showCopyModal,
    openCopyModal,
    getAppsToCopy,
    copyApp,
  }
}
