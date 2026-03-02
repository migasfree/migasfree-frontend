<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :icon="titleIcon" :has-export-button="false" />

    <q-stepper
      v-model="step"
      vertical
      color="primary"
      animated
      class="import-stepper"
    >
      <!-- Step 1: Select Distribution -->
      <q-step
        :name="1"
        :title="$gettext('Distribution')"
        :caption="$gettext('Select the base distribution')"
        icon="mdi-linux"
        :done="step > 1"
      >
        <!-- Template source toggle -->
        <q-btn-toggle
          v-model="templateSource"
          spread
          no-caps
          rounded
          toggle-color="primary"
          class="q-mb-md"
          :options="[
            {
              label: $gettext('Bundled Templates'),
              value: 'bundled',
              icon: 'mdi-package-variant-closed',
            },
            {
              label: $gettext('Upload Custom Template'),
              value: 'upload',
              icon: 'mdi-upload',
            },
          ]"
        />

        <!-- Upload custom template -->
        <div v-if="templateSource === 'upload'" class="q-py-md">
          <q-file
            v-model="customTemplateFile"
            :label="$gettext('Select a template.json file')"
            accept=".json"
            outlined
            @update:model-value="onCustomTemplateSelected"
          >
            <template #prepend>
              <q-icon name="mdi-file-code" />
            </template>
            <template #append>
              <q-icon
                v-if="customTemplateFile"
                name="mdi-close"
                class="cursor-pointer"
                @click.stop.prevent="clearCustomTemplate"
              />
            </template>
          </q-file>

          <q-banner
            v-if="templateError"
            class="bg-negative text-white q-mt-md"
            rounded
          >
            <template #avatar>
              <q-icon name="mdi-alert-circle" />
            </template>
            {{ templateError }}
          </q-banner>
        </div>

        <!-- Bundled template loading states -->
        <template v-if="templateSource === 'bundled'">
          <div v-if="templateError" class="text-negative q-pa-md">
            <q-icon name="mdi-alert-circle" size="sm" class="q-mr-sm" />
            {{ templateError }}
          </div>

          <div v-else-if="!template" class="q-pa-lg text-center">
            <q-spinner color="primary" size="3em" />
            <div class="q-mt-md text-subtitle1">
              {{ $gettext('Loading template...') }}
            </div>
          </div>
        </template>

        <!-- Distro cards -->
        <div v-if="template" class="row q-col-gutter-md q-py-md">
          <div
            v-for="distro in template.distros"
            :key="distro.name"
            class="col-6 col-md-3 col-sm-6"
          >
            <q-card
              flat
              bordered
              class="distro-card cursor-pointer"
              :class="{
                'distro-card--selected': selectedDistro === distro.name,
              }"
              @click="selectedDistro = distro.name"
            >
              <q-card-section class="text-center">
                <q-icon name="mdi-linux" size="48px" class="q-mb-sm" />
                <div class="text-subtitle1 text-weight-bold">
                  {{ distro.name }}
                </div>
                <div class="text-caption text-grey">
                  {{ distro.platform }} · {{ distro.pms }} ·
                  {{ distro.architecture }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-stepper-navigation>
          <q-btn
            color="primary"
            :label="$gettext('Continue')"
            :disable="!selectedDistro"
            @click="goToStep2"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: Select Project -->
      <q-step
        :name="2"
        :title="$gettext('Project')"
        :caption="$gettext('Select or create a project')"
        icon="mdi-sitemap"
        :done="step > 2"
      >
        <div class="q-py-md">
          <!-- Project name -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="selectedExistingProject"
                :options="existingProjects"
                option-label="name"
                option-value="name"
                :label="$gettext('Existing Project')"
                clearable
                emit-value
                map-options
                @update:model-value="onSelectExistingProject"
              >
                <template #prepend>
                  <q-icon :name="modelIcon('projects')" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="newProjectName"
                :label="$gettext('Or enter a new project name')"
                :disable="!!selectedExistingProject"
                clearable
              >
                <template #prepend>
                  <q-icon name="mdi-plus" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Project configuration (from distro, editable) -->
          <q-card flat bordered>
            <q-card-section>
              <div
                class="text-subtitle2 text-weight-bold q-mb-sm flex items-center"
              >
                <q-icon name="mdi-tune" class="q-mr-xs" />
                {{ $gettext('Project Configuration') }}
                <q-space />
                <q-btn
                  flat
                  dense
                  round
                  :icon="
                    editingProject ? 'mdi-check-circle' : 'mdi-pencil-outline'
                  "
                  :color="editingProject ? 'positive' : 'primary'"
                  @click="editingProject = !editingProject"
                >
                  <q-tooltip>{{
                    editingProject
                      ? $gettext('Finish editing')
                      : $gettext('Edit configuration')
                  }}</q-tooltip>
                </q-btn>
              </div>

              <!-- Read-only view -->
              <q-list v-if="!editingProject" dense>
                <q-item>
                  <q-item-section avatar>
                    <q-icon :name="modelIcon('platforms')" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $gettext('Platform') }}</q-item-label>
                    <q-item-label caption>{{
                      editableProject.platform
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="mdi-package-variant" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{
                      $gettext('Package Management System')
                    }}</q-item-label>
                    <q-item-label caption>{{
                      editableProject.pms
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="mdi-chip" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $gettext('Architecture') }}</q-item-label>
                    <q-item-label caption>{{
                      editableProject.architecture
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <!-- Editable view -->
              <div v-else class="row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="editableProject.platform"
                    :label="$gettext('Platform')"
                    dense
                    outlined
                  >
                    <template #prepend>
                      <q-icon :name="modelIcon('platforms')" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="editableProject.pms"
                    :label="$gettext('Package Management System')"
                    dense
                    outlined
                  >
                    <template #prepend>
                      <q-icon name="mdi-package-variant" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="editableProject.architecture"
                    :label="$gettext('Architecture')"
                    dense
                    outlined
                  >
                    <template #prepend>
                      <q-icon name="mdi-chip" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-stepper-navigation>
          <q-btn
            color="primary"
            :label="$gettext('Continue')"
            :disable="!projectName"
            @click="prepareStep3"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Back')"
            class="q-ml-sm"
            @click="step = 1"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 3: Review & Edit -->
      <q-step
        :name="3"
        :title="$gettext('Review & Edit')"
        :caption="$gettext('Review, edit and select items to import')"
        icon="mdi-pencil-box-outline"
        :done="step > 3"
      >
        <div class="q-py-md">
          <!-- Summary -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                {{ $gettext('Import Summary') }}
              </div>
              <q-list dense>
                <q-item>
                  <q-item-section avatar>
                    <q-icon :name="modelIcon('platforms')" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $gettext('Platform') }}</q-item-label>
                    <q-item-label caption>{{
                      editableProject.platform
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon :name="modelIcon('projects')" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $gettext('Project') }}</q-item-label>
                    <q-item-label caption>{{ projectName }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon :name="modelIcon('stores')" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $gettext('Stores') }}</q-item-label>
                    <q-item-label caption>org, thirds, updates</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Deployments (editable) -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div
                class="text-subtitle1 text-weight-bold q-mb-sm flex items-center"
              >
                <q-icon :name="modelIcon('deployments')" class="q-mr-xs" />
                {{ $gettext('Deployments') }}
                <q-badge color="primary" class="q-ml-sm">
                  {{ selectedDeploymentNames.length }}/{{
                    editableDeployments.length
                  }}
                </q-badge>
                <q-space />
                <q-btn
                  flat
                  dense
                  round
                  :icon="
                    editingDeployments
                      ? 'mdi-check-circle'
                      : 'mdi-pencil-outline'
                  "
                  :color="editingDeployments ? 'positive' : 'primary'"
                  @click="editingDeployments = !editingDeployments"
                >
                  <q-tooltip>{{
                    editingDeployments
                      ? $gettext('Finish editing')
                      : $gettext('Edit deployments')
                  }}</q-tooltip>
                </q-btn>
              </div>

              <!-- Read-only list -->
              <q-list v-if="!editingDeployments">
                <q-item
                  v-for="dep in editableDeployments"
                  :key="dep.name"
                  tag="label"
                >
                  <q-item-section side>
                    <q-checkbox
                      v-model="selectedDeploymentNames"
                      :val="dep.name"
                      color="primary"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ dep.name }}</q-item-label>
                    <q-item-label caption>
                      {{
                        dep.source === 'E'
                          ? $gettext('External')
                          : $gettext('Internal')
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
                      :label="
                        dep.enabled ? $gettext('Enabled') : $gettext('Disabled')
                      "
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <!-- Editable list -->
              <div v-else>
                <q-expansion-item
                  v-for="(dep, index) in editableDeployments"
                  :key="dep.name + index"
                  :label="dep.name"
                  :caption="
                    dep.source === 'E'
                      ? $gettext('External')
                      : $gettext('Internal')
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
                        @click="removeDeployment(index)"
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
                  @click="addDeployment"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Applications -->
          <q-card v-if="editableApps.length" flat bordered>
            <q-card-section>
              <div
                class="text-subtitle1 text-weight-bold q-mb-sm flex items-center"
              >
                <q-icon :name="modelIcon('catalog/apps')" class="q-mr-xs" />
                {{ $gettext('Applications') }}
                <q-badge color="primary" class="q-ml-sm">
                  {{ selectedAppNames.length }}/{{ editableApps.length }}
                </q-badge>
                <q-space />
                <q-btn
                  flat
                  dense
                  round
                  :icon="
                    editingApps ? 'mdi-check-circle' : 'mdi-pencil-outline'
                  "
                  :color="editingApps ? 'positive' : 'primary'"
                  @click="editingApps = !editingApps"
                >
                  <q-tooltip>{{
                    editingApps
                      ? $gettext('Finish editing')
                      : $gettext('Edit applications')
                  }}</q-tooltip>
                </q-btn>
              </div>

              <!-- Read-only selectable list -->
              <q-list v-if="!editingApps">
                <q-item v-for="app in editableApps" :key="app.name" tag="label">
                  <q-item-section side>
                    <q-checkbox
                      v-model="selectedAppNames"
                      :val="app.name"
                      color="primary"
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
                  v-for="(app, index) in editableApps"
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
                        @click="removeApp(index)"
                      />
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-stepper-navigation>
          <q-btn
            color="primary"
            :label="
              hasInternalDeployments
                ? $gettext('Continue')
                : $gettext('Start Import')
            "
            :disable="selectedDeploymentNames.length === 0"
            @click="hasInternalDeployments ? (step = 4) : startImport()"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Back')"
            class="q-ml-sm"
            @click="step = 2"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 4: Packages (conditional) -->
      <q-step
        v-if="hasInternalDeployments"
        :name="4"
        :title="$gettext('Packages')"
        :caption="$gettext('Upload packages for internal deployments')"
        icon="mdi-package-variant"
        :done="step > 4"
      >
        <div class="q-py-md">
          <q-banner class="bg-info text-white q-mb-md" rounded>
            <template #avatar>
              <q-icon name="mdi-information" />
            </template>
            {{
              $gettext(
                'Internal deployments require packages to be uploaded. Download them from the URLs below and upload the .deb/.rpm files.',
              )
            }}
          </q-banner>

          <q-card
            v-for="dep in selectedInternalDeployments"
            :key="dep.name"
            flat
            bordered
            class="q-mb-md"
          >
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold">
                {{ dep.name }}
              </div>
              <div v-if="dep.url_download" class="text-caption q-mb-sm">
                {{ $gettext('Download URL') }}:
                <a
                  :href="dep.url_download"
                  target="_blank"
                  class="text-primary"
                >
                  {{ dep.url_download }}
                </a>
              </div>
              <q-file
                v-model="packageFiles[dep.name]"
                :label="$gettext('Upload packages (.deb, .rpm)')"
                multiple
                accept=".deb,.rpm"
                outlined
                counter
                use-chips
              >
                <template #prepend>
                  <q-icon name="mdi-package-variant" />
                </template>
              </q-file>
            </q-card-section>
          </q-card>
        </div>

        <q-stepper-navigation>
          <q-btn
            color="primary"
            :label="$gettext('Start Import')"
            @click="startImport"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Back')"
            class="q-ml-sm"
            @click="step = 3"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 5: Execution -->
      <q-step
        :name="5"
        :title="$gettext('Execution')"
        :caption="$gettext('Import in progress')"
        :icon="isRunning ? 'mdi-loading' : 'mdi-play-circle'"
        :done="step > 5"
        :header-nav="false"
      >
        <div class="q-py-md">
          <q-linear-progress
            :value="progressPercent / 100"
            size="25px"
            color="primary"
            track-color="grey-3"
            class="q-mb-md"
            rounded
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                color="white"
                text-color="primary"
                :label="`${progressPercent}%`"
              />
            </div>
          </q-linear-progress>

          <div class="text-subtitle2 q-mb-sm">
            <q-icon
              name="mdi-cog"
              class="q-mr-xs"
              :class="{ 'mdi-spin': isRunning }"
            />
            {{ currentStep || $gettext('Waiting...') }}
          </div>

          <q-card flat bordered class="log-container">
            <q-card-section class="q-pa-sm">
              <q-virtual-scroll
                ref="logScroll"
                :items="logs"
                separator
                style="max-height: 300px"
              >
                <template #default="{ item, index }">
                  <q-item :key="index" dense>
                    <q-item-section side>
                      <q-icon
                        :name="logIcon(item.type)"
                        :color="logColor(item.type)"
                        size="xs"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-caption">
                        {{ item.message }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-caption text-grey">
                        {{ formatTime(item.timestamp) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-virtual-scroll>
            </q-card-section>
          </q-card>
        </div>

        <q-stepper-navigation v-if="!isRunning && logs.length > 0">
          <q-btn
            color="primary"
            :label="$gettext('View Results')"
            @click="step = 6"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 6: Results -->
      <q-step
        :name="6"
        :title="$gettext('Results')"
        :caption="$gettext('Import completed')"
        icon="mdi-check-circle"
        :header-nav="false"
      >
        <div class="q-py-md">
          <q-banner
            :class="importError ? 'bg-negative' : 'bg-positive'"
            class="text-white q-mb-md"
            rounded
          >
            <template #avatar>
              <q-icon
                :name="importError ? 'mdi-alert-circle' : 'mdi-check-circle'"
              />
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
                    <q-item
                      v-for="dep in createdResources.deployments"
                      :key="dep.id"
                    >
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

        <q-stepper-navigation>
          <q-btn
            color="primary"
            :label="$gettext('New Import')"
            icon="mdi-restart"
            @click="resetWizard"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Download Recipe')"
            icon="mdi-download"
            class="q-ml-sm"
            @click="downloadRecipe"
          />
          <q-btn
            flat
            color="primary"
            :label="$gettext('Go to Deployments')"
            class="q-ml-sm"
            @click="$router.push({ name: 'deployments-dashboard' })"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useMeta } from 'quasar'

import { api } from 'boot/axios'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'

import { appIcon, modelIcon } from 'composables/element'
import { useImporter } from 'composables/importer'

const { $gettext } = useGettext()

const title = $gettext('Import Configuration')
const titleIcon = appIcon('import')
useMeta({ title })

const breadcrumbs = ref([
  {
    text: $gettext('Dashboard'),
    icon: appIcon('home'),
    to: 'home',
  },
  {
    text: $gettext('Release'),
    icon: appIcon('release'),
  },
  {
    text: title,
    icon: titleIcon,
  },
])

const step = ref(1)
const templateSource = ref('bundled')
const templateError = ref(null)
const customTemplateFile = ref(null)
const selectedDistro = ref(null)
const selectedExistingProject = ref(null)
const newProjectName = ref('')
const selectedDeploymentNames = ref([])
const editableDeployments = ref([])
const editingDeployments = ref(false)
const editableProject = reactive({ platform: '', pms: '', architecture: '' })
const editingProject = ref(false)
const editableApps = ref([])
const selectedAppNames = ref([])
const editingApps = ref(false)
const packageFiles = reactive({})
const existingProjects = ref([])
const logScroll = ref(null)

const sourceOptions = [
  { label: 'External', value: 'E' },
  { label: 'Internal', value: 'I' },
]

const {
  template,
  isRunning,
  currentStep,
  progressPercent,
  logs,
  error: importError,
  createdResources,
  loadTemplate,
  runImport,
  reset: resetImporter,
} = useImporter()

// Computed
const projectName = computed(() => {
  if (selectedExistingProject.value) return selectedExistingProject.value
  return newProjectName.value?.trim() || ''
})

const selectedDistroData = computed(() =>
  template.value?.distros.find((d) => d.name === selectedDistro.value),
)

const hasInternalDeployments = computed(() =>
  editableDeployments.value.some(
    (d) => d.source === 'I' && selectedDeploymentNames.value.includes(d.name),
  ),
)

const selectedInternalDeployments = computed(() =>
  editableDeployments.value.filter(
    (d) => d.source === 'I' && selectedDeploymentNames.value.includes(d.name),
  ),
)

// Methods
const onCustomTemplateSelected = async (file) => {
  if (!file) return
  templateError.value = null

  try {
    const text = await file.text()
    const parsed = JSON.parse(text)

    if (!parsed.distros || !parsed.deployments) {
      throw new Error(
        'Invalid template: missing "distros" or "deployments" keys',
      )
    }

    template.value = parsed
    selectedDistro.value = null
  } catch (err) {
    templateError.value = `${$gettext('Invalid template file')}: ${err.message}`
    template.value = null
  }
}

const clearCustomTemplate = () => {
  customTemplateFile.value = null
  template.value = null
  selectedDistro.value = null
  templateError.value = null
}

const onSelectExistingProject = (val) => {
  if (val) newProjectName.value = ''
}

const goToStep2 = async () => {
  // Pre-fill project config from selected distro
  const distro = selectedDistroData.value
  if (distro) {
    editableProject.platform = distro.platform
    editableProject.pms = distro.pms
    editableProject.architecture = distro.architecture
  }
  editingProject.value = false

  try {
    const response = await api.get('/api/v1/token/projects/')
    existingProjects.value = response.data.results || []
  } catch {
    existingProjects.value = []
  }
  step.value = 2
}

const prepareStep3 = () => {
  // Build editable copy of deployments for the selected distro
  const raw =
    (template.value.deployments[selectedDistro.value] || []).filter(
      (d) => !d.ignored,
    ) || []

  editableDeployments.value = raw.map((d) => ({
    ...d,
    packages_to_install_text: Array.isArray(d.packages_to_install)
      ? d.packages_to_install.join('\n')
      : d.packages_to_install || '',
  }))

  // Pre-select all deployments
  selectedDeploymentNames.value = editableDeployments.value.map((d) => d.name)
  editingDeployments.value = false

  // Build editable copy of applications
  const rawApps = template.value.applications || []
  editableApps.value = rawApps.map((a) => ({
    ...a,
    packages_to_install_text: Array.isArray(a.packages_to_install)
      ? a.packages_to_install.join('\n')
      : a.packages_to_install || '',
  }))
  selectedAppNames.value = editableApps.value.map((a) => a.name)
  editingApps.value = false

  step.value = 3
}

const addDeployment = () => {
  const newDep = {
    name: `New Deployment ${editableDeployments.value.length + 1}`,
    source: 'E',
    enabled: true,
    base_url: '',
    suite: '',
    components: '',
    options: '',
    frozen: false,
    included_attributes: [],
    store: '',
    packages_to_install_text: '',
  }
  editableDeployments.value.push(newDep)
  selectedDeploymentNames.value.push(newDep.name)
}

const removeDeployment = (index) => {
  const name = editableDeployments.value[index].name
  editableDeployments.value.splice(index, 1)
  selectedDeploymentNames.value = selectedDeploymentNames.value.filter(
    (n) => n !== name,
  )
}

const syncEditableToTemplate = () => {
  // Write editable project config back into template distro
  const distro = template.value.distros.find(
    (d) => d.name === selectedDistro.value,
  )
  if (distro) {
    distro.platform = editableProject.platform
    distro.pms = editableProject.pms
    distro.architecture = editableProject.architecture
  }

  // Write editable deployments back into template before import
  editableDeployments.value.forEach((dep) => {
    if (dep.packages_to_install_text !== undefined) {
      dep.packages_to_install = dep.packages_to_install_text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  })
  template.value.deployments[selectedDistro.value] = editableDeployments.value

  // Write editable apps back into template
  editableApps.value.forEach((app) => {
    if (app.packages_to_install_text !== undefined) {
      app.packages_to_install = app.packages_to_install_text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  })
  template.value.applications = editableApps.value.filter((a) =>
    selectedAppNames.value.includes(a.name),
  )
}

const startImport = () => {
  syncEditableToTemplate()
  step.value = 5
  runImport(
    selectedDistro.value,
    projectName.value,
    selectedDeploymentNames.value,
    packageFiles,
  )
}

const removeApp = (index) => {
  const name = editableApps.value[index].name
  editableApps.value.splice(index, 1)
  selectedAppNames.value = selectedAppNames.value.filter((n) => n !== name)
}

const downloadRecipe = () => {
  syncEditableToTemplate()

  const distro = selectedDistroData.value
  const cleanForExport = (item) => {
    const copy = { ...item }
    delete copy.packages_to_install_text
    return copy
  }

  const recipe = {
    distros: distro ? [distro] : [],
    deployments: {
      [selectedDistro.value]: editableDeployments.value
        .filter((d) => selectedDeploymentNames.value.includes(d.name))
        .map(cleanForExport),
    },
    applications: editableApps.value
      .filter((a) => selectedAppNames.value.includes(a.name))
      .map(cleanForExport),
  }

  const blob = new Blob([JSON.stringify(recipe, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `migasfree-recipe-${selectedDistro.value}-${projectName.value || 'custom'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const resetWizard = () => {
  step.value = 1
  templateSource.value = 'bundled'
  customTemplateFile.value = null
  selectedDistro.value = null
  selectedExistingProject.value = null
  newProjectName.value = ''
  selectedDeploymentNames.value = []
  editableDeployments.value = []
  editingDeployments.value = false
  Object.assign(editableProject, { platform: '', pms: '', architecture: '' })
  editingProject.value = false
  editableApps.value = []
  selectedAppNames.value = []
  editingApps.value = false
  Object.keys(packageFiles).forEach((key) => delete packageFiles[key])
  resetImporter()
}

const logIcon = (type) => {
  const icons = {
    info: 'mdi-information-outline',
    success: 'mdi-check-circle-outline',
    warning: 'mdi-alert-outline',
    error: 'mdi-close-circle-outline',
  }
  return icons[type] || icons.info
}

const logColor = (type) => {
  const colors = {
    info: 'blue',
    success: 'positive',
    warning: 'warning',
    error: 'negative',
  }
  return colors[type] || colors.info
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

// Lifecycle
onMounted(async () => {
  try {
    await loadTemplate()
  } catch {
    templateError.value = $gettext(
      'Could not load the import template. Please check that the file exists.',
    )
  }
})
</script>

<style scoped>
.import-stepper {
  background: transparent;
}

.distro-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.distro-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.distro-card--selected {
  border-color: var(--brand-primary, var(--q-primary));
  background: rgba(81, 45, 10, 0.05);
}

[data-theme='dark'] .distro-card--selected {
  background: rgba(254, 252, 232, 0.08);
}

.log-container {
  font-family: monospace;
}
</style>
