import Truncate from './Truncate.vue'

export default {
  title: 'UI/Truncate',
  component: Truncate,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Text to truncate',
    },
    len: {
      control: 'number',
      description: 'Maximum length before truncating',
    },
    formatted: {
      control: 'boolean',
      description: 'Whether to display as preformatted text',
    },
  },
}

export const ShortText = {
  args: {
    modelValue: 'Short text',
    len: 50,
    formatted: true,
  },
}

export const LongText = {
  args: {
    modelValue:
      'This is a very long text that will be truncated because it exceeds the maximum length',
    len: 30,
    formatted: true,
  },
}

export const VeryLongText = {
  args: {
    modelValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    len: 50,
    formatted: true,
  },
}

export const HTMLContent = {
  args: {
    modelValue:
      '<p>This is <strong>HTML content</strong> that can be truncated properly.</p><p>Second paragraph here.</p>',
    len: 40,
    formatted: false,
  },
}
