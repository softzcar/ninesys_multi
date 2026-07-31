<template>
  <div>
    <h5>Monedas de la Empresa</h5>
    <p class="text-muted small">
      Estas son las monedas reales configuradas para tu empresa. La moneda base no puede eliminarse.
    </p>

    <b-overlay :show="overlay" spinner-small>
      <b-table :items="monedas" :fields="fields" striped responsive small>
        <template #cell(codigo)="data">
          <strong>{{ data.item.codigo }}</strong>
        </template>
        <template #cell(es_base)="data">
          <b-badge v-if="data.item.es_base" variant="primary">Base</b-badge>
        </template>
        <template #cell(activo)="data">
          <b-badge :variant="data.item.activo ? 'success' : 'secondary'">
            {{ data.item.activo ? "Activa" : "Inactiva" }}
          </b-badge>
        </template>
        <template #cell(acciones)="data">
          <b-button
            size="sm"
            variant="outline-primary"
            class="mr-2"
            title="Establecer como moneda base"
            :disabled="!!data.item.es_base"
            @click="establecerBase(data.item)"
          >
            Hacer Base
          </b-button>
          <b-button
            size="sm"
            variant="danger"
            title="Desasignar de la empresa"
            :disabled="!!data.item.es_base"
            @click="eliminarMoneda(data.item)"
          >
            <b-icon icon="trash"></b-icon>
          </b-button>
        </template>
      </b-table>

      <hr />

      <h5>Añadir Moneda</h5>
      <b-form @submit.prevent="addCurrency">
        <b-row>
          <b-col md="8">
            <b-form-group
              label="Moneda:"
              label-for="new-moneda"
              description="Solo se listan las monedas soportadas para el país de la empresa que aún no están asignadas"
            >
              <b-form-select
                id="new-moneda"
                v-model="idMonedaSoportadaSeleccionada"
                :options="opcionesMonedas"
              ></b-form-select>
            </b-form-group>
          </b-col>
          <b-col md="4" class="d-flex align-items-end">
            <b-button type="submit" variant="primary" :disabled="!idMonedaSoportadaSeleccionada" class="mb-3">
              Añadir
            </b-button>
          </b-col>
        </b-row>
      </b-form>
    </b-overlay>
  </div>
</template>

<script>
export default {
  name: "MonedasManager",
  data() {
    return {
      monedas: [],
      monedasSoportadas: [],
      idMonedaSoportadaSeleccionada: null,
      overlay: false,
      monedasRequestId: 0, // ver cargarMonedas()
      fields: [
        { key: "codigo", label: "Código" },
        { key: "nombre", label: "Nombre" },
        { key: "es_base", label: "" },
        { key: "activo", label: "Estado" },
        { key: "acciones", label: "Acciones" },
      ],
    };
  },
  computed: {
    opcionesMonedas() {
      const codigosAsignados = this.monedas.map((m) => m.codigo);
      const opciones = this.monedasSoportadas
        .filter((m) => !codigosAsignados.includes(m.codigo))
        .map((m) => ({
          value: m.id_moneda_soportada,
          text: `${m.nombre} (${m.codigo})`,
        }));
      return [{ value: null, text: "Seleccione una moneda" }, ...opciones];
    },
  },
  methods: {
    async cargarMonedas() {
      // Guarda de secuencia: si el usuario dispara varias acciones seguidas
      // (ej. cambiar la base 2 veces rápido, o desasignar justo después de
      // establecer base), las respuestas del GET pueden llegar en un orden
      // distinto al que se pidieron. Sin esto, una respuesta más vieja
      // llegando después de una más nueva pisa la tabla con datos
      // desactualizados hasta que el usuario recarga la página a mano.
      const requestId = ++this.monedasRequestId;
      this.overlay = true;
      try {
        const { data } = await this.$axios.get(`${this.$config.API}/monedas`);
        if (requestId === this.monedasRequestId) {
          this.monedas = data?.data || [];
        }
      } catch (err) {
        console.error("Error al cargar monedas de la empresa:", err);
      } finally {
        if (requestId === this.monedasRequestId) {
          this.overlay = false;
        }
      }
      this.$emit("loaded", this.monedas);
    },
    async cargarMonedasSoportadas() {
      const idPais = this.$store.state.login.dataEmpresa?.id_pais;
      if (!idPais) {
        this.monedasSoportadas = [];
        return;
      }
      try {
        const { data } = await this.$axios.get(
          `${this.$config.API}/monedas-soportadas/${idPais}`
        );
        this.monedasSoportadas = data?.data || [];
      } catch (err) {
        console.error("Error al cargar monedas soportadas:", err);
        this.monedasSoportadas = [];
      }
    },
    async addCurrency(reactivarId = null) {
      const moneda = this.monedasSoportadas.find(
        (m) => m.id_moneda_soportada === this.idMonedaSoportadaSeleccionada
      );
      if (!moneda) return;

      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id_moneda_soportada", moneda.id_moneda_soportada);
      data.set("codigo", moneda.codigo);
      data.set("nombre", moneda.nombre);
      data.set("simbolo", moneda.simbolo || "");
      if (reactivarId) {
        data.set("reactivar_id", reactivarId);
      }

      try {
        await this.$axios.post(`${this.$config.API}/monedas`, data);
        this.idMonedaSoportadaSeleccionada = null;
        await this.cargarMonedas();
      } catch (err) {
        const errData = err.response && err.response.data;
        if (err.response && err.response.status === 409 && errData && errData.eliminado_existente) {
          this.overlay = false;
          try {
            await this.$confirm(
              `Ya existe una moneda eliminada llamada "${errData.nombre}". ¿Desea reactivarla?`,
              "Moneda ya existe",
              "question"
            );
            await this.addCurrency(errData.id);
          } catch (e) {
            // Usuario canceló la reactivación
          }
          return;
        }
        console.error("Error al agregar la moneda:", err);
        this.$bvToast.toast((errData && errData.error) || "No se pudo agregar la moneda", {
          variant: "danger",
        });
      } finally {
        this.overlay = false;
      }
    },
    async eliminarMoneda(moneda) {
      if (moneda.es_base) return;

      try {
        await this.$confirm(
          `¿Desea desasignar la moneda "${moneda.nombre}" de la empresa?`,
          "Desasignar Moneda",
          "warning"
        );

        this.overlay = true;
        const data = new URLSearchParams();
        data.set("id", moneda._id);
        await this.$axios.post(`${this.$config.API}/monedas/eliminar`, data);
        await this.cargarMonedas();
      } catch (err) {
        if (err !== false) {
          console.error("Error al desasignar la moneda:", err);
        }
      } finally {
        this.overlay = false;
      }
    },
    async establecerBase(moneda) {
      if (moneda.es_base) return;

      try {
        await this.$confirm(
          `¿Desea establecer "${moneda.nombre}" como la moneda base de la empresa?`,
          "Establecer Moneda Base",
          "question"
        );

        this.overlay = true;
        const data = new URLSearchParams();
        data.set("id", moneda._id);
        await this.$axios.post(`${this.$config.API}/monedas/establecer-base`, data);
        await this.cargarMonedas();
      } catch (err) {
        if (err !== false) {
          const errData = err.response && err.response.data;
          console.error("Error al establecer la moneda base:", err);
          this.$bvToast.toast((errData && errData.error) || "No se pudo establecer la moneda base", {
            variant: "danger",
          });
        }
      } finally {
        this.overlay = false;
      }
    },
  },
  async mounted() {
    await Promise.all([this.cargarMonedas(), this.cargarMonedasSoportadas()]);
  },
};
</script>
