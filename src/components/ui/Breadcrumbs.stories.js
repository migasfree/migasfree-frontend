import Breadcrumbs from './Breadcrumbs.vue'

export default {
  title: 'UI/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of breadcrumb items',
    },
  },
}

export const Default = {
  args: {
    items: [
      { text: 'Home', to: 'home', icon: 'mdi-home' },
      { text: 'Products', to: 'products', icon: 'mdi-package' },
      { text: 'Detail', icon: 'mdi-information' },
    ],
  },
}

export const Empty = {
  args: {
    items: [],
  },
}

export const SingleItem = {
  args: {
    items: [{ text: 'Dashboard', to: 'home', icon: 'mdi-view-dashboard' }],
  },
}
