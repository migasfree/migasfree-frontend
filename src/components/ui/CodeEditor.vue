<template>
  <vue-codeditor
    v-model="localValue"
    :mode="highlightLang"
    :theme="editorTheme"
  />
</template>

<script>
export default {
  name: 'CodeEditor',
  props: {
    value: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: false,
      default: 'python'
    }
  },
  data() {
    return {
      editorLanguages: {
        python: 'python',
        bash: 'sh',
        perl: 'perl',
        php: 'php',
        ruby: 'ruby',
        cmd: 'batchfile',
        powershell: 'powershell'
      },
      localValue: this.value
    }
  },
  computed: {
    highlightLang() {
      return this.editorLanguages[this.language]
    },

    editorTheme() {
      return this.$q.dark.isActive ? 'cobalt' : 'chrome'
    }
  },
  watch: {
    localValue(newValue) {
      if (newValue === null) newValue = []
      this.$emit('input', newValue)
    },
    value(newValue) {
      this.localValue = newValue
    }
  }
}
</script>
