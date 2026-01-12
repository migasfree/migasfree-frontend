import ToggleFullScreen from './ToggleFullScreen.vue'

export default {
  title: 'UI/ToggleFullScreen',
  component: ToggleFullScreen,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A button that toggles fullscreen mode. Only visible on screens larger than small.',
      },
    },
  },
}

export const Default = {
  render: () => ({
    components: { ToggleFullScreen },
    template: '<ToggleFullScreen />',
  }),
}
