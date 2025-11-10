<template>
  <q-linear-progress
    :size="size"
    :value="timeline.percent / 100"
    color="secondary"
  >
    <div class="absolute-full flex flex-center">
      <q-badge
        color="white"
        text-color="primary"
        :label="`${timeline.percent}%`"
      />
    </div>

    <q-tooltip>
      <q-list dense>
        <q-item>{{ $gettext('Start') }}: {{ timeline.begin_date }}</q-item>
        <q-item>{{ $gettext('End') }}: {{ timeline.end_date }}</q-item>
      </q-list>
    </q-tooltip>
  </q-linear-progress>
</template>

<script>
export default {
  name: 'ScheduleProgress',
  props: {
    timeline: {
      type: Object,
      required: true,
    },
    size: {
      type: String,
      required: false,
      default: '24px',
    },
  },
}
</script>
