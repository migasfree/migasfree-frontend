import OverflowList from './OverflowList.vue'

export default {
  title: 'UI/OverflowList',
  component: OverflowList,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the list header',
    },
    icon: {
      control: 'text',
      description: 'Icon for the expansion item',
    },
    items: {
      control: 'object',
      description: 'Array of items to display',
    },
    model: {
      control: 'text',
      description: 'Model name for link generation',
    },
  },
}

export const SimpleList = {
  args: {
    label: 'Items',
    icon: 'mdi-format-list-bulleted',
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
    model: '',
  },
}

export const WithLinks = {
  args: {
    label: 'Attributes',
    icon: 'mdi-tag-multiple',
    items: [
      { id: 1, value: 'First Item', icon: 'mdi-tag' },
      { id: 2, value: 'Second Item', icon: 'mdi-tag' },
      { id: 3, value: 'Third Item', icon: 'mdi-tag' },
    ],
    model: 'attributes',
  },
}

export const Empty = {
  args: {
    label: 'Empty List',
    icon: 'mdi-folder-outline',
    items: [],
    model: '',
  },
}

export const ManyItems = {
  args: {
    label: 'Large Dataset',
    icon: 'mdi-database',
    items: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      value: `Item ${i + 1}`,
      icon: 'mdi-circle',
    })),
    model: 'features',
  },
}
