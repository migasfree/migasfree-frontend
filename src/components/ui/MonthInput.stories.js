import MonthInput from './MonthInput.vue'

export default {
  title: 'UI/MonthInput',
  component: MonthInput,
  tags: ['autodocs'],
  render: (args, { updateArgs }) => ({
    components: { MonthInput },
    setup() {
      return { args, updateArgs }
    },
    template:
      '<MonthInput v-bind="args" @update:model-value="val => updateArgs({ modelValue: val })" />',
  }),
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Selected month in YYYY-MM format (v-model)',
    },
    label: {
      control: 'text',
      description: 'Input label',
    },
  },
}

export const Empty = {
  args: {
    modelValue: '',
    label: 'Select a month',
  },
}

export const WithMonth = {
  args: {
    modelValue: '2025-12',
    label: 'Billing Month',
  },
}

export const CurrentMonth = {
  args: {
    modelValue: new Date().toISOString().slice(0, 7),
    label: 'Current Period',
  },
}
