import { copyToClipboard } from 'quasar'

export const copyPasteMixin = {
  computed: {
    hasPaste() {
      return 'clipboard' in navigator && 'readText' in navigator.clipboard
    }
  },

  methods: {
    copyList(model, element) {
      if (
        this.$refs[element] !== null &&
        this.$refs[element].value.length > 0
      ) {
        const content = this.$refs[element].value.map((item) => item.id)

        copyToClipboard(JSON.stringify({ [model]: content })).then(() => {
          this.$store.dispatch(
            'ui/notifySuccess',
            this.$gettext('Content copied to clipboard')
          )
        })
      }
    },

    pasteList(element) {
      if (this.$refs[element] !== null) {
        let data = null

        if (!('readText' in navigator.clipboard)) {
          this.$store.dispatch(
            'ui/notifyError',
            this.$gettext('This browser does not implement clipboard reading')
          )
          return
        }

        navigator.clipboard.readText().then((value) => {
          if (value) {
            try {
              data = JSON.parse(value)
            } catch (error) {
              console.error(error, value)
            }

            if (typeof data === 'object') {
              const model = Object.keys(data)[0]
              data[model].map((item) => {
                if (typeof item === 'number')
                  this.$axios
                    .get(`/api/v1/token/${model}/${item}/`)
                    .then((response) => {
                      this.$refs[element].add(response.data)
                    })
              })
            }
          }
        })
      }
    }
  }
}
