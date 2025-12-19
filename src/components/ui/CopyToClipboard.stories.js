import CopyToClipboard from './CopyToClipboard.vue'

export default {
  title: 'UI/CopyToClipboard',
  component: CopyToClipboard,
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Content to copy to clipboard',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Button size',
    },
    flat: {
      control: 'boolean',
      description: 'Flat button style',
    },
    round: {
      control: 'boolean',
      description: 'Round button style',
    },
  },
}

export const Default = {
  args: {
    content: 'Text to copy',
  },
}

export const Small = {
  args: {
    content: 'Small copy button',
    size: 'sm',
  },
}

export const Large = {
  args: {
    content: 'Large copy button',
    size: 'lg',
  },
}

export const FlatStyle = {
  args: {
    content: 'Flat style button',
    flat: true,
  },
}
