<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-list v-if="moreFilters.length > 0" class="more-filters" bordered>
    <q-expansion-item
      :icon="appIcon('filter')"
      :label="$gettext('More Filters')"
      role="listitem"
    >
      <SearchFilter
        v-model="modelSearch"
        class="q-pa-sm"
        @search="$emit('search', $event)"
        @clear="$emit('search-clear')"
      />

      <div class="row q-pa-md q-col-gutter-lg">
        <div
          v-if="moreFilters.includes('platform')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.platform.selected"
            :options="tableFilters.platform.items"
            :label="$gettext('By Platform')"
            @update:model-value="$emit('filter-change', 'platform', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('project')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.project.selected"
            :options="tableFilters.project.items"
            :label="$gettext('By Project')"
            @update:model-value="$emit('filter-change', 'project', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('architecture')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.architecture.selected"
            :options="tableFilters.architecture.items"
            :label="$gettext('By Architecture')"
            @update:model-value="$emit('filter-change', 'architecture', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('serial')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-input
            v-model="tableFilters.serial"
            clearable
            :label="$gettext('By Serial Number')"
            @blur="$emit('filter-change', 'serial')"
            @keydown.enter="$event.target.blur()"
            @clear="$emit('filter-change', 'serial')"
          >
            <template #prepend>
              <div class="filter-icon-box">
                <q-icon :name="appIcon('filter')" size="18px" />
              </div>
            </template>
          </q-input>
        </div>

        <div
          v-if="moreFilters.includes('mac')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-input
            v-model="tableFilters.mac"
            clearable
            :label="$gettext('By MAC Address')"
            @blur="$emit('filter-change', 'mac')"
            @keydown.enter="$event.target.blur()"
            @clear="$emit('filter-change', 'mac')"
          >
            <template #prepend>
              <div class="filter-icon-box">
                <q-icon :name="appIcon('filter')" size="18px" />
              </div>
            </template>
          </q-input>
        </div>

        <div
          v-if="moreFilters.includes('uuid')"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-input
            v-model="tableFilters.uuid"
            clearable
            :label="$gettext('By UUID')"
            @blur="$emit('filter-change', 'uuid')"
            @keydown.enter="$event.target.blur()"
            @clear="$emit('filter-change', 'uuid')"
          >
            <template #prepend>
              <div class="filter-icon-box">
                <q-icon :name="appIcon('filter')" size="18px" />
              </div>
            </template>
          </q-input>
        </div>

        <div
          v-if="moreFilters.includes('softwareInventory')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.softwareInventory.selected"
            :options="tableFilters.softwareInventory.items"
            :label="$gettext('By Software Inventory')"
            @update:model-value="
              $emit('filter-change', 'softwareInventory', $event)
            "
          />
        </div>

        <div
          v-if="moreFilters.includes('statusIn')"
          class="col-12 col-md-4 col-sm-6"
        >
          <SelectTree
            ref="statusTree"
            v-model="tableFilters.statusIn.selected"
            :placeholder="$gettext('By Status')"
            :prepend-icon="appIcon('filter')"
            :options="tableFilters.statusIn.items"
            @select="$emit('filter-change', 'statusIn', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('machine')"
          class="col-12 col-sm-6 col-md-4"
        >
          <SelectTree
            ref="machineTree"
            v-model="tableFilters.machine.selected"
            :placeholder="$gettext('By Machine')"
            :prepend-icon="appIcon('filter')"
            :options="tableFilters.machine.items"
            @select="$emit('filter-change', 'machine', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('user')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.user.selected"
            :options="tableFilters.user.items"
            :label="$gettext('By Assignment')"
            @update:model-value="$emit('filter-change', 'user', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('startDateRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="startDateRange"
            v-model="tableFilters.startDateRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="$gettext('By Start Date (range)')"
            @select="$emit('filter-change', 'startDateRange', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('createdAtRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="createdAtRange"
            v-model="tableFilters.createdAtRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="
              model === 'syncs'
                ? $gettext('By End Date (range)')
                : $gettext('By Subscribed Date (range)')
            "
            @select="$emit('filter-change', 'createdAtRange', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('schedule')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.schedule.selected"
            :options="tableFilters.schedule.items"
            :label="$gettext('By Schedule')"
            @update:model-value="$emit('filter-change', 'schedule', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('model')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.model.selected"
            :options="tableFilters.model.items"
            :label="$gettext('By Model')"
            @update:model-value="$emit('filter-change', 'model', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('installDateRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="installDateRange"
            v-model="tableFilters.installDateRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="$gettext('By Install Date (range)')"
            @select="$emit('filter-change', 'installDateRange', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('uninstallDateRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="uninstallDateRange"
            v-model="tableFilters.uninstallDateRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="$gettext('By Uninstall Date (range)')"
            @select="$emit('filter-change', 'uninstallDateRange', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('uninstallDate')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.uninstallDate.selected"
            :options="tableFilters.uninstallDate.items"
            :label="$gettext('By Uninstall Date')"
            @update:model-value="
              $emit('filter-change', 'uninstallDate', $event)
            "
          />
        </div>

        <div
          v-if="moreFilters.includes('syncEndDateRange')"
          class="col-12 col-sm-6 col-md-4"
        >
          <DateRangeInput
            ref="syncEndDateRange"
            v-model="tableFilters.syncEndDateRange.selected"
            :prepend-icon="appIcon('filter')"
            :label="$gettext('By Last Sync Date (range)')"
            @select="$emit('filter-change', 'syncEndDateRange', $event)"
          />
        </div>

        <div
          v-if="moreFilters.includes('syncEndDate')"
          class="col-12 col-sm-6 col-md-4"
        >
          <FilterSelect
            v-model="tableFilters.syncEndDate.selected"
            :options="tableFilters.syncEndDate.items"
            :label="$gettext('By last sync date')"
            @update:model-value="$emit('filter-change', 'syncEndDate', $event)"
          />
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-12">
          <q-btn
            :icon="appIcon('filter-remove')"
            outline
            color="primary"
            :label="$gettext('Reset all filters')"
            @click="$emit('reset-filters')"
          />
        </div>
      </div>
    </q-expansion-item>
  </q-list>

  <template v-else>
    <SearchFilter
      v-model="modelSearch"
      class="q-pb-sm"
      @search="$emit('search', $event)"
      @clear="$emit('search-clear')"
    />

    <div class="row q-py-sm">
      <div class="col-12">
        <q-btn
          :icon="appIcon('filter-remove')"
          outline
          color="primary"
          :label="$gettext('Reset all filters')"
          @click="$emit('reset-filters')"
        />
      </div>
    </div>
  </template>
</template>

<script setup>
import { computed, ref } from 'vue'

/* eslint-disable vue/no-mutating-props */

import FilterSelect from 'components/ui/FilterSelect'
import SearchFilter from 'components/ui/SearchFilter'
import SelectTree from 'components/ui/SelectTree'
import DateRangeInput from 'components/ui/DateRangeInput'

import { appIcon } from 'composables/element'

defineOptions({ name: 'TableFiltersPanel' })

const props = defineProps({
  tableFilters: { type: Object, required: true },
  moreFilters: { type: Array, default: () => [] },
  model: { type: String, default: '' },
})

defineEmits(['search', 'search-clear', 'filter-change', 'reset-filters'])

const modelSearch = computed({
  get: () => props.tableFilters.search,
  set: (val) => {
    props.tableFilters.search = val
  },
})

// Expose refs for parent access
const statusTree = ref(null)
const machineTree = ref(null)

defineExpose({
  statusTree,
  machineTree,
})
</script>
