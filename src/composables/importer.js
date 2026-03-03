import { ref, reactive, computed } from 'vue'
import { api } from 'boot/axios'

const TEMPLATE_URL = '/data/imports/template.json'
const API_PREFIX = '/api/v1/token'

const REQUIRED_DISTRO_FIELDS = ['name', 'platform', 'pms', 'architecture']
const REQUIRED_DEPLOYMENT_FIELDS = ['name', 'source', 'enabled']
const EXTERNAL_DEPLOYMENT_FIELDS = ['base_url', 'suite', 'components']
const INTERNAL_DEPLOYMENT_FIELDS = ['store', 'packages_to_install']
const REQUIRED_APP_FIELDS = ['name', 'category', 'level']
const VALID_SOURCES = ['E', 'I']
const BASE64_ICON_REGEX = /^data:image\/[a-zA-Z0-9.+-]+;base64,.+/

/**
 * Validate template structure. Returns { valid, errors }.
 */
export const validateTemplate = (data) => {
  const errors = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Template must be a JSON object'] }
  }

  // --- distros ---
  if (!Array.isArray(data.distros) || data.distros.length === 0) {
    errors.push('"distros" must be a non-empty array')
  } else {
    data.distros.forEach((d, i) => {
      const missing = REQUIRED_DISTRO_FIELDS.filter((f) => !d[f])
      if (missing.length) {
        errors.push(`distros[${i}]: missing fields: ${missing.join(', ')}`)
      }
    })
  }

  // --- deployments ---
  if (!data.deployments || typeof data.deployments !== 'object') {
    errors.push('"deployments" must be an object')
  } else {
    const distroNames = (data.distros || []).map((d) => d.name)

    Object.entries(data.deployments).forEach(([key, list]) => {
      if (!distroNames.includes(key)) {
        errors.push(`deployments["${key}"]: no matching distro`)
      }

      if (!Array.isArray(list)) {
        errors.push(`deployments["${key}"] must be an array`)
        return
      }

      list.forEach((dep, i) => {
        const label = `deployments["${key}"][${i}]`
        const missing = REQUIRED_DEPLOYMENT_FIELDS.filter((f) => !(f in dep))
        if (missing.length) {
          errors.push(`${label}: missing fields: ${missing.join(', ')}`)
        }

        if (dep.source && !VALID_SOURCES.includes(dep.source)) {
          errors.push(`${label}: invalid source "${dep.source}" (E or I)`)
        }

        if (dep.source === 'E') {
          const ext = EXTERNAL_DEPLOYMENT_FIELDS.filter((f) => !dep[f])
          if (ext.length) {
            errors.push(`${label} (external): missing: ${ext.join(', ')}`)
          }
        }

        if (dep.source === 'I') {
          const int = INTERNAL_DEPLOYMENT_FIELDS.filter((f) => !dep[f])
          if (int.length) {
            errors.push(`${label} (internal): missing: ${int.join(', ')}`)
          }
        }
      })
    })
  }

  // --- applications (optional) ---
  if ('applications' in data) {
    if (!Array.isArray(data.applications)) {
      errors.push('"applications" must be an array')
    } else {
      data.applications.forEach((app, i) => {
        const missing = REQUIRED_APP_FIELDS.filter((f) => !app[f])
        if (missing.length) {
          errors.push(`applications[${i}]: missing: ${missing.join(', ')}`)
        }

        if (app.icon && !BASE64_ICON_REGEX.test(app.icon)) {
          errors.push(
            `applications[${i}].icon: invalid format (expected data:image/...;base64,...)`,
          )
        }
      })
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Composable for importing configuration from template.
 * Translates migasfree-imports Python logic to browser-based JS.
 *
 * @returns {Object} Import utilities and reactive state
 */
export function useImporter() {
  const template = ref(null)
  const isRunning = ref(false)
  const currentStep = ref('')
  const progress = ref(0)
  const totalSteps = ref(0)
  const logs = reactive([])
  const error = ref(null)
  const createdResources = reactive({
    platform: null,
    project: null,
    stores: [],
    deployments: [],
    categories: [],
    applications: [],
  })

  const progressPercent = computed(() =>
    totalSteps.value > 0
      ? Math.round((progress.value / totalSteps.value) * 100)
      : 0,
  )

  const addLog = (message, type = 'info') => {
    logs.push({ message, type, timestamp: new Date().toISOString() })
  }

  const loadTemplate = async () => {
    try {
      const response = await fetch(TEMPLATE_URL)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      template.value = await response.json()
      return template.value
    } catch (err) {
      error.value = `Failed to load template: ${err.message}`
      throw err
    }
  }

  /**
   * GET first, POST if not found (mirrors Python get_or_post pattern).
   */
  const getOrPost = async (endpoint, params, data, files = null) => {
    try {
      const response = await api.get(`${API_PREFIX}${endpoint}`, { params })
      const results = response.data?.results ?? response.data
      if (results && (Array.isArray(results) ? results.length > 0 : true)) {
        return Array.isArray(results) ? results : [results]
      }
    } catch {
      // GET failed or empty, proceed with POST
    }

    const config = files
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {}

    const payload = files ? buildFormData(data, files) : data
    const response = await api.post(`${API_PREFIX}${endpoint}`, payload, config)
    return [response.data]
  }

  const buildFormData = (data, files) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
    Object.entries(files).forEach(([key, file]) => {
      if (Array.isArray(file)) {
        formData.append(key, file[0], file[1])
      } else {
        formData.append(key, file)
      }
    })
    return formData
  }

  const importPlatform = async (distro) => {
    currentStep.value = 'platform'
    addLog(`Creating platform: ${distro.platform}`)
    const payload = { name: distro.platform }
    const result = await getOrPost('/platforms/', payload, payload)
    createdResources.platform = result[0]
    progress.value++
    addLog(`Platform ready: ${result[0].name} (ID: ${result[0].id})`, 'success')
    return result[0]
  }

  const importProject = async (projectName, distro, platformId) => {
    currentStep.value = 'project'
    addLog(`Creating project: ${projectName}`)
    const result = await getOrPost(
      '/projects/',
      { name: projectName },
      {
        name: projectName,
        pms: distro.pms,
        architecture: distro.architecture,
        auto_register_computers: true,
        platform: platformId,
      },
    )
    createdResources.project = result[0]
    progress.value++
    addLog(`Project ready: ${result[0].name} (ID: ${result[0].id})`, 'success')
    return result[0]
  }

  const importStores = async (projectId) => {
    currentStep.value = 'stores'
    const storeNames = ['org', 'thirds', 'updates']

    for (const name of storeNames) {
      addLog(`Creating store: ${name}`)
      try {
        const result = await api.post(`${API_PREFIX}/stores/`, {
          name,
          project: projectId,
        })
        createdResources.stores.push(result.data)
        addLog(`Store ready: ${name}`, 'success')
      } catch {
        addLog(`Store "${name}" may already exist`, 'warning')
      }
      progress.value++
    }
  }

  const slugify = (value) => {
    return value
      .toString()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-')
      .replace(/^[-_]+|[-_]+$/g, '')
  }

  const importDeployments = async (
    distroName,
    project,
    selectedDeployments,
    packageFiles = {},
  ) => {
    currentStep.value = 'deployments'
    const deployments = template.value.deployments[distroName] || []
    const today = new Date().toISOString().split('T')[0]

    for (const deployment of deployments) {
      if (deployment.ignored) continue
      if (
        selectedDeployments &&
        !selectedDeployments.includes(deployment.name)
      ) {
        addLog(`Skipped deployment: ${deployment.name}`, 'warning')
        progress.value++
        continue
      }

      addLog(`Creating deployment: ${deployment.name}`)

      if (deployment.source === 'E') {
        await importExternalDeployment(deployment, project, today)
      } else if (deployment.source === 'I') {
        const files = packageFiles[deployment.name] || []
        await importInternalDeployment(deployment, project, today, files)
      }

      progress.value++
    }
  }

  const importExternalDeployment = async (deployment, project, date) => {
    const variables = {
      server: window.location.hostname,
      project_name: project.name,
      project_slug: slugify(project.name),
      deployment_name: deployment.name,
      deployment_slug: slugify(deployment.name),
    }

    const comment = deployment.comment
      ? deployment.comment.replace(
          /\{(\w+)\}/g,
          (_, key) => variables[key] || `{${key}}`,
        )
      : `Imported from migasfree-imports template: ${deployment.name}`

    try {
      const response = await api.post(`${API_PREFIX}/deployments/`, {
        enabled: deployment.enabled,
        name: deployment.name,
        base_url: deployment.base_url,
        comment,
        start_date: date,
        source: 'E',
        options: deployment.options,
        suite: deployment.suite,
        components: deployment.components,
        frozen: deployment.frozen,
        expire: 1440,
        project: project.id,
        included_attributes: deployment.included_attributes,
      })
      createdResources.deployments.push(response.data)
      addLog(`External deployment created: ${deployment.name}`, 'success')
    } catch (err) {
      addLog(
        `Error creating deployment "${deployment.name}": ${err.message}`,
        'error',
      )
    }
  }

  const importInternalDeployment = async (
    deployment,
    project,
    date,
    uploadedFiles = [],
  ) => {
    // Get or create the store
    const store = await getOrPost(
      '/stores/',
      { name: deployment.store, project__id: project.id },
      { name: deployment.store, project: project.id },
    )
    const storeId = store[0].id

    // Upload user-provided packages
    const availablePackages = []
    for (const file of uploadedFiles) {
      addLog(`Uploading package: ${file.name}`)
      try {
        const formData = new FormData()
        formData.append('project', project.id)
        formData.append('store', storeId)
        formData.append('files', file, file.name)

        const response = await api.post(`${API_PREFIX}/packages/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        if (response.data?.id) {
          availablePackages.push(response.data.id)
        }
        addLog(`Package uploaded: ${file.name}`, 'success')
      } catch (err) {
        addLog(`Error uploading "${file.name}": ${err.message}`, 'error')
      }
    }

    try {
      const response = await api.post(`${API_PREFIX}/deployments/`, {
        enabled: deployment.enabled,
        name: deployment.name,
        comment: `Imported from migasfree-imports template`,
        start_date: date,
        source: 'I',
        project: project.id,
        included_attributes: deployment.included_attributes,
        packages_to_install: deployment.packages_to_install,
        packages_to_remove: deployment.packages_to_remove || [],
        available_packages: availablePackages,
      })
      createdResources.deployments.push(response.data)
      addLog(`Internal deployment created: ${deployment.name}`, 'success')
    } catch (err) {
      addLog(
        `Error creating deployment "${deployment.name}": ${err.message}`,
        'error',
      )
    }
  }

  /**
   * Decode a base64 data URI into a Blob for upload.
   */
  const decodeIcon = (dataUri) => {
    const [header, encoded] = dataUri.split(',', 2)
    const mimeType = header.split(':')[1].split(';')[0]
    const ext = mimeType.split('/')[1]
    const binary = atob(encoded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return {
      blob: new Blob([bytes], { type: mimeType }),
      filename: `icon.${ext}`,
      mimeType,
    }
  }

  const importApplications = async (project) => {
    currentStep.value = 'applications'
    const applications = template.value.applications || []

    for (const app of applications) {
      addLog(`Creating application: ${app.name}`)

      // Category
      const categoryPayload = { name: app.category }
      const category = await getOrPost(
        '/catalog/categories/',
        categoryPayload,
        categoryPayload,
      )
      const categoryId = category[0].id

      if (!createdResources.categories.find((c) => c.id === categoryId)) {
        createdResources.categories.push(category[0])
      }

      // Decode icon if present
      let iconFiles = null
      if (app.icon && app.icon.startsWith('data:')) {
        const icon = decodeIcon(app.icon)
        iconFiles = { icon: [icon.blob, icon.filename] }
      }

      // App
      const appResult = await getOrPost(
        '/catalog/apps/',
        { name: app.name },
        {
          name: app.name,
          level: app.level,
          category: categoryId,
          score: app.score,
          description: app.description,
          available_for_attributes: app.available_for_attributes,
        },
        iconFiles,
      )

      // Project-Packages
      try {
        await getOrPost(
          '/catalog/project-packages/',
          {
            application__id: appResult[0].id,
            project__id: project.id,
          },
          {
            application: appResult[0].id,
            packages_to_install: app.packages_to_install,
            project: project.id,
          },
        )
      } catch (err) {
        addLog(
          `Error linking packages for "${app.name}": ${err.message}`,
          'error',
        )
      }

      createdResources.applications.push(appResult[0])
      progress.value++
      addLog(`Application created: ${app.name}`, 'success')
    }
  }

  /**
   * Main import orchestrator.
   */
  const runImport = async (
    distroName,
    projectName,
    selectedDeployments,
    internalPackageFiles = {},
  ) => {
    isRunning.value = true
    error.value = null
    logs.length = 0
    progress.value = 0
    Object.keys(createdResources).forEach((key) => {
      if (Array.isArray(createdResources[key])) {
        createdResources[key].length = 0
      } else {
        createdResources[key] = null
      }
    })

    const distro = template.value.distros.find((d) => d.name === distroName)
    if (!distro) {
      error.value = `Distribution "${distroName}" not found in template`
      isRunning.value = false
      return
    }

    // Calculate total steps
    const deployments = template.value.deployments[distroName] || []
    const apps = template.value.applications || []
    totalSteps.value =
      1 + // platform
      1 + // project
      3 + // stores
      deployments.filter((d) => !d.ignored).length +
      apps.length

    try {
      addLog('Starting import process...', 'info')

      const platform = await importPlatform(distro)
      const project = await importProject(projectName, distro, platform.id)
      await importStores(project.id)
      await importDeployments(
        distroName,
        project,
        selectedDeployments,
        internalPackageFiles,
      )
      await importApplications(project)

      addLog('Import completed successfully!', 'success')
    } catch (err) {
      error.value = err.message
      addLog(`Import failed: ${err.message}`, 'error')
    } finally {
      isRunning.value = false
    }
  }

  const reset = () => {
    template.value = null
    isRunning.value = false
    currentStep.value = ''
    progress.value = 0
    totalSteps.value = 0
    logs.length = 0
    error.value = null
    Object.keys(createdResources).forEach((key) => {
      if (Array.isArray(createdResources[key])) {
        createdResources[key].length = 0
      } else {
        createdResources[key] = null
      }
    })
  }

  return {
    // State
    template,
    isRunning,
    currentStep,
    progress,
    totalSteps,
    progressPercent,
    logs,
    error,
    createdResources,

    // Actions
    loadTemplate,
    runImport,
    reset,
    importInternalDeployment,
  }
}
