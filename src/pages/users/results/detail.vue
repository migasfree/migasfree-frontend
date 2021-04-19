<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('User')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="users"
          :pk="element.id"
          :value="element.__str__"
          icon="mdi-account"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md col-sm">
            <q-input
              v-model="element.name"
              outlined
              readonly
              :label="$gettext('Name')"
            />
          </div>

          <div class="col-6 col-md col-sm">
            <q-input
              v-model="element.fullname"
              outlined
              readonly
              :label="$gettext('Fullname')"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="$route.params.id && element.id" class="row q-pa-md">
      <q-btn
        flat
        icon="mdi-delete"
        color="negative"
        :label="$gettext('Delete')"
        @click="confirmRemove = true"
      />
    </div>

    <RemoveDialog
      v-model="confirmRemove"
      @confirmed="remove"
      @canceled="confirmRemove = !confirmRemove"
    />
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'
import { detailMixin } from 'mixins/detail'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    RemoveDialog,
    MigasLink
  },
  mixins: [detailMixin],
  data() {
    const route = 'users-list'
    const title = this.$gettext('User')
    const element = { id: 0 }

    return {
      title,
      originalTitle: title,
      model: 'users',
      listRoute: route,
      detailRoute: 'user-detail',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Users'),
          icon: 'mdi-account',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      confirmRemove: false
    }
  }
}
</script>
