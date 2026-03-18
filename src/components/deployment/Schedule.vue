<template>
  <q-card class="panel">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-primary">
        {{ $gettext('When (schedule)') }}
      </div>

      <div class="row q-col-gutter-sm q-py-md">
        <div
          :class="
            element.timeline
              ? 'col-md-3 col-sm-3'
              : 'col-md-4 col-sm-4 text-right'
          "
        >
          <DayInput
            :model-value="element.start_date"
            :readonly="false"
            :label="$gettext('Start Date')"
            :dense="false"
            @update:model-value="updateElement('start_date', $event)"
          />
        </div>

        <div
          :class="
            element.timeline ? 'col-md-3 col-sm-3' : 'col-md-4 col-sm-4'
          "
        >
          <EntitySelect
            :model-value="element.schedule"
            :options="schedules"
            :label="$gettext('Schedule')"
            clearable
            detail-route="schedule-detail"
            add-route="schedule-add"
            :add-tooltip="$gettext('Add Schedule')"
            :prepend-icon="modelIcon('schedules')"
            @update:model-value="updateSchedule"
            @clear="clearSchedule"
          />
        </div>

        <div
          :class="
            element.timeline
              ? 'col-md-3 col-sm-3'
              : 'col-md-4 col-sm-4 text-right'
          "
        >
          <q-checkbox
            :model-value="element.auto_restart"
            left-label
            :label="$gettext('Auto Restart?')"
            :aria-label="$gettext('Auto Restart?')"
            @update:model-value="updateElement('auto_restart', $event)"
          />
        </div>

        <div
          v-if="element.id && element.timeline"
          class="col-md-3 col-sm-3"
        >
          <q-field outlined :label="$gettext('Timeline')" stack-label>
            <template #control>
              <Timeline :id="element.id" :model-value="element.timeline" @update:model-value="updateElement('timeline', $event)" />
            </template>
          </q-field>
        </div>
      </div>

      <div v-if="element.id && element.schedule" class="row">
        <div v-if="element.stats" class="col-12 col-md col-sm">
          <StackedBarChart
            :title="$gettext('Provided Computers / Delay')"
            :initial-data="element.stats"
            borderless
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import EntitySelect from 'components/ui/EntitySelect'
import DayInput from 'components/ui/DayInput'
import Timeline from 'components/deployment/Timeline'
import StackedBarChart from 'components/chart/StackedBar'
import { modelIcon } from 'composables/element'

defineOptions({ name: 'DeploymentSchedule' })

defineProps({
  element: { type: Object, required: true },
  schedules: { type: Array, required: true },
})

const emit = defineEmits(['update-element', 'update-schedule'])
const { $gettext } = useGettext()

const updateElement = (key, value) => {
  emit('update-element', key, value)
}

const updateSchedule = (value) => {
  updateElement('schedule', value)
  emit('update-schedule')
}

const clearSchedule = () => {
  updateElement('schedule', null)
  updateElement('stats', {})
}
</script>
