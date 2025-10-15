<template>
  <div>
    <h3>Tiempo Promedio</h3>
    <b-form-group
      id="input-group-4"
      label-for="input-tiempo"
      description="Indique el promedio de tiempo en minutos, por ejemplo 3.5 equivale a tres minutos y medio"
    >
    </b-form-group>
    <b-form inline>
      <b-form-input
        id="input-tiempo"
        type="text"
        v-model="tiempoFormateado"
        :state="tiempoValido"
        :invalid-feedback="mensajeError"
        style="width: 160px"
      >
        <template #append>
          <span class="input-group-text">minutos</span>
        </template>
      </b-form-input>

      <!-- {{ clacTimeProduction() }} -->

      <b-button
        @click="saveTime"
        class="ml-2"
        variant="success"
      >
        <b-icon icon="check-lg"></b-icon>
      </b-button>
    </b-form>

    <h3 class="mt-4">Asignación Masiva de Insumos por Talla</h3>
    <b-form-group
      id="input-group-insumo-base"
      label="Seleccione Insumo Base:"
      label-for="select-insumo-base"
      description="Seleccione el insumo que desea asignar a todas las tallas."
    >
      <b-form-select
        id="select-insumo-base"
        v-model.lazy="selectedInsumoBase"
        :options="selectinsumos"
      ></b-form-select>
    </b-form-group>

    <b-button
      variant="info"
      @click="loadAllSizes"
      :disabled="isButtonDisabled"
      class="mb-4"
    >
      <b-icon icon="plus-lg"></b-icon> Cargar Todas las Tallas
    </b-button>

    <b-button
      variant="success"
      @click="saveAllAssignments"
      :disabled="form.length === 0"
      class="mb-4 ml-2"
    >
      <b-icon icon="save"></b-icon> Guardar Todas las Asignaciones
    </b-button>

    <b-button
      @click="$bvModal.show(`modal-crear-insumo-${iddep}`)"
      :id="`create-new-insumo-${iddep}`"
      variant="info"
      class="mb-4 ml-2"
    >
      <b-icon icon="plus-lg"></b-icon> Crear Nuevo Insumo
    </b-button>
    <b-popover
      :target="`create-new-insumo-${iddep}`"
      triggers="hover"
      placement="top"
    >
      <template #title>Crear un nuevo insumo en el catálogo</template>
    </b-popover>

    <b-form-group
      id="input-group-mass-unit"
      label="Asignar Unidad a Todos:"
      label-for="select-mass-unit"
      class="mb-4 ml-2"
      style="display: inline-block;"
    >
      <b-form-select
        id="select-mass-unit"
        v-model="selectedUnitForMassAssignment"
        :options="optionsUnidad"
        class="mr-2"
        :disabled="form.length === 0"
      ></b-form-select>
      <b-button
        variant="secondary"
        @click="assignAllUnits"
        :disabled="!selectedUnitForMassAssignment || form.length === 0"
      >
        Asignar Unidad
      </b-button>
    </b-form-group>

    <b-overlay :show="savingInProgress" rounded="sm">
      <b-table
        responsive
        primary-key="id"
        :fields="newCampos"
        :items="form"
        small
        class="mt-4"
      >
        <template #cell(insumo)="row">
          <b-form-select
            v-model="row.item.insumo"
            :options="selectinsumos"
          ></b-form-select>
        </template>
        <template #cell(cantidad)="row">
          <b-form-input
            type="number"
            v-model="row.item.cantidad"
          />
        </template>
        <template #cell(miTalla)="row">
          <b-form-select
            v-model="row.item.miTalla"
            :options="selecttallas"
          ></b-form-select>
        </template>
        <template #cell(unidadDeMedida)="row">
          <b-form-select
            v-model="row.item.unidadDeMedida"
            :options="optionsUnidad"
          ></b-form-select>
        </template>
        <template #cell(actions)="row">
          <b-button
            variant="danger"
            @click="removeItem(row.index)"
            aria-label="Eliminar insumo"
            size="sm"
            class="mr-1"
          >
            <b-icon icon="trash"></b-icon>
          </b-button>
          <b-button
            variant="primary"
            @click="duplicateItem(row.item)"
            aria-label="Duplicar insumo"
            size="sm"
          >
            <b-icon icon="files"></b-icon>
          </b-button>
        </template>
      </b-table>
    </b-overlay>

    <h3 class="mt-4">Insumos Asignados</h3>

    <b-table
      class="mt-4"
      striped
      hover
      :fields="fields"
      :items="filterInsumos"
    >
      <template #cell(tiempo)="data">
        {{ SegundosAMinutos(data.item.tiempo) }}
      </template>

      <template #cell(cantidad)="data">
        {{ data.item.cantidad }}
        {{ data.item.unidad }}
      </template>

      <template #cell(id_product_insumos_asignados)="data">
        <admin-AsignacionDeInsumosAProductosDelete
          :key="data.item.id_product_insumos_asignados"
          :idinsumo="data.item.id_product_insumos_asignados"
          :insumo="data.item.insumo"
          @reload="reloadMe()"
        />
      </template>
    </b-table>

    <b-button
      id="add-insumo"
      variant="light"
      @click="addItem(item._id)"
      aria-label="Agregar Insumo"
    >
      <b-icon icon="plus-lg"></b-icon>
    </b-button>
    <b-popover
      target="add-insumo"
      triggers="hover"
      placement="top"
    >
      <template #title>Asignar nuevo insumo</template>
    </b-popover>

    <b-modal
      :id="`modal-crear-insumo-${iddep}`"
      :ref="`modalCrearInsumo-${iddep}`"
      title="Crear nuevo insumo"
      @ok="crearInsumo"
      @cancel="clearInput"
    >
      <b-form-input
        v-model="nuevoInsumo"
        placeholder="Nombre del insumo"
      ></b-form-input>
    </b-modal>

  </div>
</template>

<script>
export default {
  data() {
    return {
      tiempo: null,
      ButtonDisabled: false,
      form: [],
      nuevoInsumo: "",
      overlay: false,
      savingInProgress: false,
      selectedInsumoBase: null,
      selectedUnitForMassAssignment: null,
      optionsUnidad: [
        { value: null, text: "Seleccione una opción" },
        { value: "Kg", text: "Kilos" },
        { value: "Mt", text: "Metros" },
        { value: "Und", text: "Unidades" },
        { value: "Ml", text: "Mililitros" },
        { value: "Lt", text: "Litros" },
        { value: "Gr", text: "Gramos" },
        { value: "Cm", text: "Centímetros" },
      ],
      fields: [
        {
          key: "insumo",
          label: "Insumo",
        },
        {
          key: "departamento",
          label: "Departamento",
        },
        {
          key: "talla",
          label: "Talla",
        },
        {
          key: "cantidad",
          label: "cantidad",
        },
        {
          key: "tiempo",
          label: "Tiempo",
        },
        {
          key: "id_product_insumos_asignados",
          label: "Acciones",
        },
      ],
      newCampos: [
        { key: "insumo", label: "Insumo" },
        { key: "cantidad", label: "Cantidad" },
        { key: "miTalla", label: "Talla" },
        { key: "unidadDeMedida", label: "Unidad" },
        { key: "actions", label: "Acciones" },
      ],
    };
  },

  computed: {
    tiempoValido() {
      return this.tiempo !== null;
    },
    mensajeError() {
      return "Ingrese el tiempo en formato HH:MM ";
    },
    tiempoEnSegundos() {
      return this.tiempo;
    },
    /* tiempoFormateado: {
            get() {
                if (this.tiempo === null) {
                    return "";
                }
                const horas = Math.floor(this.tiempo / 3600);
                const minutos = Math.floor((this.tiempo % 3600) / 60);
                return `${this.pad(horas)}:${this.pad(minutos)}`;
            },
            set(valor) {
                const regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
                if (regex.test(valor)) {
                    const [horas, minutos] = valor.split(":").map(Number);
                    this.tiempo = horas * 3600 + minutos * 60;
                } else {
                    this.tiempo = null;
                }
            },
        }, */

    tiempoFormateado: {
      get() {
        // Si tiempo es null, inválido o negativo, retorna vacío
        if (
          this.tiempo === null ||
          typeof this.tiempo !== "number" ||
          this.tiempo < 0
        ) {
          return "";
        }
        // Calcula el total de minutos dividiendo los segundos por 60
        const totalMinutos = this.tiempo / 60;

        // Formatea a un número fijo de decimales (ej. 1 decimal)
        // Puedes ajustar el número en toFixed() si necesitas más o menos precisión (ej. toFixed(2) para 1.50)
        return totalMinutos.toFixed(1); // Retorna como string "1.5"
        // Si prefieres retornar un número en lugar de string (aunque los inputs suelen trabajar mejor con strings):
        // return parseFloat(totalMinutos.toFixed(1));
      },
      set(valor) {
        // Limpia espacios y verifica si el input es vacío para resetearsegundosAFormatoHHMM
        const valorLimpio = typeof valor === "string" ? valor.trim() : valor;
        if (
          valorLimpio === "" ||
          valorLimpio === null ||
          valorLimpio === undefined
        ) {
          this.tiempo = null;
          return;
        }

        // Intenta convertir el valor ingresado (que esperamos sean minutos decimales) a un número flotante
        const minutosIngresados = parseFloat(valorLimpio);

        // Verifica si la conversión fue exitosa y si el número no es negativo
        if (!isNaN(minutosIngresados) && minutosIngresados >= 0) {
          // Convierte los minutos ingresados a segundos (minutos * 60)
          // Redondea al segundo más cercano para almacenar un entero
          this.tiempo = Math.round(minutosIngresados * 60);
        } else {
          // Si el valor ingresado no es un número válido o es negativo,
          // establece tiempo a null (o podrías mantener el valor anterior o mostrar un error)
          this.tiempo = null;
        }
      },
    },

    filterInsumos() {
      if (!this.item || !Array.isArray(this.insumosasignados)) {
        return []; // Retornar un array vacío si item o insumosasignados no están disponibles
      }
      return this.insumosasignados.filter(
        (insumo) =>
          parseInt(insumo.id_departamento) === parseInt(this.item._id) &&
          parseInt(insumo.id_product) === parseInt(this.idprod)
      );
    },
    isButtonDisabled() {
      return this.selectedInsumoBase === null || this.selectedInsumoBase === undefined;
    },
  },

  methods: {
    clacTimeProduction() {
      const idProd = this.idprod;
      const idDep = this.iddep;

      // 1. Filtrar los registros y sumar los tiempos
      const totalSegundos = this.tiemposprod
        .filter(
          (el) => el.id_product === idProd && el.id_departamento === idDep
        )
        .reduce((total, el) => total + parseInt(el.tiempo), 0);

      return totalSegundos;

      // 2. Convertir segundos a HH:MM
      const horas = Math.floor(totalSegundos / 3600);
      const minutos = Math.floor((totalSegundos % 3600) / 60);

      // 3. Formatear la respuesta
      const horasFormateadas = String(horas).padStart(2, "0");
      const minutosFormateados = String(minutos).padStart(2, "0");

      return `${horasFormateadas}:${minutosFormateados}`;
    },

    async updateTiempo() {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id_product", this.idprod);
      data.set("id_departamento", this.item._id);
      data.set("tiempo", this.tiempo);

      await this.$axios
        .post(`${this.$config.API}/tiempos-de-produccion`, data)
        .then((res) => {
          this.SegundosAMinutos;
          this.$emit("reload");
          this.$fire({
            title: "Tiempo",
            html: `<p>Se ha asignado el tiempo de procicción</p>`,
            type: "success",
          });
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>Error al asignar el tiempo de procucción</p><p>${err}</p>`,
            type: "error",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    saveTime() {
      let ok = true;
      if (!this.tiempo || this.tiempo === null || parseInt(this.tiempo) === 0) {
        ok = false;
        this.$fire({
          type: "warning",
          title: "Indique el tiempo de producción",
          html: "",
        });
      } else {
        this.updateTiempo();
      }
    },

    pad(numero) {
      // Convertir el tiempo
      return numero.toString().padStart(2, "0");
    },
    reloadMe() {
      this.$emit("reload");
    },

    removeItem(index) {
      this.form.splice(index, 1);
    },

    duplicateItem(itemToDuplicate) {
      const random_id = this.generateRandomId();
      const duplicatedItem = {
        ...itemToDuplicate,
        id: random_id,
      };
      this.form.push(duplicatedItem);
    },

    /* getForm(id) {
            return this.form[id];
        }, */

    generateRandomId() {
      // Generar un número aleatorio entre 100000 y 9999999
      const myKey = Math.floor(Math.random() * (9999999 - 100000 + 1)) + 100000;
      return myKey.toString();
    },

    addItem() {
      // const dep = this.$store.state.login.dataUser.departamento
      const random_id = this.generateRandomId();
      const obj = {
        id: random_id,
        price: 0,
        descripcion: "",
      };
      this.form.push(obj);
    },

    loadAllSizes() {
      this.form = []; // Limpiar el formulario actual
      if (this.selectedInsumoBase && this.selecttallas.length > 0) {
        this.selecttallas.forEach(talla => {
          if (talla.value !== null) { // Ignorar la opción "No aplica / Seleccione"
            const random_id = this.generateRandomId();
            const obj = {
              id: random_id,
              insumo: this.selectedInsumoBase,
              miTalla: talla.value,
              cantidad: 1,
              unidadDeMedida: null,
            };
            this.form.push(obj);
          }
        });
      } else {
        this.$fire({
          type: "warning",
          title: "Seleccione un insumo base y asegúrese de que haya tallas disponibles.",
          html: "",
        });
      }
    },

    SegundosAMinutos(segundos) {
      if (parseInt(segundos) === 0) {
        return 0;
      }

      const minutos = segundos / 60;

      return minutos.toFixed(1) + ` min`;

      // Calcular horas y minutos
      /* const horas = Math.floor(segundos / 3600);
            const minutos = Math.floor((segundos % 3600) / 60); */

      // Formatear horas y minutos

      // Devolver la respuesta en formato HH:MM
      // return `${horasFormateadas}:${minutosFormateados}`;
    },

    clearInput() {
      this.nuevoInsumo = "";
    },

    async crearInsumo() {
      let msg = "";

      if (!this.nuevoInsumo || this.nuevoInsumo.trim() === "") {
        msg += `<p>Ingrese el nombre del insumo</p>`;
        this.$fire({
          title: "Dato Requerido",
          html: msg,
          type: "warning",
        });
        return;
      }

      if (!this.item || !this.item._id) {
        console.log("item:", this.item);
        this.$fire({
          title: "Error",
          html: `Producto no disponible o sin ID. Intente recargar la página.`,
          type: "error",
        });
        return;
      }

      this.overlay = true;

      const data = new URLSearchParams();
      data.set("id_departamento", this.iddep);
      data.set("insumo", this.nuevoInsumo);
      data.set("id_product", this.item._id);

        await this.$axios
          .post(`${this.$config.API}/catalogo-insumos-productos`, data)
          .then((res) => {
            this.$fire({
              title: "Nuevo Insumo",
              html: `<p>el insumo "${this.nuevoInsumo}" se ha creado correctamente</p>`,
              type: "success",
            });
            this.$emit("reload", true);
          })
          .catch((err) => {
            this.$fire({
              title: "Error",
              html: `<p>No se pudo crear el insumo</p><p>${err}</p>`,
              type: "error",
            });
          })
          .finally(() => {
            this.nuevoInsumo = "";
            this.overlay = false;
          });
    },

    async saveAllAssignments() {
      try {
        await this.$confirm(
          `Se guardarán todas las asignaciones de la tabla.`,
          "¿Está seguro?",
          "question"
        );

        this.savingInProgress = true;
        let allSuccess = true;
        const assignmentsToSave = [...this.form];

        for (const assignment of assignmentsToSave) {
          const data = new URLSearchParams();
          data.set("insumo", assignment.insumo);
          data.set("departamento", this.item._id);
          data.set("cantidad", assignment.cantidad);
          data.set("unidad", assignment.unidadDeMedida);
          data.set("id_size", assignment.miTalla);
          data.set("id_product", this.idprod);

          try {
            await this.$axios.post(`${this.$config.API}/insumos-productos`, data);
          } catch (err) {
            allSuccess = false;
            console.error("Error al guardar asignación:", assignment, err);
            this.$fire({
              title: "Error al guardar",
              html: `<p>No se pudo guardar el insumo ${assignment.insumo} para la talla ${assignment.miTalla}</p><p>${err}</p>`,
              type: "error",
            });
          }
        }

        this.savingInProgress = false;
        if (allSuccess) {
          this.$fire({
            title: "Asignaciones Guardadas",
            html: `<p>Todas las asignaciones se han guardado correctamente.</p>`,
            type: "success",
          });
          this.form = [];
          this.$emit("reload");
        } else {
          this.$fire({
            title: "Advertencia",
            html: `<p>Algunas asignaciones no pudieron guardarse. Revise los errores.</p>`,
            type: "warning",
          });
        }
      } catch (e) {
        // El usuario canceló el diálogo de confirmación
        return false;
      }
    },

    /* saveAllAssignments_fire_not_work() {
      this.$fire({
        title: '¿Está seguro?',
        text: "Se guardarán todas las asignaciones de la tabla.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'No, cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.savingInProgress = true;
          let allSuccess = true;
          const assignmentsToSave = [...this.form];

          for (const assignment of assignmentsToSave) {
            const data = new URLSearchParams();
            data.set("insumo", assignment.insumo);
            data.set("departamento", this.item._id);
            data.set("cantidad", assignment.cantidad);
            data.set("unidad", assignment.unidadDeMedida);
            data.set("id_size", assignment.miTalla);
            data.set("id_product", this.idprod);

            try {
              await this.$axios.post(`${this.$config.API}/insumos-productos`, data);
            } catch (err) {
              allSuccess = false;
              console.error("Error al guardar asignación:", assignment, err);
              this.$fire({
                title: "Error al guardar",
                html: `<p>No se pudo guardar el insumo ${assignment.insumo} para la talla ${assignment.miTalla}</p><p>${err}</p>`,
                type: "error",
              });
            }
          }

          this.savingInProgress = false;
          if (allSuccess) {
            this.$fire({
              title: "Asignaciones Guardadas",
              html: `<p>Todas las asignaciones se han guardado correctamente.</p>`,
              type: "success",
            });
            this.form = [];
            this.$emit("reload");
          } else {
            this.$fire({
              title: "Advertencia",
              html: `<p>Algunas asignaciones no pudieron guardarse. Revise los errores.</p>`,
              type: "warning",
            });
          }
        }
      });
    }, */

    assignAllUnits() {
      if (this.selectedUnitForMassAssignment) {
        this.form.forEach(item => {
          item.unidadDeMedida = this.selectedUnitForMassAssignment;
        });
        this.$fire({
          title: "Unidad Asignada",
          html: `<p>La unidad ${this.selectedUnitForMassAssignment} ha sido asignada a todos los ítems.</p>`,
          type: "success",
        });
      } else {
        this.$fire({
          type: "warning",
          title: "Seleccione una unidad",
          html: "Debe seleccionar una unidad para asignar.",
        });
      }
    },
  },


  mounted() {
    this.tiempo = this.tiempoInicial || this.clacTimeProduction();
  },

  props: [
    "idprod",
    "iddep",
    "reload",
    "selectinsumos",
    "insumosasignados",
    "selecttallas",
    "tiemposprod",
    "item",
    "tiempoInicial",
  ],
};
</script>

<style>
</style>