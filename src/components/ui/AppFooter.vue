<template>
  <q-footer>
    <q-toolbar>
      &copy; 2010-{{ new Date().getFullYear() }}
      <q-btn
        stretch
        flat
        label="migasfree"
        type="a"
        href="http://www.migasfree.org/"
        no-caps
        size="16px"
        ><q-tooltip><translate>Website</translate></q-tooltip></q-btn
      >
      <q-btn
        stretch
        flat
        label="GPLv3"
        type="a"
        href="http://www.gnu.org/licenses/gpl.html"
        no-caps
        size="16px"
        ><q-tooltip><translate>License</translate></q-tooltip></q-btn
      >
      <q-btn
        stretch
        flat
        icon="mdi-github"
        type="a"
        href="https://github.com/migasfree/migasfree"
        ><q-tooltip><translate>Source code</translate></q-tooltip></q-btn
      >

      <q-space />

      <q-btn stretch flat icon="mdi-api" type="a" :href="apiLink">
        <q-tooltip><translate>API Rest Info</translate></q-tooltip></q-btn
      >

      <q-btn
        stretch
        flat
        icon="mdi-text-box-multiple"
        type="a"
        href="http://fun-with-migasfree.readthedocs.io/"
      >
        <q-tooltip anchor="top middle" self="bottom right"
          ><translate>migasfree documentation</translate></q-tooltip
        ></q-btn
      >
    </q-toolbar>
  </q-footer>
</template>

<script>
export default {
  data() {
    return {
      apiLink: `${this.$axios.defaults.baseURL}/docs/`
    }
  }
}
</script>
