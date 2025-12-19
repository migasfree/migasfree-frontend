import SearchBox from './SearchBox.vue'

export default {
  title: 'UI/SearchBox',
  component: SearchBox,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Search input value (v-model)',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
    },
    debounce: {
      control: 'number',
      description: 'Debounce delay in milliseconds',
    },
  },
}

export const Default = {
  args: {
    modelValue: '',
    placeholder: 'Search...',
  },
}

export const WithValue = {
  args: {
    modelValue: 'computer',
    placeholder: 'Search...',
  },
}

export const CustomPlaceholder = {
  args: {
    modelValue: '',
    placeholder: 'Type to search computers...',
  },
}

export const WithDebounce = {
  args: {
    modelValue: '',
    placeholder: 'Search with 500ms debounce',
    debounce: 500,
  },
}
