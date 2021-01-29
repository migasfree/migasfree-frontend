<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Stamp')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="stamps"
          :pk="element.id"
          :value="element.name"
          icon="mdi-stamper"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-checkbox
              v-model="element.enabled"
              left-label
              :label="$gettext('Enabled?')"
            />
          </div>

          <div class="col-6 col-md">
            <q-select
              v-model="element.kind"
              outlined
              :label="$gettext('Kind')"
              :options="kind"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-input
              v-model="element.prefix"
              outlined
              :label="$gettext('Prefix')"
              counter
              maxlength="3"
              lazy-rules
              :rules="[
                (val) => !!val || $gettext('* Required'),
                (val) =>
                  val.length <= 3 ||
                  $gettextInterpolate(
                    $gettext('Please use maximum %{n} characters'),
                    {
                      n: 3
                    }
                  )
              ]"
              @input="
                (v) => {
                  element.prefix = v.toUpperCase()
                }
              "
            />
          </div>

          <div class="col-6 col-md">
            <q-input
              v-model="element.name"
              outlined
              :label="$gettext('Name')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="justify-around">
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and add other')"
          icon="mdi-plus"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
        />
        <q-btn
          flat
          color="primary"
          :label="$gettext('Save and continue editing')"
          icon="mdi-content-save-edit"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement"
        />
        <q-btn
          :label="$gettext('Save')"
          color="primary"
          icon="mdi-content-save-move"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('return')"
        />
      </q-card-actions>
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
    const route = 'stamps-list'
    const title = this.$gettext('Stamp')
    const element = { id: 0, enabled: false }

    return {
      title,
      originalTitle: title,
      model: 'stamps',
      listRoute: route,
      addRoute: 'stamp-add',
      detailRoute: 'stamp-detail',
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Configuration'),
          icon: 'mdi-cogs'
        },
        {
          text: this.$gettext('Stamps'),
          icon: 'mdi-stamper',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      languages: [],
      kind: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return (
        this.element.name !== undefined &&
        this.element.name !== '' &&
        this.element.kind !== undefined &&
        this.element.prefix !== undefined &&
        this.element.prefix.length <= 3
      )
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get('/api/v1/token/properties/kind/')
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            this.kind.push({
              id: key,
              name: val
            })
          })
          if (this.element.id)
            this.element.kind = this.kind.find((x) => x.id == this.element.kind)
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      if (typeof this.element.kind === 'string')
        this.element.kind = this.kind.find((x) => x.id == this.element.kind)
    },

    elementData() {
      return {
        name: this.element.name,
        prefix: this.element.prefix,
        enabled: this.element.enabled,
        kind: this.element.kind.id
      }
    }
  }
}
</script>
