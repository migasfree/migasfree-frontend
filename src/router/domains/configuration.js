export default [
  {
    path: '/platforms',
    redirect: { name: 'platforms-list' },
  },
  {
    path: '/platforms/results',
    name: 'platforms-list',
    component: () => import('pages/configuration/platforms/results/list'),
  },
  {
    path: '/platforms/add',
    name: 'platform-add',
    component: () => import('pages/configuration/platforms/results/detail'),
  },
  {
    path: '/platforms/results/:id',
    name: 'platform-detail',
    component: () => import('pages/configuration/platforms/results/detail'),
  },

  {
    path: '/projects',
    redirect: { name: 'projects-list' },
  },
  {
    path: '/projects/results',
    name: 'projects-list',
    component: () => import('pages/configuration/projects/results/list'),
  },
  {
    path: '/projects/add',
    name: 'project-add',
    component: () => import('pages/configuration/projects/results/detail'),
  },
  {
    path: '/projects/results/:id',
    name: 'project-detail',
    component: () => import('pages/configuration/projects/results/detail'),
  },

  {
    path: '/formulas',
    redirect: { name: 'formulas-list' },
  },
  {
    path: '/formulas/results',
    name: 'formulas-list',
    component: () => import('pages/configuration/formulas/results/list'),
  },
  {
    path: '/formulas/add',
    name: 'formula-add',
    component: () => import('pages/configuration/formulas/results/detail'),
  },
  {
    path: '/formulas/results/:id',
    name: 'formula-detail',
    component: () => import('pages/configuration/formulas/results/detail'),
  },

  {
    path: '/singularities',
    redirect: { name: 'singularities-list' },
  },
  {
    path: '/singularities/results',
    name: 'singularities-list',
    component: () => import('pages/configuration/singularities/results/list'),
  },
  {
    path: '/singularities/add',
    name: 'singularity-add',
    component: () => import('pages/configuration/singularities/results/detail'),
  },
  {
    path: '/singularities/results/:id',
    name: 'singularity-detail',
    component: () => import('pages/configuration/singularities/results/detail'),
  },

  {
    path: '/stamps',
    redirect: { name: 'stamps-list' },
  },
  {
    path: '/stamps/results',
    name: 'stamps-list',
    component: () => import('pages/configuration/stamps/results/list'),
  },
  {
    path: '/stamps/add',
    name: 'stamp-add',
    component: () => import('pages/configuration/stamps/results/detail'),
  },
  {
    path: '/stamps/results/:id',
    name: 'stamp-detail',
    component: () => import('pages/configuration/stamps/results/detail'),
  },

  {
    path: '/attribute-sets',
    redirect: { name: 'attribute-sets-list' },
  },
  {
    path: '/attribute-sets/results',
    name: 'attribute-sets-list',
    component: () => import('pages/configuration/attribute-sets/results/list'),
  },
  {
    path: '/attribute-sets/add',
    name: 'attribute-set-add',
    component: () =>
      import('pages/configuration/attribute-sets/results/detail'),
  },
  {
    path: '/attribute-sets/results/:id',
    name: 'attribute-set-detail',
    component: () =>
      import('pages/configuration/attribute-sets/results/detail'),
  },

  {
    path: '/fault-definitions',
    redirect: { name: 'fault-definitions-list' },
  },
  {
    path: '/fault-definitions/results',
    name: 'fault-definitions-list',
    component: () =>
      import('pages/configuration/fault-definitions/results/list'),
  },
  {
    path: '/fault-definitions/add',
    name: 'fault-definition-add',
    component: () =>
      import('pages/configuration/fault-definitions/results/detail'),
  },
  {
    path: '/fault-definitions/results/:id',
    name: 'fault-definition-detail',
    component: () =>
      import('pages/configuration/fault-definitions/results/detail'),
  },

  {
    path: '/user-profiles',
    redirect: { name: 'user-profiles-list' },
  },
  {
    path: '/user-profiles/results',
    name: 'user-profiles-list',
    component: () => import('pages/configuration/user-profiles/results/list'),
  },
  {
    path: '/user-profiles/add',
    name: 'user-profile-add',
    component: () => import('pages/configuration/user-profiles/results/detail'),
  },
  {
    path: '/user-profiles/results/:id',
    name: 'user-profile-detail',
    component: () => import('pages/configuration/user-profiles/results/detail'),
  },
  {
    path: '/user-profiles/results/:id/change-password',
    name: 'user-profile-change-password',
    component: () =>
      import('pages/configuration/user-profiles/results/changePassword'),
  },

  {
    path: '/groups',
    redirect: { name: 'groups-list' },
  },
  {
    path: '/groups/results',
    name: 'groups-list',
    component: () => import('pages/configuration/groups/results/list'),
  },
  {
    path: '/groups/add',
    name: 'group-add',
    component: () => import('pages/configuration/groups/results/detail'),
  },
  {
    path: '/groups/results/:id',
    name: 'group-detail',
    component: () => import('pages/configuration/groups/results/detail'),
  },

  {
    path: '/domains',
    redirect: { name: 'domains-list' },
  },
  {
    path: '/domains/results',
    name: 'domains-list',
    component: () => import('pages/configuration/domains/results/list'),
  },
  {
    path: '/domains/add',
    name: 'domain-add',
    component: () => import('pages/configuration/domains/results/detail'),
  },
  {
    path: '/domains/results/:id',
    name: 'domain-detail',
    component: () => import('pages/configuration/domains/results/detail'),
  },

  {
    path: '/scopes',
    redirect: { name: 'scopes-list' },
  },
  {
    path: '/scopes/results',
    name: 'scopes-list',
    component: () => import('pages/configuration/scopes/results/list'),
  },
  {
    path: '/scopes/add',
    name: 'scope-add',
    component: () => import('pages/configuration/scopes/results/detail'),
  },
  {
    path: '/scopes/results/:id',
    name: 'scope-detail',
    component: () => import('pages/configuration/scopes/results/detail'),
  },

  {
    path: '/schedules',
    redirect: { name: 'schedules-list' },
  },
  {
    path: '/schedules/results',
    name: 'schedules-list',
    component: () => import('pages/configuration/schedules/results/list'),
  },
  {
    path: '/schedules/add',
    name: 'schedule-add',
    component: () => import('pages/configuration/schedules/results/detail'),
  },
  {
    path: '/schedules/results/:id',
    name: 'schedule-detail',
    component: () => import('pages/configuration/schedules/results/detail'),
  },

  {
    path: '/policies',
    redirect: { name: 'policies-list' },
  },
  {
    path: '/policies/results',
    name: 'policies-list',
    component: () => import('pages/configuration/policies/results/list'),
  },
  {
    path: '/policies/add',
    name: 'policy-add',
    component: () => import('pages/configuration/policies/results/detail'),
  },
  {
    path: '/policies/results/:id',
    name: 'policy-detail',
    component: () => import('pages/configuration/policies/results/detail'),
  },
]
