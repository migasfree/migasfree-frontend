<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('User Profile')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="user-profiles"
          :pk="element.id"
          :value="element.username"
          icon="mdi-account-cog"
        />
        <q-btn
          class="q-ma-md"
          :label="$gettext('Change Password')"
          color="primary"
          icon="mdi-account-key"
          @click="
            $router.push({
              name: 'user-profile-change-password',
              params: { id: element.id }
            })
          "
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">General</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <q-input
              v-model="element.username"
              outlined
              counter
              maxlength="150"
              :label="$gettext('Username')"
              :hint="$gettext('Only letters, digits and @/./+/-/_')"
              lazy-rules
              :rules="[(val) => !!val || $gettext('* Required')]"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-input
              v-model="element.first_name"
              outlined
              :label="$gettext('First Name')"
            />
          </div>

          <div class="col-6 col-md">
            <q-input
              v-model="element.last_name"
              outlined
              :label="$gettext('Last Name')"
            />
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-input
              v-model="element.email"
              outlined
              type="email"
              :label="$gettext('Email')"
              lazy-rules
              :rules="[(val) => !!val, isValidEmail]"
            >
              <template #prepend> <q-icon name="mail" /> </template
            ></q-input>
          </div>
        </div>

        <div v-if="element.id" class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <p>
              <translate>Joined Date</translate>:
              <strong>{{ showDate(element.date_joined) }}</strong>
            </p>
          </div>

          <div class="col-6 col-md">
            <p>
              <translate>Last Login</translate>:
              <strong>{{ showDate(element.last_login) }}</strong>
            </p>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Authorizations</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <q-checkbox
              v-model="element.is_active"
              left-label
              :label="$gettext('Enabled?')"
            />
            <p v-translate class="text-caption">
              Indicates whether the user should be treated as active. Uncheck
              this option instead of deleting the account.
            </p>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <q-checkbox
              v-model="element.is_superuser"
              left-label
              :label="$gettext('Is Super User?')"
            />
            <p v-translate class="text-caption">
              Indicates that this user has all permissions without explicitly
              assigning them.
            </p>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <q-checkbox
              v-model="element.is_staff"
              left-label
              :label="$gettext('Is Staff?')"
            />
            <p v-translate class="text-caption">
              Indicates whether the user can enter this administration site.
            </p>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.groups"
              :options="groups"
              :label="$gettext('Groups')"
              outlined
              multiple
              option-value="id"
              option-label="name"
            >
              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  class="q-ma-md"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  {{ scope.opt.name }}
                </q-chip>
              </template>
            </q-select>
          </div>

          <div class="col-6 col-md">
            <q-select
              v-model="element.domains"
              :options="domains"
              :label="$gettext('Domains')"
              outlined
              multiple
              option-value="id"
              option-label="name"
            >
              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  class="q-ma-md"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="domains"
                    :pk="scope.opt.id"
                    :value="scope.opt.name"
                    icon="mdi-earth"
                  />
                </q-chip>
              </template>
            </q-select>
          </div>
        </div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-md">
            <q-select
              v-model="element.user_permissions"
              outlined
              use-input
              map-options
              multiple
              input-debounce="0"
              :label="$gettext('User Permissions')"
              :options="userPermissions"
              @filter="filterUserPermissions"
              @filter-abort="abortFilterUserPermissions"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  {{ scope.opt.name }}
                </q-item>
              </template>

              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  class="q-ma-md"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  {{ scope.opt.name }}
                </q-chip>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div v-translate class="text-h5 q-mt-sm q-mb-xs">Preferences</div>

        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <q-select
              v-model="element.domain_preference"
              :options="domains"
              :label="$gettext('Domain')"
              outlined
              option-value="id"
              option-label="name"
            >
              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  class="q-ma-md"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="domains"
                    :pk="scope.opt.id"
                    :value="scope.opt.name"
                    icon="mdi-earth"
                  />
                </q-chip>
              </template>
            </q-select>
          </div>

          <div class="col-6 col-md">
            <q-select
              v-model="element.scope_preference"
              :options="scopes"
              :label="$gettext('Scope')"
              outlined
              option-value="id"
              option-label="name"
            >
              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  class="q-ma-md"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="scopes"
                    :pk="scope.opt.id"
                    :value="scope.opt.name"
                    icon="mdi-earth"
                  />
                </q-chip>
              </template>
            </q-select>
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
import { dateMixin } from 'mixins/date'

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
  mixins: [detailMixin, dateMixin],
  data() {
    const route = 'user-profiles-list'
    const title = this.$gettext('User Profile')
    const element = {
      id: 0,
      is_active: false,
      is_superuser: false,
      is_staff: false,
      groups: [],
      domains: [],
      user_permissions: []
    }

    return {
      title,
      originalTitle: title,
      model: 'user-profiles',
      listRoute: route,
      addRoute: 'user-profile-add',
      detailRoute: 'user-profile-detail',
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
          text: this.$gettext('User Profiles'),
          icon: 'mdi-account-cog',
          to: route
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      groups: [],
      domains: [],
      scopes: [],
      userPermissions: [],
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return this.element.username !== undefined && this.element.username !== ''
    },

    elementText() {
      return this.element.id ? this.element.username : ''
    }
  },
  methods: {
    isValidEmail(val) {
      if (val === undefined || val === '') return true
      const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
      return emailPattern.test(val) || this.$gettext('Invalid email')
    },

    async loadRelated() {
      await this.$axios
        .get('/api/v1/token/accounts/groups/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            this.groups.push({
              id: item.id,
              name: item.name
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/domains/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            this.domains.push({
              id: item.id,
              name: item.name
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })

      await this.$axios
        .get('/api/v1/token/scopes/')
        .then((response) => {
          Object.entries(response.data.results).map(([index, item]) => {
            this.scopes.push({
              id: item.id,
              name: item.name
            })
          })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    elementData() {
      return {
        username: this.element.username,
        first_name: this.element.first_name,
        last_name: this.element.last_name,
        is_active: this.element.is_active,
        is_superuser: this.element.is_superuser,
        is_staff: this.element.is_staff,
        domain_preference: this.element.domain_preference
          ? this.element.domain_preference.id
          : null,
        scope_preference: this.element.scope_preference
          ? this.element.scope_preference.id
          : null,
        domains: this.element.domains.map((item) => item.id),
        groups: this.element.groups.map((item) => item.id),
        user_permissions: this.element.user_permissions.map((item) => item.id)
      }
    },

    filterUserPermissions(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/accounts/permissions', {
            params: { search: needle }
          })
          .then((response) => {
            this.userPermissions = response.data.results
          })
        /* this.userPermissions = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterUserPermissions() {
      // console.log('delayed filter aborted')
    }
  }
}
</script>
