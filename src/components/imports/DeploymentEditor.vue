<template>
  <q-card flat bordered class="q-mb-md">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold q-mb-sm flex items-center">
        <q-icon :name="modelIcon('deployments')" class="q-mr-xs" />
        {{ $gettext('Deployments') }}
        <q-badge color="primary" class="q-ml-sm">
          {{ selectedNames.length }}/{{ deployments.length }}
        </q-badge>
        <q-space />
        <q-btn
          flat
          dense
          round
          :icon="editing ? 'mdi-check-circle' : 'mdi-pencil-outline'"
          :color="editing ? 'positive' : 'primary'"
          @click="$emit('update:editing', !editing)"
        >
          <q-tooltip>{{
            editing ? $gettext('Finish editing') : $gettext('Edit deployments')
          }}</q-tooltip>
        </q-btn>
      </div>

      <!-- Read-only list -->
      <q-list v-if="!editing">
        <q-item v-for="dep in deployments" :key="dep.name" tag="label">
          <q-item-section side>
            <q-checkbox
              :model-value="selectedNames"
              :val="dep.name"
              color="primary"
              @update:model-value="$emit('update:selected-names', $event)"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ dep.name }}</q-item-label>
            <q-item-label caption>
              {{
                dep.source === 'E' ? $gettext('External') : $gettext('Internal')
              }}
              <template v-if="dep.source === 'E'">
                · {{ dep.base_url }}
              </template>
              <template v-if="dep.source === 'I'">
                · {{ $gettext('Store') }}: {{ dep.store }}
              </template>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="dep.enabled ? 'positive' : 'grey'"
              :label="dep.enabled ? $gettext('Enabled') : $gettext('Disabled')"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Editable list -->
      <div v-else>
        <q-expansion-item
          v-for="(dep, index) in deployments"
          :key="dep.name + index"
          :label="dep.name"
          :caption="
            dep.source === 'E' ? $gettext('External') : $gettext('Internal')
          "
          group="deployments"
          header-class="text-weight-medium"
        >
          <q-card flat>
            <q-card-section class="q-gutter-sm">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="dep.name"
                    :label="$gettext('Name')"
                    dense
                    outlined
                  />
                </div>
                <div class="col-6 col-md-3">
                  <q-select
                    v-model="dep.source"
                    :options="sourceOptions"
                    :label="$gettext('Source')"
                    emit-value
                    map-options
                    dense
                    outlined
                  />
                </div>
                <div class="col-6 col-md-3">
                  <q-toggle
                    v-model="dep.enabled"
                    :label="$gettext('Enabled')"
                  />
                </div>
              </div>

              <template v-if="dep.source === 'E'">
                <q-input
                  v-model="dep.base_url"
                  :label="$gettext('Base URL')"
                  dense
                  outlined
                />
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="dep.suite"
                      :label="$gettext('Suite')"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="dep.components"
                      :label="$gettext('Components')"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="dep.options"
                      :label="$gettext('Options')"
                      dense
                      outlined
                    />
                  </div>
                </div>
              </template>

              <template v-if="dep.source === 'I'">
                <q-input
                  v-model="dep.store"
                  :label="$gettext('Store')"
                  dense
                  outlined
                />
                <q-input
                  v-model="dep.packages_to_install_text"
                  :label="$gettext('Packages to Install')"
                  type="textarea"
                  dense
                  outlined
                  autogrow
                  hint="One per line"
                />
              </template>

              <q-btn
                flat
                dense
                color="negative"
                icon="mdi-delete"
                :label="$gettext('Remove')"
                @click="$emit('remove', index)"
              />
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-btn
          flat
          dense
          color="primary"
          icon="mdi-plus"
          :label="$gettext('Add Deployment')"
          class="q-mt-sm"
          @click="$emit('add')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { modelIcon } from 'composables/element'

const { $gettext } = useGettext()

const sourceOptions = [
  { label: 'External', value: 'E' },
  { label: 'Internal', value: 'I' },
]

defineProps({
  deployments: { type: Array, required: true },
  selectedNames: { type: Array, required: true },
  editing: { type: Boolean, default: false },
})

defineEmits(['update:editing', 'update:selected-names', 'add', 'remove'])
</script>
