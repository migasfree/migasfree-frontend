<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold q-mb-sm flex items-center">
        <q-icon :name="modelIcon('catalog/apps')" class="q-mr-xs" />
        {{ $gettext('Applications') }}
        <q-badge color="primary" class="q-ml-sm">
          {{ selectedNames.length }}/{{ apps.length }}
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
            editing ? $gettext('Finish editing') : $gettext('Edit applications')
          }}</q-tooltip>
        </q-btn>
      </div>

      <!-- Read-only selectable list -->
      <q-list v-if="!editing">
        <q-item v-for="app in apps" :key="app.name" tag="label">
          <q-item-section side>
            <q-checkbox
              :model-value="selectedNames"
              :val="app.name"
              color="primary"
              @update:model-value="$emit('update:selected-names', $event)"
            />
          </q-item-section>
          <q-item-section avatar>
            <q-avatar v-if="app.icon" size="32px">
              <img :src="app.icon" :alt="app.name" />
            </q-avatar>
            <q-icon v-else :name="modelIcon('catalog/apps')" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ app.name }}</q-item-label>
            <q-item-label caption>
              {{ app.category }}
              · {{ app.packages_to_install?.join(', ') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Editable list -->
      <div v-else>
        <q-expansion-item
          v-for="(app, index) in apps"
          :key="app.name + index"
          :label="app.name"
          :caption="app.category"
          group="applications"
          header-class="text-weight-medium"
        >
          <q-card flat>
            <q-card-section class="q-gutter-sm">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="app.name"
                    :label="$gettext('Name')"
                    dense
                    outlined
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="app.category"
                    :label="$gettext('Category')"
                    dense
                    outlined
                  />
                </div>
              </div>
              <q-input
                v-model="app.description"
                :label="$gettext('Description')"
                type="textarea"
                dense
                outlined
                autogrow
              />
              <q-input
                v-model="app.packages_to_install_text"
                :label="$gettext('Packages to Install')"
                type="textarea"
                dense
                outlined
                autogrow
                hint="One per line"
              />
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
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { modelIcon } from 'composables/element'

const { $gettext } = useGettext()

defineProps({
  apps: { type: Array, required: true },
  selectedNames: { type: Array, required: true },
  editing: { type: Boolean, default: false },
})

defineEmits(['update:editing', 'update:selected-names', 'remove'])
</script>
