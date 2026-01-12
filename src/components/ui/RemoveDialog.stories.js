import RemoveDialog from './RemoveDialog.vue'

export default {
  title: 'UI/RemoveDialog',
  component: RemoveDialog,
  tags: ['autodocs'],
  render: (args, { updateArgs }) => ({
    components: { RemoveDialog },
    setup() {
      const close = () => updateArgs({ modelValue: false })
      return { args, close }
    },
    template:
      '<RemoveDialog v-bind="args" @canceled="close" @confirmed="close" />',
  }),
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'Controls dialog visibility (v-model)',
    },
    message: {
      control: 'text',
      description: 'Custom confirmation message',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A confirmation dialog for delete actions. Emits "confirmed" or "canceled" events.',
      },
    },
  },
}

export const Open = {
  args: {
    modelValue: true,
    message: '',
  },
}

export const CustomMessage = {
  args: {
    modelValue: true,
    message:
      'Are you sure you want to delete this user account? This action cannot be undone.',
  },
}

export const Closed = {
  args: {
    modelValue: false,
    message: '',
  },
}
