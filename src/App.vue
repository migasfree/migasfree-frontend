<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',

  created() {
    this.$q.dark.set(this.$q.cookies.get('darkMode'), { expires: '30d' })
    this.$language.current = this.$q.cookies.has('language')
      ? this.$q.cookies.get('language')
      : this.$language.current
  },
}
</script>
