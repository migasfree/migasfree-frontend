<template>
  <div class="q-py-md">
    <q-banner
      :class="importError ? 'bg-negative' : 'bg-positive'"
      class="text-white q-mb-md"
      rounded
    >
      <template #avatar>
        <q-icon :name="importError ? 'mdi-alert-circle' : 'mdi-check-circle'" />
      </template>
      {{
        importError
          ? $gettext('Import completed with errors')
          : $gettext('Import completed successfully!')
      }}
    </q-banner>

    <!-- Created Resources -->
    <div class="row q-col-gutter-md">
      <div v-if="createdResources.platform" class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold">
              <q-icon :name="modelIcon('platforms')" class="q-mr-xs" />
              {{ $gettext('Platform') }}
            </div>
            <router-link
              :to="{
                name: 'platform-detail',
                params: { id: createdResources.platform.id },
              }"
              class="text-primary"
            >
              {{ createdResources.platform.name }}
            </router-link>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="createdResources.project" class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold">
              <q-icon :name="modelIcon('projects')" class="q-mr-xs" />
              {{ $gettext('Project') }}
            </div>
            <router-link
              :to="{
                name: 'project-detail',
                params: { id: createdResources.project.id },
              }"
              class="text-primary"
            >
              {{ createdResources.project.name }}
            </router-link>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="createdResources.deployments.length" class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">
              <q-icon :name="modelIcon('deployments')" class="q-mr-xs" />
              {{ $gettext('Deployments') }}
              <q-badge color="primary" class="q-ml-sm">
                {{ createdResources.deployments.length }}
              </q-badge>
            </div>
            <q-list dense>
              <q-item v-for="dep in createdResources.deployments" :key="dep.id">
                <q-item-section>
                  <router-link
                    :to="{
                      name: 'deployment-detail',
                      params: { id: dep.id },
                    }"
                    class="text-primary"
                  >
                    {{ dep.name }}
                  </router-link>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="createdResources.applications.length" class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">
              <q-icon :name="modelIcon('catalog/apps')" class="q-mr-xs" />
              {{ $gettext('Applications') }}
              <q-badge color="primary" class="q-ml-sm">
                {{ createdResources.applications.length }}
              </q-badge>
            </div>
            <q-list dense>
              <q-item
                v-for="app in createdResources.applications"
                :key="app.id"
              >
                <q-item-section>
                  <router-link
                    :to="{ name: 'app-detail', params: { id: app.id } }"
                    class="text-primary"
                  >
                    {{ app.name }}
                  </router-link>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { modelIcon } from 'composables/element'

const { $gettext } = useGettext()

defineProps({
  importError: { type: [String, null], default: null },
  createdResources: { type: Object, required: true },
})
</script>
