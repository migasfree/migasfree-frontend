import SearchFilter from './SearchFilter.vue'

export default {
  title: 'UI/SearchFilter',
  component: SearchFilter,
  tags: ['autodocs'],
  render: (args, { updateArgs }) => ({
    components: { SearchFilter },
    setup() {
      return { args, updateArgs }
    },
    template:
      '<SearchFilter v-bind="args" @update:model-value="val => updateArgs({ modelValue: val })" />',
  }),
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Current search text (v-model)',
    },
  },
}

export const Empty = {
  args: {
    modelValue: '',
  },
}

export const WithText = {
  args: {
    modelValue: 'search term',
  },
}

export const LongSearchTerm = {
  args: {
    modelValue: 'a very long search term that might overflow the input',
  },
}
