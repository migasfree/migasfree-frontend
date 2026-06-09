<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <TableResults
      :title="title"
      :columns="columns"
      :model="model"
      :routes="routes"
    >
      <!-- Custom rendering for Build Type badge -->
      <template #cell-build_type="{ props }">
        <q-badge
          :color="
            props.row.build_type === 'docker'
              ? 'blue-8'
              : props.row.build_type === 'qemu_win'
                ? 'purple-8'
                : 'teal-8'
          "
          text-color="white"
          class="q-py-xs q-px-sm text-weight-bold text-uppercase"
        >
          {{
            props.row.build_type === 'docker'
              ? 'Docker'
              : props.row.build_type === 'qemu_win'
                ? 'QEMU Win'
                : 'QEMU Linux'
          }}
        </q-badge>
      </template>

      <!-- Custom rendering for Image Format badge -->
      <template #cell-image_format="{ props }">
        <q-badge
          color="grey-9"
          text-color="white"
          class="q-py-xs q-px-sm text-weight-bold text-uppercase"
        >
          {{ props.row.image_format }}
        </q-badge>
      </template>
    </TableResults>
  </q-page>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { useListConfig } from 'composables/listConfig'

import Breadcrumbs from 'components/ui/Breadcrumbs'
import TableResults from 'components/ui/TableResults'

import { appIcon } from 'composables/element'

const { $gettext } = useGettext()

const routes = {
  add: 'config-add',
  detail: 'config-detail',
}
const model = 'mgi/config'

const { title, breadcrumbs, columns } = useListConfig(
  model,
  $gettext('Configurations'),
  $gettext('Configurations'),
  [
    {
      text: $gettext('Golden Images'),
      icon: appIcon('golden-images'),
    },
  ],
  [
    {
      field: 'project.id',
      hidden: true,
    },
    {
      label: $gettext('Project'),
      field: 'project.name',
      filterOptions: {
        enabled: true,
        placeholder: $gettext('All'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Template ID'),
      field: 'template_id',
      sortable: true,
      filterOptions: {
        enabled: true,
        placeholder: $gettext('Filter'),
        trigger: 'enter',
      },
    },
    {
      label: $gettext('Build Type'),
      field: 'build_type',
      sortable: true,
    },
    {
      label: $gettext('Base OS'),
      field: 'base_os',
      sortable: true,
    },
    {
      label: $gettext('Image Format'),
      field: 'image_format',
      sortable: true,
    },
  ],
)
</script>
