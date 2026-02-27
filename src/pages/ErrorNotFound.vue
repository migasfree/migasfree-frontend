<template>
  <div class="error-page fullscreen flex flex-center">
    <!-- Animated background effect -->
    <div class="bg-glow"></div>

    <div class="error-container glass-card q-pa-xl text-center">
      <div class="error-content column items-center">
        <!-- Visual Icon with Glow -->
        <div class="icon-wrapper q-mb-lg">
          <q-icon :name="appIcon('warning')" class="error-icon" size="120px" />
          <div class="icon-shadow"></div>
        </div>

        <h1 class="text-h1 text-weight-bolder brand-text q-ma-none">404</h1>

        <div class="text-h4 text-weight-light q-mt-md opacity-80">
          {{ $gettext('Oops. Nothing here...') }}
        </div>

        <p class="text-subtitle1 q-mt-lg text-grey-7 max-width-p">
          {{
            $gettext(
              "The page you are looking for doesn't exist or has been moved.",
            )
          }}
        </p>

        <q-btn
          unelevated
          rounded
          color="primary"
          size="lg"
          :to="{ name: 'home' }"
          class="q-mt-xl action-btn q-px-xl text-weight-bold"
          :label="$gettext('Go Home')"
          icon="mdi-home-variant-outline"
        >
          <q-tooltip
            anchor="top middle"
            self="bottom middle"
            :offset="[10, 10]"
          >
            {{ $gettext('Return to Dashboard') }}
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Footer Credit -->
    <div class="error-footer fixed-bottom text-center q-pb-md opacity-40">
      <div class="text-caption">
        migasfree &bull; 2010-{{ new Date().getFullYear() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGettext } from 'vue3-gettext'
import { appIcon } from 'composables/element'

defineOptions({ name: 'ErrorNotFound' })

const { $gettext } = useGettext()
</script>

<style scoped>
.error-page {
  background: var(--bg-body);
  position: relative;
  overflow: hidden;
}

/* Dynamic background glow */
.bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(var(--brand-primary-rgb), 0.1) 0%,
    transparent 70%
  );
  filter: blur(80px);
  z-index: 0;
  animation: glow-pulse 10s infinite alternate ease-in-out;
}

@keyframes glow-pulse {
  from {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.error-container {
  z-index: 1;
  max-width: 90%;
  width: 500px;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: float-card 1.2s ease-out;
}

@keyframes float-card {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.brand-text {
  color: var(--brand-primary);
  line-height: 1;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.error-icon {
  color: var(--brand-primary);
  opacity: 0.9;
  filter: drop-shadow(0 8px 16px rgba(var(--brand-primary-rgb), 0.2));
}

.icon-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

.max-width-p {
  max-width: 320px;
}

.action-btn {
  box-shadow: 0 8px 24px rgba(var(--brand-primary-rgb), 0.3);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(var(--brand-primary-rgb), 0.4);
}

/* Dark mode overrides */
[data-theme='dark'] .error-container {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .brand-text {
  color: var(--brand-tertiary);
}

[data-theme='dark'] .error-icon {
  color: var(--brand-tertiary);
}
</style>
