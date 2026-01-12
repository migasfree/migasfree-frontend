import DayInput from './DayInput.vue'

export default {
  title: 'UI/DayInput',
  component: DayInput,
  tags: ['autodocs'],
  render: (args, { updateArgs }) => ({
    components: { DayInput },
    setup() {
      return { args, updateArgs }
    },
    template:
      '<DayInput v-bind="args" @update:model-value="val => updateArgs({ modelValue: val })" />',
  }),
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Selected date in YYYY-MM-DD format (v-model)',
    },
    label: {
      control: 'text',
      description: 'Input label',
    },
    readonly: {
      control: 'boolean',
      description: 'If true, input text is readonly (date picker still works)',
    },
    dense: {
      control: 'boolean',
      description: 'Dense mode for the input',
    },
  },
}

export const Empty = {
  args: {
    modelValue: '',
    label: 'Select a date',
    readonly: true,
    dense: true,
  },
}

export const WithDate = {
  args: {
    modelValue: '2025-12-25',
    label: 'Christmas',
    readonly: true,
    dense: true,
  },
}

export const WithLabel = {
  args: {
    modelValue: '',
    label: 'Start Date',
    readonly: true,
    dense: false,
  },
}
