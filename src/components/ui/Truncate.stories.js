import Truncate from './Truncate.vue'

export default {
  title: 'UI/Truncate',
  component: Truncate,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Text to truncate',
    },
    length: {
      control: 'number',
      description: 'Maximum length before truncating',
    },
  },
}

export const ShortText = {
  args: {
    value: 'Short text',
    length: 50,
  },
}

export const LongText = {
  args: {
    value:
      'This is a very long text that will be truncated because it exceeds the maximum length',
    length: 30,
  },
}

export const VeryLongText = {
  args: {
    value:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    length: 50,
  },
}
