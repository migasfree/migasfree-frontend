import { config } from '@vue/test-utils'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Global stubs for Quasar components to avoid resolution warnings
config.global.stubs = {
  'q-icon': { template: '<div class="q-icon" />' },
  'q-badge': { template: '<div class="q-badge"><slot /></div>' },
  'q-spinner': { template: '<div class="q-spinner" />' },
  'q-menu': { template: '<div class="q-menu"><slot /></div>' },
  'q-tooltip': { template: '<div class="q-tooltip"><slot /></div>' },
  'q-avatar': { template: '<div class="q-avatar"><slot /></div>' },
  'q-checkbox': { template: '<div class="q-checkbox" />' },
  'q-item-label': { template: '<div class="q-item-label"><slot /></div>' },
  'q-dialog': { template: '<div class="q-dialog"><slot /></div>' },
  'q-toolbar': { template: '<div class="q-toolbar"><slot /></div>' },
  'q-toolbar-title': { template: '<div class="q-toolbar-title"><slot /></div>' },
  'q-list': { template: '<div class="q-list"><slot /></div>' },
  'q-item': { template: '<div class="q-item"><slot /></div>' },
  'q-item-section': { template: '<div class="q-item-section"><slot /></div>' },
  'q-space': { template: '<div class="q-space" />' },
  'q-btn': {
    template: '<button class="q-btn" @click="$emit(\'click\')"><slot /></button>',
  },
  'q-btn-dropdown': {
    template: '<div class="q-btn-dropdown"><slot /></div>',
  },
  'q-separator': { template: '<div class="q-separator" />' },
  'q-pagination': { template: '<div class="q-pagination" />' },
  'q-breadcrumbs': { template: '<div class="q-breadcrumbs"><slot /></div>' },
  'q-breadcrumbs-el': {
    template: '<div class="q-breadcrumbs-el"><slot /></div>',
  },
  'q-card': { template: '<div class="q-card"><slot /></div>' },
  'q-card-section': { template: '<div class="q-card-section"><slot /></div>' },
  'q-card-actions': { template: '<div class="q-card-actions"><slot /></div>' },
  'q-input': { template: '<div class="q-input" />' },
  'q-select': { template: '<div class="q-select" />' },
  'q-toggle': { template: '<div class="q-toggle" />' },
  'q-scroll-area': { template: '<div class="q-scroll-area"><slot /></div>' },
  'q-inner-loading': { template: '<div class="q-inner-loading"><slot /></div>' },
}

// Global directives
config.global.directives = {
  'close-popup': {},
}
