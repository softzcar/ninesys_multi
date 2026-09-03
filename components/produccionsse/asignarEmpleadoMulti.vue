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
                  <b-form-input size="sm" type="number" min="0" :max="producto.cantidad" step="0.1"
                    v-model.number="productosAsignacion[producto._id].splits[empRow.empleado]"
                    @input="onCambioSplit"></b-form-input>
                </b-col>
              </b-row>
              <div class="small" :class="lineaCompleta(producto) ? 'text-success' : 'text-danger'">
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

    <b-button v-if="form.length > 0" variant="success" class="mt-3" :disabled="!hayCambiosPendientes" @click="guardarAsignacion">
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
      // true mientras mounted() está poblando el estado inicial (empleados ya
      // asignados + su reparto de productos ya guardado) -- sin esto, cargar
      // un departamento que ya tenía una asignación completa reenviaba al
      // servidor exactamente lo mismo que se acababa de leer de él, apenas
      // se abría el modal (bug real: un toast "Asignación Guardada" por cada
      // pestaña con datos previos, sin que el usuario tocara nada).
      hidratando: true,
      // JSON del último payload realmente enviado con éxito (o cargado al
      // hidratar) -- evita reenviar/mostrar el toast de nuevo si el estado
      // actual es idéntico a lo ya guardado, sin importar cuántas veces se
      // dispare guardarAsignacion() (auto o manual).
      ultimoPayloadGuardado: null,
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
        result[unico] = this.redondear(this.products.reduce((acc, p) => acc + (parseFloat(p.cantidad) || 0), 0));
        return result;
      }

      this.products.forEach((p) => {
        const asign = this.productosAsignacion[p._id];
        if (!asign) return;
        if (!asign.granular) {
          if (asign.asignacionCompleta && result[asign.asignacionCompleta] !== undefined) {
            result[asign.asignacionCompleta] += parseFloat(p.cantidad) || 0;
          }
        } else {
          Object.keys(asign.splits || {}).forEach((idEmp) => {
            const cant = parseFloat(asign.splits[idEmp]) || 0;
            if (result[idEmp] !== undefined) result[idEmp] += cant;
          });
        }
      });
      Object.keys(result).forEach((idEmp) => { result[idEmp] = this.redondear(result[idEmp]); });
      return result;
    },

    totalUnidadesOrden() {
      return this.redondear(this.products.reduce((acc, p) => acc + (parseFloat(p.cantidad) || 0), 0));
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

    // true solo si hay un estado completo Y distinto de lo último guardado --
    // maneja tanto el botón (deshabilitado si no hay nada nuevo que guardar)
    // como sirve de base para el guard de guardarAsignacion().
    hayCambiosPendientes() {
      if (!this.puedeGuardar) return false;
      return JSON.stringify(this.construirPayloadAsignaciones()) !== this.ultimoPayloadGuardado;
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
      this.programarAutoguardado();
    },
    // Deep (no solo puedeGuardar false->true) para cubrir también editar un
    // reparto que ya estaba completo -- ej. mover unidades de un empleado a
    // otro sin que la suma deje de cuadrar en ningún momento, caso en el que
    // puedeGuardar nunca "cambia" de valor.
    productosAsignacion: {
      deep: true,
      handler() {
        this.programarAutoguardado();
      },
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

    // Las cantidades pueden ser decimales (productos por metro: DTF, sublimacion por
    // metros), asi que se trabaja con una escala de 1 decimal -- la misma de
    // ordenes_productos.cantidad -- para que sumas como 0.1 + 0.2 no arrastren el error
    // de punto flotante hasta las comparaciones.
    redondear(n) {
      return Math.round((parseFloat(n) || 0) * 10) / 10;
    },

    sumaSplits(producto) {
      const asign = this.productosAsignacion[producto._id];
      if (!asign) return 0;
      return this.redondear(Object.values(asign.splits || {}).reduce((a, b) => a + (parseFloat(b) || 0), 0));
    },

    lineaCompleta(producto) {
      const asign = this.productosAsignacion[producto._id];
      if (!asign) return false;
      if (!asign.granular) return !!asign.asignacionCompleta;
      return this.sumaSplits(producto) === this.redondear(producto.cantidad);
    },

    onCambioAsignacionCompleta() { },
    onCambioSplit() { },

    // Autoguardado (con debounce, usando saveTimer): se dispara desde los
    // watchers de `form` y `productosAsignacion` cada vez que algo cambia.
    // Si el estado actual no es guardable todavía (ej. 2+ empleados sin
    // terminar de repartir productos), no hace nada -- se vuelve a intentar
    // en el próximo cambio.
    programarAutoguardado() {
      if (this.hidratando) return;
      clearTimeout(this.saveTimer);
      if (!this.puedeGuardar) return;
      this.saveTimer = setTimeout(() => this.guardarAsignacion(), 600);
    },

    // Público -- lo consulta el modal padre (asignar.vue) al intentar
    // cerrarse, para advertir antes de perder una asignación a medio
    // completar (2+ empleados con productos aún sin repartir del todo).
    tieneAsignacionPendiente() {
      return this.form.length >= 2 && !this.todoAsignado;
    },

    // Cierra la hidratación inicial: registra lo que se acaba de cargar como
    // "ya guardado" (para que el botón nazca deshabilitado y el autoguardado
    // no confunda datos recién leídos con un cambio real del usuario) y
    // recién ahí habilita el autoguardado.
    finalizarHidratacion() {
      this.ultimoPayloadGuardado = JSON.stringify(this.construirPayloadAsignaciones());
      this.hidratando = false;
    },

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
          productos: this.products.map((p) => ({ id_ordenes_productos: p._id, cantidad_asignada: this.redondear(p.cantidad) })),
        }];
      }

      return this.form.map((f) => {
        const productos = [];
        this.products.forEach((p) => {
          const asign = this.productosAsignacion[p._id];
          if (!asign) return;
          if (!asign.granular) {
            if (asign.asignacionCompleta === f.empleado) {
              productos.push({ id_ordenes_productos: p._id, cantidad_asignada: this.redondear(p.cantidad) });
            }
          } else {
            const cant = this.redondear(asign.splits[f.empleado]);
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

      // Nada realmente distinto de lo último guardado -- evita reenviar y
      // volver a mostrar el toast (ej. si el autoguardado se disparó más de
      // una vez para el mismo cambio, o el usuario hace click en el botón
      // sin haber tocado nada desde el último guardado).
      const payloadKey = JSON.stringify(asignaciones);
      if (payloadKey === this.ultimoPayloadGuardado) return;

      this.overlay = true;
      try {
        const res = await this.$axios.post(`${this.$config.API}/lotes/empleados/asignar-productos`, {
          id_orden: this.idorden,
          id_departamento: this.item._id,
          asignaciones,
        });

        this.ultimoPayloadGuardado = payloadKey;
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
        // ultimoPayloadGuardado NO se actualiza en este catch -- el botón
        // "Guardar asignación" sigue habilitado (hayCambiosPendientes en
        // true) para reintentar. Como esto puede fallar en segundo plano
        // (autoguardado, sin que el usuario esté mirando esta pestaña en
        // ese momento), el mensaje debe ser explícito sobre qué hacer.
        this.$fire({
          title: "No se pudo guardar la asignación",
          html: `<p>${(error.response && error.response.data && error.response.data.error) || error}</p><p>Vuelva a intentarlo haciendo click en <strong>"Guardar asignación"</strong>.</p>`,
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
              filasLinea.forEach((f) => { asign.splits[f.id_empleado] = this.redondear(f.cantidad_asignada); });
            }
          });
        })
        .catch((err) => console.error("No se pudo cargar la asignación de productos previa", err))
        .finally(() => {
          this.$nextTick(() => this.finalizarHidratacion());
        });
    } else {
      this.$nextTick(() => this.finalizarHidratacion());
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
