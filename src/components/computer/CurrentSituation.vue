<template>
  <q-card class="current-situation-card shadow-2 rounded-borders">
    <q-card-section class="q-pb-none">
      <div
        class="text-h6 text-weight-bold q-mb-md"
        :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'"
      >
        {{ $gettext('Current Situation') }}
      </div>

      <q-select
        v-model="localStatus"
        class="q-my-md"
        emit-value
        map-options
        :label="$gettext('Status')"
        :options="statusOptions"
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-icon :name="scope.opt.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>

        <template #selected-item="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-icon :name="scope.opt.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-input
        v-model="localComment"
        class="q-my-md"
        type="textarea"
        :label="$gettext('Comment')"
      />

      <FilteredMultiSelect
        v-model="localTags"
        :label="$gettext('Tags')"
        :fetch-options="filterTags"
      >
        <template #option="{ scope }">
          <q-item v-bind="scope.itemProps">
            {{ attributeValue(scope.opt) }}
          </q-item>
        </template>

        <template #selected-item="{ scope }">
          <q-chip
            removable
            dense
            :tabindex="scope.tabindex"
            class="q-ma-md"
            @remove="scope.removeAtIndex(scope.index)"
          >
            <MigasLink
              model="tags"
              :pk="scope.opt.id"
              :value="attributeValue(scope.opt)"
              :tooltip="scope.opt.description"
            />
          </q-chip>
        </template>
      </FilteredMultiSelect>

      <OverflowList
        class="q-mt-md"
        model="attribute-sets"
        :label="$gettext('Attribute Sets')"
        :items="attributeSets"
      />

      <OverflowList
        class="q-mt-md"
        model="domains"
        :label="$gettext('Domains')"
        :items="domains"
      />

      <div class="row q-mt-md q-col-gutter-md">
        <!-- Errors Mini-Card -->
        <div class="col-12 col-sm-6">
          <div
            class="counter-card q-pa-md rounded-borders"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
          >
            <div class="row items-center q-mb-md">
              <q-icon
                :name="modelIcon('errors')"
                size="md"
                :color="errors.unchecked > 0 ? 'negative' : 'grey'"
                class="q-mr-sm"
              />
              <span
                class="text-h6 text-weight-bold"
                :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'"
              >
                {{ $gettext('Errors') }}
              </span>
            </div>
            <div class="column q-gutter-sm">
              <router-link
                :to="{
                  name: 'errors-list',
                  query: { computer_id: cid, checked: false },
                }"
                class="counter-row q-pa-sm rounded-borders text-decoration-none"
                :class="errors.unchecked > 0 ? 'counter-row--alert' : ''"
              >
                <q-icon
                  name="mdi-alert-circle"
                  size="sm"
                  :color="errors.unchecked > 0 ? 'negative' : 'grey'"
                  class="q-mr-sm"
                />
                <strong class="text-subtitle1">{{ errors.unchecked }}</strong>
                <span class="q-ml-sm">{{ $gettext('Unchecked') }}</span>
              </router-link>
              <router-link
                :to="{
                  name: 'errors-list',
                  query: { computer_id: cid },
                }"
                class="counter-row q-pa-sm rounded-borders text-decoration-none"
              >
                <q-icon
                  name="mdi-format-list-bulleted"
                  size="sm"
                  color="grey"
                  class="q-mr-sm"
                />
                <strong class="text-subtitle1">{{ errors.total }}</strong>
                <span class="q-ml-sm">{{ $gettext('Total') }}</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Faults Mini-Card -->
        <div class="col-12 col-sm-6">
          <div
            class="counter-card q-pa-md rounded-borders"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
          >
            <div class="row items-center q-mb-md">
              <q-icon
                :name="modelIcon('faults')"
                size="md"
                :color="faults.unchecked > 0 ? 'negative' : 'grey'"
                class="q-mr-sm"
              />
              <span
                class="text-h6 text-weight-bold"
                :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'"
              >
                {{ $gettext('Faults') }}
              </span>
            </div>
            <div class="column q-gutter-sm">
              <router-link
                :to="{
                  name: 'faults-list',
                  query: { computer_id: cid, checked: false },
                }"
                class="counter-row q-pa-sm rounded-borders text-decoration-none"
                :class="faults.unchecked > 0 ? 'counter-row--alert' : ''"
              >
                <q-icon
                  name="mdi-alert-circle"
                  size="sm"
                  :color="faults.unchecked > 0 ? 'negative' : 'grey'"
                  class="q-mr-sm"
                />
                <strong class="text-subtitle1">{{ faults.unchecked }}</strong>
                <span class="q-ml-sm">{{ $gettext('Unchecked') }}</span>
              </router-link>
              <router-link
                :to="{
                  name: 'faults-list',
                  query: { computer_id: cid },
                }"
                class="counter-row q-pa-sm rounded-borders text-decoration-none"
              >
                <q-icon
                  name="mdi-format-list-bulleted"
                  size="sm"
                  color="grey"
                  class="q-mr-sm"
                />
                <strong class="text-subtitle1">{{ faults.total }}</strong>
                <span class="q-ml-sm">{{ $gettext('Total') }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-actions class="q-px-md q-pb-md q-mt-lg">
      <q-btn
        class="full-width"
        color="primary"
        :icon="appIcon('save-edit')"
        :label="$gettext('Save and continue editing')"
        :loading="loading"
        :disabled="loading"
        @click="save"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue'
import { useGettext } from 'vue3-gettext'

import { api } from 'boot/axios'
import { useUiStore } from 'stores/ui'

import OverflowList from 'components/ui/OverflowList'
import FilteredMultiSelect from 'components/ui/FilteredMultiSelect'
import MigasLink from 'components/MigasLink'

import { appIcon, modelIcon, useElement } from 'composables/element'

export default {
  name: 'ComputerCurrentSituation',
  components: {
    OverflowList,
    FilteredMultiSelect,
    MigasLink,
  },
  props: {
    cid: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: '',
    },
    comment: {
      type: String,
      default: '',
    },
    tags: {
      type: Array,
      default: () => [],
    },
    attributeSets: {
      type: Array,
      default: () => [],
    },
    domains: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['updated'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const uiStore = useUiStore()
    const { elementIcon, attributeValue } = useElement()

    const loading = ref(false)
    const statusOptions = ref([])
    const errors = reactive({ unchecked: 0, total: 0 })
    const faults = reactive({ unchecked: 0, total: 0 })

    const localStatus = ref(props.status)
    const localComment = ref(props.comment)
    const localTags = ref([...props.tags])

    // Sync props to local state
    watch(
      () => props.status,
      (val) => {
        localStatus.value = val
      },
    )
    watch(
      () => props.comment,
      (val) => {
        localComment.value = val
      },
    )
    watch(
      () => props.tags,
      (val) => {
        localTags.value = [...val]
      },
    )

    const getComputerStatus = async () => {
      try {
        const response = await api.get('/api/v1/token/computers/status/')
        const { choices } = response.data

        Object.entries(choices).forEach(([key, val]) => {
          statusOptions.value.push({
            label: val,
            value: key,
            icon: elementIcon(key),
          })
        })
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const loadErrors = async () => {
      try {
        const { data } = await api.get(
          `/api/v1/token/computers/${props.cid}/errors/`,
        )
        Object.assign(errors, data)
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const loadFaults = async () => {
      try {
        const { data } = await api.get(
          `/api/v1/token/computers/${props.cid}/faults/`,
        )
        Object.assign(faults, data)
      } catch (error) {
        uiStore.notifyError(error)
      }
    }

    const filterTags = async (val) => {
      const { data } = await api.get('/api/v1/token/tags/', {
        params: { search: val.toLowerCase() },
      })

      return data.results
    }

    const save = async () => {
      loading.value = true
      try {
        await api.patch(`/api/v1/token/computers/${props.cid}/`, {
          status: localStatus.value,
          comment: localComment.value,
          tags: localTags.value.map((item) => item.id),
        })
        uiStore.notifySuccess($gettext('Current Situation has been changed!'))
        emit('updated', {
          status: localStatus.value,
          comment: localComment.value,
          tags: localTags.value,
        })
      } catch (error) {
        uiStore.notifyError(error)
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await Promise.all([getComputerStatus(), loadErrors(), loadFaults()])
    })

    return {
      loading,
      statusOptions,
      errors,
      faults,
      localStatus,
      localComment,
      localTags,
      filterTags,
      save,
      attributeValue,
      appIcon,
      modelIcon,
    }
  },
}
</script>

<style scoped>
.current-situation-card {
  max-width: 1000px;
  margin: auto;
}

/* Counter mini-cards */
.counter-card {
  border: 1px solid rgba(128, 128, 128, 0.2);
}
.counter-row {
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
  color: inherit;
}
.counter-row:hover {
  background-color: rgba(128, 128, 128, 0.15);
}
.counter-row--alert {
  background-color: rgba(198, 40, 40, 0.1);
}
.counter-row--alert:hover {
  background-color: rgba(198, 40, 40, 0.2);
}
.text-decoration-none {
  text-decoration: none;
}
</style>
