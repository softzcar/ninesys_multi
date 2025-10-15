<template>
  <div>
    <b-button size="sm" class="mb-4" @click="confirmRemove" variant="danger">
      <b-icon icon="trash"></b-icon>
    </b-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "Eliminar categoría",
    };
  },

  methods: {
    confirmRemove() {
      this.$confirm(
        ``,
        `¿Desea eliminar la categoría ${this.nombre}?`,
        "question"
      ).then(() => {
        this.removeCat();
      });
    },

    async removeCat() {
      await this.$axios
        .delete(`${this.$config.API}/categories/${this.id}`)
        .then((res) => {
          this.$emit("reload");
          this.$fire({
            title: `La categoría ${this.nombre} se ha eliminado`,
            html: `<p></p>`,
            type: "success",
          });
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se eliminó la categoría ${this.nombre}</p><p>${err}</p>`,
            type: "error",
          });
        });
    },
  },

  props: ["id", "reload", "nombre"],
};
</script>