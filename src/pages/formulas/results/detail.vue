<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Formula')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="formulas"
          :pk="element.id"
          :value="element.name"
          icon="mdi-function-variant"
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

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

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Code</div>

        <div class="row q-pa-md q-gutter-md justify-between q-mb-xl">
          <div class="col-md-3">
            <q-select
              v-model="element.language"
              outlined
              :label="$gettext('Language')"
              :options="languages"
              option-value="id"
              option-label="name"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>

          <div class="col-md-8 q-mb-xl">
            <q-input
              v-model="element.code"
              outlined
              type="textarea"
              bottom-slots
              :label="$gettext('Code')"
            >
              <template #hint>
                <p v-translate>
                  This code will execute in the client computer, and it must put
                  in the standard output the value of the attribute
                  correspondent to this property.
                </p>
                <p v-translate>
                  The format of this value is 'name~description', where
                  'description' is optional.
                </p>
                <p><b v-translate>Example of code:</b></p>
                <p v-translate>
                  # Create an attribute with the name of computer from bash
                </p>
                <p><code>echo $HOSTNAME</code></p>
              </template></q-input
            >
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
    const route = 'formulas-list'
    const title = this.$gettext('Formula')
    const element = { id: 0, enabled: false }

    return {
      title,
      originalTitle: title,
      model: 'formulas',
      listRoute: route,
      addRoute: 'formula-add',
      detailRoute: 'formula-detail',
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
          text: this.$gettext('Formulas'),
          icon: 'mdi-function-variant',
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
        this.element.language !== undefined &&
        this.element.kind !== undefined &&
        this.element.prefix !== undefined &&
        this.element.prefix.length <= 3 &&
        this.element.code !== undefined
      )
    }
  },
  methods: {
    async loadRelated() {
      await this.$axios
        .get(`/api/v1/token/properties/kind/`)
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

      await this.$axios
        .get(`/api/v1/public/languages/`)
        .then((response) => {
          Object.entries(response.data).map(([key, val]) => {
            this.languages.push({
              id: parseInt(key),
              name: val
            })
          })
          if (this.element.id)
            this.element.language = this.languages.find(
              (x) => x.id === this.element.language
            )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      if (typeof this.element.kind === 'string')
        this.element.kind = this.kind.find((x) => x.id == this.element.kind)

      if (typeof this.element.language === 'number')
        this.element.language = this.languages.find(
          (x) => x.id === this.element.language
        )
    },

    elementData() {
      return {
        name: this.element.name,
        prefix: this.element.prefix,
        enabled: this.element.enabled,
        kind: this.element.kind.id,
        language: this.element.language.id,
        code: this.element.code
      }
    }
  }
}
</script>
