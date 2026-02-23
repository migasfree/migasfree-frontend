<template>
  <div class="search-container">
    <div class="search-bar" :class="{ 'is-focused': isFocused }">
      <!-- Scope Selector -->
      <q-btn-dropdown
        flat
        no-caps
        dense
        class="scope-selector"
        content-class="scope-menu"
        dropdown-icon="expand_more"
      >
        <template #label>
          <q-icon :name="selectedScope.icon" size="20px" />
        </template>

        <q-list class="scope-list">
          <q-item
            v-for="scope in searchScopes"
            :key="scope.id"
            v-close-popup
            clickable
            class="scope-item"
            :active="selectedScope.id === scope.id"
            @click="selectedScope = scope"
          >
            <q-item-section avatar>
              <q-icon :name="scope.icon" size="20px" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-separator vertical class="search-sep" />

      <!-- Input -->
      <q-input
        v-model="searchText"
        borderless
        :filled="false"
        :standout="false"
        dense
        :placeholder="`${$gettext('Search')}...`"
        class="search-input"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown.enter="handleSearch"
      >
        <template #append>
          <div class="row items-center no-wrap full-height">
            <q-btn
              v-if="searchText"
              flat
              round
              dense
              icon="cancel"
              size="sm"
              class="clear-btn"
              @click="searchText = ''"
            />
            <q-icon
              name="search"
              size="20px"
              class="search-icon-hint q-ml-xs"
            />
          </div>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { modelIcon } from 'composables/element'

defineOptions({ name: 'SearchBox' })

const router = useRouter()
const { $gettext } = useGettext()

const searchText = ref('')
const isFocused = ref(false)

const searchScopes = [
  {
    id: 'computers',
    label: $gettext('Computers'),
    icon: modelIcon('computers'),
    route: 'computers-list',
  },
  {
    id: 'attributes',
    label: $gettext('Attributes'),
    icon: modelIcon('attributes'),
    route: 'features-list',
  },
  {
    id: 'tags',
    label: $gettext('Tags'),
    icon: modelIcon('tags'),
    route: 'tags-list',
  },
  {
    id: 'deployments',
    label: $gettext('Deployments'),
    icon: modelIcon('deployments'),
    route: 'deployments-list',
  },
  {
    id: 'packages',
    label: $gettext('Packages'),
    icon: modelIcon('packages'),
    route: 'packages-list',
  },
  {
    id: 'apps',
    label: $gettext('Applications'),
    icon: modelIcon('catalog/apps'),
    route: 'apps-list',
  },
  {
    id: 'devices',
    label: $gettext('Devices'),
    icon: modelIcon('devices/devices'),
    route: 'devices-list',
  },
]

const selectedScope = ref(searchScopes[0])

const handleSearch = () => {
  const query = searchText.value.trim()
  if (query) {
    router.push({ name: selectedScope.value.route, query: { search: query } })
  }
}
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  height: 42px;
  padding: 0 4px;
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-bar.is-focused {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

/* Scope selector */
.scope-selector {
  height: 34px;
  border-radius: 12px;
  padding: 0 8px;
  color: var(--header-text);
  font-weight: 700;
}

.search-sep {
  height: 24px;
  background: rgba(255, 255, 255, 0.2) !important;
  margin: 0 4px;
}

/* Input */
.search-input {
  flex: 1;
}

:deep(.search-input .q-field__control) {
  padding: 0 4px 0 0 !important;
  min-height: 40px !important;
  box-shadow: none !important;
  background: transparent !important;
}

:deep(.search-input .q-field__control::before),
:deep(.search-input .q-field__control::after) {
  display: none !important;
}

:deep(.search-input .q-field__native) {
  color: #fff !important;
  font-size: 1rem;
  font-weight: 600;
  padding: 0 0 0 8px !important;
  line-height: normal;
}

:deep(.search-input .q-field__native::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
  opacity: 1 !important;
  font-weight: 500;
}

.search-icon-hint {
  color: rgba(255, 255, 255, 0.5);
  margin-right: 8px;
  transition: all 0.3s ease;
}

.is-focused .search-icon-hint {
  color: #fff;
  transform: scale(1.1);
}

.clear-btn {
  color: rgba(255, 255, 255, 0.6);
  margin-right: 4px;
}

.clear-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}
</style>

<style>
/* Portal styles (scope dropdown menu) */
.scope-menu {
  background: rgba(var(--bg-card-rgb), 0.8) !important;
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
  padding: 8px !important;
  min-width: 220px !important;
}

.scope-list {
  background: transparent !important;
  padding: 0;
}

.scope-item {
  font-weight: 700;
  border-radius: 10px;
  margin-bottom: 2px;
  transition: all 0.25s ease;
  color: var(--text-main);
}

.scope-item:hover {
  background: rgba(var(--brand-primary-rgb), 0.05) !important;
}

[data-theme='dark'] .scope-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.scope-item.q-item--active {
  color: var(--brand-primary) !important;
  background: rgba(var(--brand-primary-rgb), 0.1) !important;
}

[data-theme='dark'] .scope-item.q-item--active {
  color: var(--brand-tertiary) !important;
  background: rgba(254, 218, 0, 0.1) !important;
}
</style>
