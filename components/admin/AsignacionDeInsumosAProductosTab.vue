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

    <b-table
      responsive
      primary-key="id"
      :fields="campos"
      :items="form"
      small
    >
      <template #cell(input)="row">
        <admin-AsignacionDeInsumosProductosForm
          :selecttallas="selecttallas"
          :selectinsumos="selectinsumos"
          @reload="reloadMe($event)"
          :item="row.item"
          :tiemposprod="tiemposprod"
          :iddep="item._id"
          :idprod="idprod"
          :index="row.index"
        />
      </template>

      <template #cell(id)="row">
        <b-button
          variant="danger"
          @click="removeItem(row.index)"
          aria-label="Agregar insumo"
          class="mt-4"
        >
          <b-icon icon="trash"></b-icon>
        </b-button>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tiempo: null,
      ButtonDisabled: false,
      form: [],
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
      campos: [
        { key: "input", label: "" },
        { key: "id", label: "" },
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
      this.$emit("reload");
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
  },

  mounted() {
    this.addItem(this.item._id);
    this.tiempo = this.clacTimeProduction();
    // this.tiempo = this.tiemposprod[0].tiempo;
    // this.reloadMe();
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
  ],
};
</script>

<style>
</style>