<template>
  <q-card>
    <q-card-section>
      <q-btn-group v-if="$store.getters['auth/user'].is_superuser">
        <q-input v-model="value" outlined label-slot>
          <template #label><translate>Name</translate></template></q-input
        >
        <q-btn
          color="primary"
          icon="mdi-content-save-edit"
          :loading="loading"
          :disabled="loading"
          @click="updateName"
        >
          <q-tooltip
            ><translate>Save and continue editing</translate></q-tooltip
          >
        </q-btn>
      </q-btn-group>
      <div v-else class="text-h5">{{ name }}</div>
    </q-card-section>

    <q-card-section>
      <div class="row q-pa-md">
        <div class="col-md">
          <q-tooltip self="bottom middle"
            ><translate>full qualified domain name</translate></q-tooltip
          >
          <q-icon name="mdi-information" size="sm" /> {{ fqdn }}
        </div>

        <div class="col-md">
          <q-tooltip self="bottom middle"
            ><translate
              >Date of entry into the migasfree system</translate
            ></q-tooltip
          >
          <q-icon name="mdi-calendar-plus" size="sm" />
          {{ showDate(createdAt) }}
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-md">
          <q-tooltip self="bottom middle"
            ><translate>platform</translate></q-tooltip
          >
          <MigasLink
            model="platforms"
            :pk="project.platform.id"
            :value="project.platform.name"
            icon="mdi-layers"
          />
        </div>

        <div class="col-md">
          <q-tooltip self="bottom middle"
            ><translate>project</translate></q-tooltip
          >
          <MigasLink
            model="projects"
            :pk="project.id"
            :value="project.name"
            icon="mdi-sitemap"
          />
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-md">
          <q-tooltip self="bottom middle"
            ><translate>ip address</translate></q-tooltip
          >
          <q-icon name="mdi-ip-network" size="sm" />
          {{ ipAddress }}
        </div>
        <div class="col-md">
          <q-tooltip self="bottom middle"
            ><translate>forwarded ip address</translate></q-tooltip
          >
          <q-icon name="mdi-ip" size="sm" />
          {{ forwardedIpAddress }}
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="evenly">
      <q-btn-group>
        <q-btn
          icon="mdi-calendar-multiple"
          no-caps
          :to="{
            name: 'computer-events',
            params: { id: cid }
          }"
          ><translate>Events</translate></q-btn
        >
        <q-btn
          icon="mdi-head-sync-outline"
          no-caps
          :to="{
            name: 'computer-simulate',
            params: { id: cid }
          }"
          ><translate>Simulate synchronization</translate></q-btn
        >
        <q-btn
          icon="mdi-card-account-details-outline"
          no-caps
          :to="{
            name: 'computer-label',
            params: { id: cid }
          }"
          ><translate>Identification</translate></q-btn
        >
      </q-btn-group>
    </q-card-actions>
  </q-card>
</template>

<script>
import { dateMixin } from 'mixins/date'
import MigasLink from 'components/MigasLink'

export default {
  name: 'ComputerInfo',
  components: {
    MigasLink
  },
  mixins: [dateMixin],
  props: {
    cid: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    fqdn: {
      type: String,
      required: false,
      default: null
    },
    project: {
      type: Object,
      required: true
    },
    createdAt: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      required: false,
      default: null
    },
    forwardedIpAddress: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      value: this.name
    }
  },
  methods: {
    async updateName() {
      this.loading = true
      await this.$axios
        .patch(`/api/v1/token/computers/${this.cid}/`, {
          name: this.value
        })
        .then((response) => {
          this.$store.dispatch(
            'ui/notifySuccess',
            this.$gettext('Name has been changed!')
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
        .finally(() => (this.loading = false))
    }
  }
}
</script>
