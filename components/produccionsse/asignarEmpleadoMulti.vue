<template>
  <div>
    <b-form inline class="mb-3 mt-4">
      <b-form-group id="select-empleado" label-for="select-empleado">
        <b-form-select id="select-empleado" v-model="empleado" :options="options" class="mr-2"
          @change="agregarEmpleado"></b-form-select>
      </b-form-group>

      <b-form-group id="button-group-1">
        <span class="porcentaje">Total porcentaje {{ totalPorcentaje }}%</span>
      </b-form-group>
    </b-form>

    <b-table striped hover :fields="fieldsEmpleados" :items="form" small>
      <template #cell(empleado)="row">
        {{ nombreEmpleado(row.item.empleado) }}
      </template>
      <template #cell(comision)="row">
        {{ porcentajeEmpleado(row.item.empleado) }}%
      </template>
      <template #cell(id)="row">
        <b-button variant="danger" size="sm" @click="quitarEmpleado(row.item.empleado, row.index)" aria-label="Quitar empleado">
          <b-icon icon="trash"></b-icon>
        </b-button>
      </template>
    </b-table>

    <!-- Un solo empleado: se le asigna todo automáticamente, sin pedir nada más -->
    <b-alert v-if="form.length === 1" show variant="light" class="small text-muted mb-2">
      <b-icon icon="info-circle"></b-icon> Con un solo empleado asignado, todos los productos de esta orden le
      corresponden automáticamente (100%).
    </b-alert>

    <!-- 2+ empleados: hay que indicar quién fabrica qué -->
    <div v-if="form.length >= 2 && products.length > 0" class="mt-3">
      <h6 class="text-muted font-weight-bold">
        <b-icon icon="diagram-3"></b-icon> Indique quién trabaja cada producto
      </h6>

      <b-card v-for="producto in products" :key="producto._id" class="mb-2" body-class="py-2 px-3"
        :border-variant="lineaCompleta(producto) ? 'success' : 'danger'">
        <b-row align-v="center">
          <b-col md="4">
            <strong>{{ producto.name }}</strong>
            <div class="small text-muted">
              {{ producto.talla }} <span v-if="producto.tela">- {{ producto.tela }}</span> - {{ producto.cantidad }}
              unidades
            </div>
          </b-col>

          <b-col md="6">
            <div v-if="!esGranular(producto._id)">
              <b-form-select size="sm" :options="opcionesEmpleadosForm"
                v-model="productosAsignacion[producto._id].asignacionCompleta"
                @change="onCambioAsignacionCompleta"></b-form-select>
            </div>
            <div v-else>
              <b-row v-for="empRow in form" :key="empRow.id" class="align-items-center mb-1 no-gutters">
                <b-col cols="7" class="small">{{ nombreEmpleado(empRow.empleado) }}</b-col>
                <b-col cols="5">
                  <b-form-input size="sm" type="number" min="0" :max="producto.cantidad" step="1"
                    v-model.number="productosAsignacion[producto._id].splits[empRow.empleado]"
                    @input="onCambioSplit"></b-form-input>
                </b-col>
              </b-row>
              <div class="small" :class="sumaSplits(producto) === producto.cantidad ? 'text-success' : 'text-danger'">
                Asignado: {{ sumaSplits(producto) }} / {{ producto.cantidad }}
              </div>
            </div>
          </b-col>

          <b-col md="2" class="text-right">
            <!-- El volumen de esta línea puede justificar repartirla por cantidad entre varios empleados
                 en vez de asignarla completa a uno solo (ej. 1000 piezas de un mismo producto). -->
            <b-form-checkbox switch size="sm" :checked="esGranular(producto._id)"
              @change="toggleGranular(producto._id)">
              Repartir
            </b-form-checkbox>
          </b-col>
        </b-row>
      </b-card>

      <b-alert v-if="!todoAsignado" show variant="warning" class="small py-2">
        <b-icon icon="exclamation-triangle"></b-icon> Aún quedan productos sin asignar por completo. Complete la
        asignación de todos los productos antes de guardar.
      </b-alert>
    </div>

    <b-button v-if="form.length > 0" variant="success" class="mt-3" :disabled="!puedeGuardar" @click="guardarAsignacion">
      <b-icon icon="check-circle"></b-icon> Guardar asignación
    </b-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      overlay: false,
      empleado: null,
      form: [],
      saveTimer: null,
      // { [id_ordenes_productos]: { asignacionCompleta: idEmpleado|null, granular: bool, splits: {[idEmpleado]: cantidad} } }
      productosAsignacion: {},
      fieldsEmpleados: [
        { key: "empleado", label: "Empleado" },
        { key: "comision", label: "% Comisión" },
        { key: "id", label: "" },
      ],
    };
  },

  computed: {
    opcionesEmpleadosForm() {
      const opts = this.form.map((f) => ({ value: f.empleado, text: this.nombreEmpleado(f.empleado) }));
      opts.unshift({ value: null, text: "Seleccione un empleado" });
      return opts;
    },

    // Unidades asignadas a cada empleado, calculadas a partir de la asignación de
    // productos (no de un porcentaje escrito a mano) -- para 1 solo empleado, es el
    // 100% de todas las unidades sin necesidad de la UI de productos.
    unidadesPorEmpleado() {
      const result = {};
      this.form.forEach((f) => { result[f.empleado] = 0; });

      if (this.form.length === 1) {
        const unico = this.form[0].empleado;
        result[unico] = this.products.reduce((acc, p) => acc + (parseInt(p.cantidad) || 0), 0);
        return result;
      }

      this.products.forEach((p) => {
        const asign = this.productosAsignacion[p._id];
        if (!asign) return;
        if (!asign.granular) {
          if (asign.asignacionCompleta && result[asign.asignacionCompleta] !== undefined) {
            result[asign.asignacionCompleta] += parseInt(p.cantidad) || 0;
          }
        } else {
          Object.keys(asign.splits || {}).forEach((idEmp) => {
            const cant = parseInt(asign.splits[idEmp]) || 0;
            if (result[idEmp] !== undefined) result[idEmp] += cant;
          });
        }
      });
      return result;
    },

    totalUnidadesOrden() {
      return this.products.reduce((acc, p) => acc + (parseInt(p.cantidad) || 0), 0);
    },

    totalPorcentaje() {
      if (this.totalUnidadesOrden === 0) return 0;
      const asignadas = Object.values(this.unidadesPorEmpleado).reduce((a, b) => a + b, 0);
      return Math.round((asignadas / this.totalUnidadesOrden) * 100);
    },

    todoAsignado() {
      if (this.form.length <= 1) return true;
      return this.products.every((p) => this.lineaCompleta(p));
    },

    puedeGuardar() {
      if (this.form.length === 0) return false;
      return this.todoAsignado;
    },
  },

  watch: {
    products: {
      immediate: true,
      handler() {
        this.inicializarProductosAsignacion();
      },
    },
    form() {
      this.inicializarProductosAsignacion();
    },
  },

  methods: {
    inicializarProductosAsignacion() {
      const nuevo = {};
      this.products.forEach((p) => {
        const previo = this.productosAsignacion[p._id];
        const splitsPrevios = (previo && previo.splits) || {};
        const splits = {};
        this.form.forEach((f) => { splits[f.empleado] = splitsPrevios[f.empleado] || 0; });
        nuevo[p._id] = {
          asignacionCompleta: previo && this.form.some((f) => f.empleado === previo.asignacionCompleta) ? previo.asignacionCompleta : null,
          granular: previo ? previo.granular : false,
          splits,
        };
      });
      this.productosAsignacion = nuevo;
    },

    esGranular(idProducto) {
      return !!(this.productosAsignacion[idProducto] && this.productosAsignacion[idProducto].granular);
    },

    toggleGranular(idProducto) {
      const asign = this.productosAsignacion[idProducto];
      if (!asign) return;
      this.$set(asign, "granular", !asign.granular);
      if (!asign.granular) {
        asign.asignacionCompleta = null;
      }
    },

    sumaSplits(producto) {
      const asign = this.productosAsignacion[producto._id];
      if (!asign) return 0;
      return Object.values(asign.splits || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
    },

    lineaCompleta(producto) {
      const asign = this.productosAsignacion[producto._id];
      if (!asign) return false;
      if (!asign.granular) return !!asign.asignacionCompleta;
      return this.sumaSplits(producto) === parseInt(producto.cantidad);
    },

    onCambioAsignacionCompleta() { },
    onCambioSplit() { },

    nombreEmpleado(idEmpleado) {
      const empleado = this.options.find((emp) => emp.value == idEmpleado);
      return empleado ? empleado.text : "";
    },

    porcentajeEmpleado(idEmpleado) {
      if (this.totalUnidadesOrden === 0) return 0;
      const unidades = this.unidadesPorEmpleado[idEmpleado] || 0;
      return (Math.round((unidades / this.totalUnidadesOrden) * 10000) / 100).toFixed(2);
    },

    generateRandomId() {
      const myKey = Math.floor(Math.random() * (9999999 - 100000 + 1)) + 100000;
      return myKey.toString();
    },

    existeEmpleado(idEmp) {
      return this.form.filter((el) => el.empleado == idEmp).length;
    },

    agregarEmpleado(val) {
      if (val && typeof val !== "object") {
        this.empleado = val;
      }
      if (!this.empleado) {
        this.$fire({ title: "Seleccione un empleado", html: `<p></p>`, type: "info" });
        return;
      }
      if (this.existeEmpleado(this.empleado) > 0) {
        this.$fire({ title: "Este empleado ya ha sido seleccionado", html: `<p></p>`, type: "info" });
        this.empleado = null;
        return;
      }
      this.form.push({ id: this.generateRandomId(), empleado: this.empleado });
      this.empleado = null;
    },

    async quitarEmpleado(idEmpleado, index) {
      this.$confirm(``, `¿Desea quitar al empleado ${this.nombreEmpleado(idEmpleado)}?`, "question").then(() => {
        this.eliminarEmpleadoBackend(idEmpleado).then(() => {
          this.form.splice(index, 1);
          this.guardarAsignacion();
        });
      });
    },

    async eliminarEmpleadoBackend(idEmpleado) {
      const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", idEmpleado);
      data.set("id_departamento", this.item._id);
      data.set("porcentaje", 0);
      return this.$axios.post(`${this.$config.API}/lotes/empleados/eliminar`, data).catch((err) => {
        console.error("No se eliminó el empleado", idEmpleado, err);
        this.$fire({ title: "Error", html: `<p>No se pudo quitar el empleado</p><p>${err}</p>`, type: "error" });
      });
    },

    construirPayloadAsignaciones() {
      if (this.form.length === 1) {
        const idEmpleado = this.form[0].empleado;
        return [{
          id_empleado: idEmpleado,
          productos: this.products.map((p) => ({ id_ordenes_productos: p._id, cantidad_asignada: parseInt(p.cantidad) })),
        }];
      }

      return this.form.map((f) => {
        const productos = [];
        this.products.forEach((p) => {
          const asign = this.productosAsignacion[p._id];
          if (!asign) return;
          if (!asign.granular) {
            if (asign.asignacionCompleta === f.empleado) {
              productos.push({ id_ordenes_productos: p._id, cantidad_asignada: parseInt(p.cantidad) });
            }
          } else {
            const cant = parseInt(asign.splits[f.empleado]) || 0;
            if (cant > 0) {
              productos.push({ id_ordenes_productos: p._id, cantidad_asignada: cant });
            }
          }
        });
        return { id_empleado: f.empleado, productos };
      }).filter((a) => a.productos.length > 0);
    },

    async guardarAsignacion() {
      if (!this.puedeGuardar) {
        this.$fire({
          title: "Asignación incompleta",
          html: `<p>Complete la asignación de todos los productos antes de guardar.</p>`,
          type: "info",
        });
        return;
      }

      const asignaciones = this.construirPayloadAsignaciones();
      if (asignaciones.length === 0) return;

      this.overlay = true;
      try {
        const res = await this.$axios.post(`${this.$config.API}/lotes/empleados/asignar-productos`, {
          id_orden: this.idorden,
          id_departamento: this.item._id,
          asignaciones,
        });

        this.$bvToast.toast("Se guardó la asignación de empleados y productos.", {
          title: "Asignación Guardada",
          variant: "success",
          solid: true,
        });

        const resultados = (res.data && res.data.resultados) || [];
        this.$emit(
          "assignments-updated",
          this.form.map((f) => {
            const r = resultados.find((x) => x.id_empleado == f.empleado);
            return { empleado: f.empleado, comision: r ? r.procentaje_comision : this.porcentajeEmpleado(f.empleado) };
          }),
          this.item._id,
          this.idorden
        );
      } catch (error) {
        console.error("No se pudo guardar la asignación", error);
        this.$fire({
          title: "Error al guardar la asignación",
          html: `<p>${(error.response && error.response.data && error.response.data.error) || error}</p>`,
          type: "error",
        });
      } finally {
        this.overlay = false;
      }
    },
  },

  mounted() {
    this.emp_asignados.forEach((el) => {
      this.form.push({ id: this.generateRandomId(), empleado: el.id_empleado });
    });
    this.inicializarProductosAsignacion();

    if (this.form.length >= 2) {
      this.$axios
        .get(`${this.$config.API}/lotes/${this.idorden}/${this.item._id}/asignaciones-productos`)
        .then((res) => {
          const filas = (res.data && res.data.asignaciones_productos) || [];
          if (filas.length === 0) return;

          // Reconstruir el estado de la UI a partir de lo ya guardado: por línea de
          // producto, si un solo empleado la cubre por completo es asignación simple,
          // si hay más de uno es granular.
          const porLinea = {};
          filas.forEach((f) => {
            const idLinea = f.id_ordenes_productos;
            if (!porLinea[idLinea]) porLinea[idLinea] = [];
            porLinea[idLinea].push(f);
          });

          Object.keys(porLinea).forEach((idLinea) => {
            const asign = this.productosAsignacion[idLinea];
            if (!asign) return;
            const filasLinea = porLinea[idLinea];
            if (filasLinea.length === 1) {
              asign.granular = false;
              asign.asignacionCompleta = filasLinea[0].id_empleado;
            } else {
              asign.granular = true;
              filasLinea.forEach((f) => { asign.splits[f.id_empleado] = parseInt(f.cantidad_asignada); });
            }
          });
        })
        .catch((err) => console.error("No se pudo cargar la asignación de productos previa", err));
    }
  },

  props: ["options", "idorden", "emp_asignados", "products", "item", "reload"],
};
</script>

<style>
.porcentaje {
  font-size: 1.4rem !important;
  color: darkslategray;
  font-weight: bold;
}
</style>
