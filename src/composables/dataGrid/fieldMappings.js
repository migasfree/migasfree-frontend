export function fieldMappings(model) {
  return {
    // ---- direct maps ----
    application_id: 'application__id',
    attribute_id: 'attribute__id',
    attributes_id: 'attributes__id',
    attributeset_included_id: 'attributeset_included__id',
    attributeset_excluded_id: 'attributeset_excluded__id',
    available_for_attributes_id: 'available_for_attributes__id',
    available_packages_id: 'available_packages__id',
    available_package_sets_id: 'available_package_sets__id',
    capability_id: 'capability__id',
    'capability.name': 'capability__id',
    category: 'category__id',
    category_id: 'category__id',
    'category.name': 'category__id',
    'computer.__str__': 'computer__name__icontains',
    computer_id: 'computer__id',
    connections_id: 'connections__id',
    'connection.name': 'connection__id',
    default_logical_device_id: 'default_logical_device__id',
    deployment: 'deployment__isnull',
    deployment_id: 'deployment__id',
    deployment_included_id: 'deployment_included__id',
    deployment_excluded_id: 'deployment_excluded__id',
    device_id: 'device__id',
    device_type_id: 'device_type__id',
    'device_type.name': 'device_type__id',
    domain_included_id: 'domain_included__id',
    domain_excluded_id: 'domain_excluded__id',
    domain_tags_id: 'domain_tags__id',
    domains_id: 'domains__id',
    drivers_project_id: 'drivers__project__id',
    excluded_attributes_id: 'excluded_attributes__id',
    faultdefinition_id: 'faultdefinition__id',
    faultdefinition_included_id: 'faultdefinition_included__id',
    faultdefinition_excluded_id: 'faultdefinition_excluded__id',
    faultdefinition_users_id: 'faultdefinition_users__id',
    'fault_definition.name': 'fault_definition_id',
    id_in: 'id__in',
    included_attributes_id: 'included_attributes__id',
    level: 'level',
    'level.name': 'level',
    logical_id: 'logical__id',
    'manufacturer.name': 'manufacturer__id',
    model: 'device__model__id',
    'model.manufacturer.name': 'model__manufacturer__id',
    model_id: 'model__id',
    'model.name': 'model__id',
    'package.project.name': 'package__project__id',
    package_id: 'package__id',
    packages: 'packages__isnull',
    packages_id: 'packages__id',
    packageset: 'packageset__isnull',
    packageset_id: 'packageset__id',
    packages_by_project_project_id: 'packages_by_project__project__id',
    'platform.name': 'platform__id',
    policy_included_id: 'policy_included__id',
    policy_excluded_id: 'policy_excluded__id',
    project_id: 'project__id',
    'project.name': 'project__id',
    property_att: 'property_att__id',
    schedule: 'schedule__isnull',
    schedule_id: 'schedule__id',
    'schedule.name': 'schedule__id',
    singularity_id: 'singularity__id',
    singularity_included_id: 'singularity_included__id',
    singularity_excluded_id: 'singularity_excluded__id',
    scope_included_id: 'scope_included__id',
    scope_excluded_id: 'scope_excluded__id',
    store: 'store__isnull',
    'store.name': 'store__id',
    sync_attributes_id: 'sync_attributes__id',
    sync_attributes_id_in: 'sync_attributes__id__in',
    sync_user_id: 'sync_user__id',
    tags_id: 'tags__id',
    uninstall_date: 'uninstall_date__isnull',
    user_id: 'user__id',
    users_id: 'users__id',

    // ---- cases with own logic ----
    platform: (_key, val) => {
      if (model.value === 'computers') return { ['platform']: val }
      if (model.value === 'projects') return { platform__id: val }
      return { project__platform__id: val }
    },

    status: (_key, val) => ({
      ...(model.value === 'computers' || model.value === 'status-logs'
        ? { status__in: val }
        : { computer__status__in: val }),
    }),

    status_in: (_key, val) => ({
      ...(model.value === 'computers' || model.value === 'status-logs'
        ? { status__in: val }
        : { computer__status__in: val }),
    }),

    status__in: (_key, val) => ({
      ...(model.value === 'computers' || model.value === 'status-logs'
        ? { status__in: val }
        : { computer__status__in: val }),
    }),

    mac: (_key, val) => ({
      mac_address: typeof val === 'string' ? val.replaceAll(':', '') : val,
    }),

    sync_end_date: (_key, val) => {
      if (val === 0) return { sync_end_date__isnull: true }
      const d = new Date()
      d.setDate(d.getDate() - val)
      return { sync_end_date__lt: d.toISOString() }
    },

    // ---- generic filters ----
    __default: (key, val) => {
      if (typeof key !== 'string' || key === '') return {}

      const specialCases = [
        'architecture',
        'auto_register_computers',
        'checked',
        'enabled',
        'exclusive',
        'has_software_inventory',
        'installed_package',
        'is_active',
        'kind',
        'language',
        'machine',
        'page',
        'page_size',
        'pms_status_ok',
        'product_system',
        'search',
        'serial',
        'score',
        'source',
        'sort',
        'total_computers',
        'user',
        'platform_id',
      ]

      // operators who should **not** receive __icontains
      const rangeOperators = [
        '__gte',
        '__gt',
        '__lte',
        '__lt',
        '__in',
        '__isnull',
      ]
      const hasRangeOperator = rangeOperators.some((op) => key.endsWith(op))

      // if it has any of those operators or in specialCases, we return the key as is
      if (hasRangeOperator || specialCases.includes(key)) {
        return { [key]: val }
      }

      // generic case
      const paramName = `${key.replace(/\./g, '__')}__icontains`
      return { [paramName]: val }
    },
  }
}
