<template>
  <div>
    <b-form-checkbox
      v-model="checked"
      @change="postTerminado"
      name="check-button"
      switch
      size="lg"
    ></b-form-checkbox>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checked: false,
    };
  },

  methods: {
    async postTerminado() {
      let checkLocal = true;
      if (this.checked) {
        checkLocal = 1;
      } else {
        checkLocal = 0;
      }

      const data = new URLSearchParams();
      data.set("id_orden", this.id_orden);
      data.set("id_lotes_detalles", this.id_lotes_detalles);
      data.set("id_ordenes_productos", this.id_ordenes_productos);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("id_departamento", this.$store.state.login.currentDepartamentId);
      data.set("terminado", checkLocal);

      await this.$axios
        .post(`${this.$config.API}/empleados/tareas`, data)
        .then((res) => {
          // this.urlLink = res.data.linkdrive
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se guardó la tarea, intente de nuevo</p><p>${err}</p>`,
            type: "warning",
          });
        });
    },
  },

  mounted() {
    if (this.terminado) {
      this.checked = true;
    }
  },

  props: ["id_lotes_detalles", "terminado", "id_orden", "id_ordenes_productos"],
};
</script>
