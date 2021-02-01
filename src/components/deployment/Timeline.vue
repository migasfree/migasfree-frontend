<template>
  <div>
    <q-circular-progress
      show-value
      class="text-positive q-ma-md"
      :value="data.data.schedule.percent"
      size="70px"
      :thickness="0.1"
      color="positive"
      track-color="grey-3"
    >
      <q-tooltip
        >{{ $gettext('Start') }}: {{ data.data.schedule.begin_date }}<br />{{
          $gettext('End')
        }}: {{ data.data.schedule.end_date }}</q-tooltip
      >
      <q-icon name="mdi-calendar-start" class="q-mr-xs" />
      {{ data.data.schedule.percent }} %
    </q-circular-progress>

    <q-circular-progress
      show-value
      color="positive"
      track-color="grey-3"
      size="70px"
      :thickness="0.1"
      :min="0"
      :max="data.data.computers.assigned"
      :value="data.data.computers.ok + data.data.computers.error"
    >
      <q-icon name="mdi-desktop-classic" class="q-mr-xs" />
      {{ data.data.computers.ok + data.data.computers.error }}/{{
        data.data.computers.assigned
      }}
      <q-tooltip
        >{{ $gettext('OK Computers') }}: {{ data.data.computers.ok }}<br />{{
          $gettext('Computers with any error')
        }}: {{ data.data.computers.error }}</q-tooltip
      >
    </q-circular-progress>
  </div>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    data: {
      type: Object,
      required: true
    }
  }
}
</script>
