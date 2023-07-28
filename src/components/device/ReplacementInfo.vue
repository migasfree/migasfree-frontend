<template>
  <transition name="info">
    <div v-if="element && !isLoading && !loading">
      <p>
        <translate>Device</translate>: <strong>{{ element.name }}</strong>
        <span v-if="element.location"> ({{ element.location }})</span>
      </p>

      <q-list
        v-if="
          'logical_devices' in element && element.logical_devices.length > 0
        "
      >
        <q-item-label header
          ><translate
            >Computers in Logical Devices (by Capability)</translate
          ></q-item-label
        >
        <q-expansion-item
          v-for="item in mutableElement.logical_devices"
          :key="item.id"
          default-opened
          expand-separator
        >
          <template #header>
            <MigasLink
              model="devices/capabilities"
              :pk="item.capability.id"
              :value="item.capability.name"
            />
          </template>

          <q-list v-for="computer in item.computers" :key="computer.id">
            <q-item inset-level="1">
              <MigasLink
                model="computers"
                :pk="computer.id"
                :value="computer.__str__ || ''"
                :icon="elementIcon(computer.status)"
                :tooltip="computer.summary"
              />
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </div>

    <div v-else-if="isLoading || loading">
      <q-spinner-dots color="primary" size="3em" />
    </div>
  </transition>
</template>

<script>
import { ref, reactive, watch } from 'vue'

import { api } from 'boot/axios'

import MigasLink from 'components/MigasLink'

import { useElement } from 'composables/element'

export default {
  name: 'ReplacementInfo',
  components: {
    MigasLink,
  },
  props: {
    element: {
      type: Object,
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const { elementIcon } = useElement()

    const mutableElement = reactive(props.element)
    const sentinel = ref(false)
    const loading = ref(true)

    const loadComputers = async () => {
      Object.entries(props.element.logical_devices).map(([key, item]) => {
        if ('attributes' in item) {
          let computers = []
          Object.entries(item.attributes).map(async ([keyAtt, att]) => {
            if (att.property_att.prefix === 'CID') {
              await api
                .get(`/api/v1/token/computers/${parseInt(att.value)}`)
                .then((response) => {
                  computers.push(response.data)
                })
            }

            mutableElement.logical_devices[key].computers = []
            Object.assign(
              mutableElement.logical_devices[key].computers,
              computers,
            )

            if (!item.attributes[key + 1]) {
              loading.value = false
            }
          })
        } else {
          loading.value = false
        }
      })
    }

    watch(
      () => props.element,
      (val) => {
        if (
          !sentinel.value &&
          'logical_devices' in val &&
          val.logical_devices.length > 0
        ) {
          sentinel.value = true
          loading.value = true
          loadComputers()
        }
      },
      { deep: true },
    )

    return { mutableElement, loading, elementIcon }
  },
}
</script>

<style scoped>
.info-enter-active {
  transition: all 0.8s ease;
}
.info-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.info-enter,
.info-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
