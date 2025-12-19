import BooleanView from './BooleanView.vue'

export default {
  title: 'UI/BooleanView',
  component: BooleanView,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'boolean',
      description: 'Boolean value to display',
    },
  },
}

export const True = {
  args: {
    value: true,
  },
}

export const False = {
  args: {
    value: false,
  },
}
