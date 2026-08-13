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
        <template #cell(tasa)="data">
          <span v-if="data.item.es_base">1 (base)</span>
          <span v-else-if="editandoTasaId === data.item._id">
            <b-input-group size="sm" style="max-width: 160px">
              <campo-decimal
                v-model="tasaEnEdicion"
                :decimals="6"
                autofocus
                @keyup.enter="guardarTasa(data.item)"
              ></campo-decimal>
              <b-input-group-append>
                <b-button variant="success" @click="guardarTasa(data.item)">
                  <b-icon icon="check"></b-icon>
                </b-button>
                <b-button variant="outline-secondary" @click="editandoTasaId = null">
                  <b-icon icon="x"></b-icon>
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </span>
          <span v-else>
            <b-badge :variant="tasaBadgeVariant(data.item.codigo)" class="mr-1">
              {{ tasaTexto(data.item.codigo) }}
            </b-badge>
            <b-button size="sm" variant="link" class="p-0" title="Editar tasa" @click="iniciarEdicionTasa(data.item)">
              <b-icon icon="pencil"></b-icon>
            </b-button>
          </span>
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
          <admin-metodos-pago-manager :moneda="data.item" class="mr-2 d-inline-block" />
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
      tasas: {}, // { [codigo]: {tasa, fuente, fecha} }, ver cargarTasas()
      editandoTasaId: null,
      tasaEnEdicion: null,
      fields: [
        { key: "codigo", label: "Código" },
        { key: "nombre", label: "Nombre" },
        { key: "es_base", label: "" },
        { key: "activo", label: "Estado" },
        { key: "tasa", label: "Tasa" },
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
    async cargarTasas() {
      try {
        const { data } = await this.$axios.get(`${this.$config.API}/tasas-cambio`);
        const mapa = {};
        (data?.data || []).forEach((t) => {
          mapa[t.codigo] = t;
        });
        this.tasas = mapa;
      } catch (err) {
        console.error("Error al cargar tasas de cambio:", err);
      }
    },
    // Solo redondea lo que se muestra en pantalla -- el cálculo real de
    // conversión (en MetodosPagoDinamico.vue) sigue usando el valor completo
    // que devuelve GET /tasas-cambio, sin perder precisión.
    formatearTasa(valor) {
      return Number(valor).toFixed(4);
    },
    tasaTexto(codigo) {
      const t = this.tasas[codigo];
      if (!t || t.tasa === null || t.tasa === undefined) return "Sin configurar";
      const etiqueta = t.fuente === "manual" ? "Manual" : "Automática";
      return `${etiqueta}: ${this.formatearTasa(t.tasa)}`;
    },
    tasaBadgeVariant(codigo) {
      const t = this.tasas[codigo];
      if (!t || t.tasa === null || t.tasa === undefined) return "danger";
      return t.fuente === "manual" ? "info" : "success";
    },
    iniciarEdicionTasa(moneda) {
      const t = this.tasas[moneda.codigo];
      this.tasaEnEdicion = t && t.tasa !== null && t.tasa !== undefined ? this.formatearTasa(t.tasa) : null;
      this.editandoTasaId = moneda._id;
    },
    async guardarTasa(moneda) {
      const valor = parseFloat(this.tasaEnEdicion);
      if (!valor || valor <= 0) {
        this.$bvToast.toast("Indique una tasa mayor a 0", { variant: "danger" });
        return;
      }

      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id", moneda._id);
      data.set("tasa", valor);

      try {
        await this.$axios.post(`${this.$config.API}/monedas/establecer-tasa`, data);
        this.editandoTasaId = null;
        await this.cargarTasas();
        // Refresca la tasa en el store global para que los formularios de
        // captura de pago (ej. Abono a la Orden) la reflejen sin recargar.
        await this.$store.dispatch("login/cargarTasasPorCodigo");
      } catch (err) {
        const errData = err.response && err.response.data;
        console.error("Error al establecer la tasa:", err);
        this.$bvToast.toast((errData && errData.error) || "No se pudo establecer la tasa", {
          variant: "danger",
        });
      } finally {
        this.overlay = false;
      }
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
        await Promise.all([this.cargarMonedas(), this.cargarTasas()]);
      } catch (err) {
        const errData = err.response && err.response.data;
        // El select solo ofrece monedas reales del catálogo del país -- si ya
        // existe una fila desasignada con ese código, la única acción posible
        // es reactivarla (no hay creación libre de monedas nuevas). Preguntar
        // "¿desea reactivarla?" no tiene sentido aquí: se reactiva directo.
        if (err.response && err.response.status === 409 && errData && errData.eliminado_existente) {
          await this.addCurrency(errData.id);
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
        await Promise.all([this.cargarMonedas(), this.cargarTasas()]);
        await this.$store.dispatch("login/cargarTasasPorCodigo");
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
    await Promise.all([this.cargarMonedas(), this.cargarMonedasSoportadas(), this.cargarTasas()]);
  },
};
</script>
