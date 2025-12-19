import Header from './Header.vue'

export default {
  title: 'UI/Header',
  component: Header,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Page title',
    },
    icon: {
      control: 'text',
      description: 'Material Design icon name',
    },
    results: {
      control: 'number',
      description: 'Number of results to display',
    },
    hasExportButton: {
      control: 'boolean',
      description: 'Show export button',
    },
    hasAddButton: {
      control: 'boolean',
      description: 'Show add button',
    },
  },
}

export const Default = {
  args: {
    title: 'Page Title',
  },
}

export const WithIcon = {
  args: {
    title: 'Computers',
    icon: 'mdi-desktop-classic',
  },
}

export const WithResults = {
  args: {
    title: 'Search Results',
    icon: 'mdi-magnify',
    results: 42,
  },
}

export const WithExportButton = {
  args: {
    title: 'Data Export',
    icon: 'mdi-database',
    results: 100,
    hasExportButton: true,
  },
}

export const WithAddButton = {
  args: {
    title: 'New Item',
    icon: 'mdi-plus',
    hasAddButton: true,
  },
}

export const Complete = {
  args: {
    title: 'Full Featured Header',
    icon: 'mdi-cog',
    results: 256,
    hasExportButton: true,
    hasAddButton: true,
  },
}
