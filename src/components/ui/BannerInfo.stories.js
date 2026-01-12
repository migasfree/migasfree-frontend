import BannerInfo from './BannerInfo.vue'

export default {
  title: 'UI/BannerInfo',
  component: BannerInfo,
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Information message to display',
    },
  },
}

export const Default = {
  args: {
    message: 'This is an informational message for the user.',
  },
}

export const LongMessage = {
  args: {
    message:
      'This is a longer informational message that provides more details about the current situation. It might contain important instructions or context that the user needs to be aware of.',
  },
}

export const ShortMessage = {
  args: {
    message: 'Quick tip!',
  },
}
