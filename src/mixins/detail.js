export const detailMixin = {
  data() {
    return {
      model: '',
      listRoute: '',
      element: null,
      emptyElement: null,
      title: null,
      originalTitle: null,
      loading: false
    }
  },
  computed: {
    elementText() {
      return this.element.id ? this.element.name : ''
    }
  },
  created() {
    if (this.$route.params.id) {
      this.breadcrumbs.push({
        text: this.$gettext('Results'),
        to: this.listRoute
      })
      this.breadcrumbs.push({
        text: 'Id'
      })
    } else {
      this.breadcrumbs.push({ text: this.$gettext('Add') })
    }
  },
  async mounted() {
    if (this.$route.params.id) {
      await this.$axios
        .get(`/api/v1/token/${this.model}/${this.$route.params.id}/`)
        .then((response) => {
          this.element = response.data
          this.breadcrumbs.find((x) => x.text === 'Id').text = this.elementText
          this.title = `${this.title}: ${this.elementText}`
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }

    this.loadRelated()
  },
  methods: {
    async loadRelated() {},

    setRelated() {},

    resetRelated() {},

    async updateElement(action = null) {
      if (this.element.id) {
        this.loading = true
        await this.$axios
          .patch(
            `/api/v1/token/${this.model}/${this.element.id}/`,
            this.elementData()
          )
          .then((response) => {
            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Data has been changed!')
            )
            if (action === 'return') {
              this.$router.push({ name: this.listRoute })
            } else if (action === 'add') {
              this.element = this.emptyElement
              this.resetRelated()

              if (this.breadcrumbs.length === 5) this.breadcrumbs.pop()
              this.breadcrumbs[3].text = this.$gettext('Add')
              this.$router.push({ name: this.addRoute })
              this.title = this.originalTitle
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      } else {
        this.loading = true
        const data = this.elementData()
        await this.$axios
          .post(
            `/api/v1/token/${this.model}/`,
            data,
            data instanceof FormData
              ? {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                }
              : {}
          )
          .then((response) => {
            this.element = response.data
            this.setRelated()

            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Data has been added!')
            )

            if (action === 'return') {
              this.$router.push({ name: this.listRoute })
            } else if (action === 'add') {
              this.element = this.emptyElement
              this.resetRelated()

              this.$router.push({ name: this.addRoute })
            } else {
              if (this.breadcrumbs.length === 4) {
                this.breadcrumbs.pop()
                this.breadcrumbs.push({
                  text: this.$gettext('Results'),
                  to: this.listRoute
                })
                this.breadcrumbs.push({
                  text: this.element.name
                })
                this.title = `${this.originalTitle}: ${this.element.name}`
              }
              this.$router.push({
                name: this.detailRoute,
                params: { id: this.element.id }
              })
            }
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      }
    },

    async remove() {
      await this.$axios
        .delete(`/api/v1/token/${this.model}/${this.element.id}/`)
        .then((response) => {
          this.$router.push({ name: this.listRoute })
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
