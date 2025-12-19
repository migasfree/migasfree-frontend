import DateView from './DateView.vue'

export default {
  title: 'UI/DateView',
  component: DateView,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'ISO date string to display',
    },
    icon: {
      control: 'text',
      description: 'Material Design icon name',
    },
    tooltipText: {
      control: 'text',
      description: 'Tooltip text to show',
    },
  },
}

export const Default = {
  args: {
    value: '2024-12-19T14:30:00Z',
  },
}

export const WithIcon = {
  args: {
    value: '2024-12-19T14:30:00Z',
    icon: 'mdi-calendar',
  },
}

export const WithTooltip = {
  args: {
    value: '2024-12-19T14:30:00Z',
    icon: 'mdi-calendar-plus',
    tooltipText: 'Created date',
  },
}

export const DateOnly = {
  args: {
    value: '2024-12-19',
    icon: 'mdi-calendar-today',
  },
}
