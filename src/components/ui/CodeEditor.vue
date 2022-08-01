<template>
  <v-ace-editor
    v-model:value="code"
    :lang="highlightLang"
    :theme="editorTheme"
    class="editor"
  />
</template>

<script>
import { reactive, computed } from 'vue'
import { useQuasar } from 'quasar'

import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-sh'
import 'ace-builds/src-noconflict/mode-perl'
import 'ace-builds/src-noconflict/mode-php'
import 'ace-builds/src-noconflict/mode-ruby'
import 'ace-builds/src-noconflict/mode-powershell'
import 'ace-builds/src-noconflict/mode-batchfile'
import 'ace-builds/src-noconflict/theme-chrome'
import 'ace-builds/src-noconflict/theme-cobalt'

export default {
  name: 'CodeEditor',
  components: { VAceEditor },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: false,
      default: 'python',
    },
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const $q = useQuasar()

    const editorLanguages = reactive({
      python: 'python',
      bash: 'sh',
      perl: 'perl',
      php: 'php',
      ruby: 'ruby',
      cmd: 'batchfile',
      powershell: 'powershell',
    })

    const highlightLang = computed(() => {
      return editorLanguages[props.language]
    })

    const editorTheme = computed(() => {
      return $q.dark.isActive ? 'cobalt' : 'chrome'
    })

    const code = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit('update:model-value', val)
      },
    })

    return {
      editorLanguages,
      highlightLang,
      editorTheme,
      code,
    }
  },
}
</script>

<style scoped>
.editor {
  height: 300px;
}
</style>
