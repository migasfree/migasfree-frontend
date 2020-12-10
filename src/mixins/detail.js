export const detailMixin = {
  data() {
    return {
      model: '',
      listRoute: ''
    }
  },
  methods: {
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
