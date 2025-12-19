import MigasLink from './MigasLink.vue'

export default {
  title: 'Components/MigasLink',
  component: MigasLink,
  tags: ['autodocs'],
  argTypes: {
    model: {
      control: 'select',
      options: [
        'computers',
        'projects',
        'deployments',
        'users',
        'packages',
        'stores',
      ],
      description: 'Model type for the link',
    },
    pk: {
      control: 'number',
      description: 'Primary key of the item',
    },
    value: {
      control: 'text',
      description: 'Display text',
    },
    icon: {
      control: 'text',
      description: 'Material Design icon name',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text',
    },
  },
}

export const Default = {
  args: {
    model: 'computers',
    pk: 1,
    value: 'PC-001',
  },
}

export const WithIcon = {
  args: {
    model: 'computers',
    pk: 1,
    value: 'PC-001',
    icon: 'mdi-desktop-classic',
  },
}

export const WithTooltip = {
  args: {
    model: 'projects',
    pk: 5,
    value: 'Ubuntu 22.04',
    icon: 'mdi-sitemap',
    tooltip: 'Active project with 150 computers',
  },
}

export const Deployment = {
  args: {
    model: 'deployments',
    pk: 10,
    value: 'Security Updates 2024',
    icon: 'mdi-rocket-launch',
  },
}
