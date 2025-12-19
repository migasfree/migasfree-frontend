import DateDiff from './DateDiff.vue'

export default {
  title: 'Components/DateDiff',
  component: DateDiff,
  tags: ['autodocs'],
  argTypes: {
    begin: {
      control: 'text',
      description: 'Start date (ISO string)',
    },
    end: {
      control: 'text',
      description: 'End date (ISO string)',
    },
  },
}

// Calculate dates relative to now for demo
const now = new Date()
const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString()
const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

export const OneHour = {
  args: {
    begin: oneHourAgo,
    end: now.toISOString(),
  },
}

export const OneDay = {
  args: {
    begin: oneDayAgo,
    end: now.toISOString(),
  },
}

export const OneWeek = {
  args: {
    begin: oneWeekAgo,
    end: now.toISOString(),
  },
}

export const Custom = {
  args: {
    begin: '2024-01-01T00:00:00Z',
    end: '2024-01-01T02:30:45Z',
  },
}
