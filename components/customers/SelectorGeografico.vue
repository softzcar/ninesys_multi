<template>
  <div>
    <b-form-group label-for="select-geo-pais">
      <template #label>País <span class="text-danger">*</span>:</template>
      <b-form-select
        id="select-geo-pais"
        v-model="idPaisLocal"
        :options="paisOptions"
        :disabled="disabled || loadingPaises"
      ></b-form-select>
    </b-form-group>

    <b-form-group label-for="select-geo-estado">
      <template #label>Estado <span class="text-danger">*</span>:</template>
      <b-form-select
        id="select-geo-estado"
        v-model="idEstadoLocal"
        :options="estadoOptions"
        :disabled="disabled || !idPaisLocal || loadingEstados"
      ></b-form-select>
      <div v-if="mostrarAvisoSinDatos" class="text-warning small mt-1">
        Este país no tiene estados/ciudades cargados en el sistema todavía. Puede continuar sin completar este campo.
      </div>
    </b-form-group>

    <b-form-group label-for="select-geo-ciudad">
      <template #label>Ciudad <span class="text-danger">*</span>:</template>
      <b-form-select
        id="select-geo-ciudad"
        v-model="idCiudadLocal"
        :options="ciudadOptions"
        :disabled="disabled || !idEstadoLocal || loadingCiudades"
      ></b-form-select>
    </b-form-group>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => ({ idPais: null, idEstado: null, idCiudad: null }),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      paises: [],
      estados: [],
      ciudades: [],
      idPaisLocal: this.value.idPais || 189,
      idEstadoLocal: this.value.idEstado || null,
      idCiudadLocal: this.value.idCiudad || null,
      loadingPaises: false,
      loadingEstados: false,
      loadingCiudades: false,
    }
  },

  computed: {
    paisOptions() {
      return this.paises
        .filter((p) => Number(p._id) === 189)
        .map((p) => ({ value: p._id, text: p.nombre }))
    },
    estadoOptions() {
      return [
        { value: null, text: "Seleccione un estado" },
        ...this.estados.map((e) => ({ value: e._id, text: e.nombre })),
      ]
    },
    ciudadOptions() {
      return [
        { value: null, text: "Seleccione una ciudad" },
        ...this.ciudades.map((c) => ({ value: c._id, text: c.nombre })),
      ]
    },
    mostrarAvisoSinDatos() {
      return !this.loadingEstados && !!this.idPaisLocal && this.estados.length === 0
    },
  },

  watch: {
    value(nuevo) {
      // Re-sincroniza si el padre reemplaza el objeto completo desde fuera (ej. al limpiar el formulario)
      if (
        (nuevo.idPais || null) === this.idPaisLocal &&
        (nuevo.idEstado || null) === this.idEstadoLocal &&
        (nuevo.idCiudad || null) === this.idCiudadLocal
      ) {
        return
      }
      this.idPaisLocal = nuevo.idPais || 189
      this.idEstadoLocal = nuevo.idEstado || null
      this.idCiudadLocal = nuevo.idCiudad || null
    },
    idPaisLocal(nuevoIdPais) {
      this.emitirCambio()
      this.idEstadoLocal = null
      this.idCiudadLocal = null
      this.estados = []
      this.ciudades = []
      if (nuevoIdPais) {
        this.cargarEstados(nuevoIdPais)
      }
    },
    idEstadoLocal(nuevoIdEstado) {
      this.emitirCambio()
      this.idCiudadLocal = null
      this.ciudades = []
      if (nuevoIdEstado) {
        this.cargarCiudades(nuevoIdEstado)
      }
    },
    idCiudadLocal() {
      this.emitirCambio()
    },
  },

  async mounted() {
    await this.cargarPaises()
    if (this.idPaisLocal) {
      await this.cargarEstados(this.idPaisLocal)
      if (this.idEstadoLocal) {
        await this.cargarCiudades(this.idEstadoLocal)
      }
    }
  },

  methods: {
    emitirCambio() {
      this.$emit("input", {
        idPais: this.idPaisLocal,
        idEstado: this.idEstadoLocal,
        idCiudad: this.idCiudadLocal,
      })
    },

    async cargarPaises() {
      this.loadingPaises = true
      try {
        const res = await this.$axios.get(`${this.$config.API}/catalogo-paises`)
        this.paises = res.data.data || []
      } catch (err) {
        this.paises = []
      } finally {
        this.loadingPaises = false
      }
    },

    async cargarEstados(idPais) {
      this.loadingEstados = true
      try {
        const res = await this.$axios.get(`${this.$config.API}/catalogo-estados/${idPais}`)
        this.estados = res.data.data || []
      } catch (err) {
        this.estados = []
      } finally {
        this.loadingEstados = false
      }
    },

    async cargarCiudades(idEstado) {
      this.loadingCiudades = true
      try {
        const res = await this.$axios.get(`${this.$config.API}/catalogo-ciudades/${idEstado}`)
        this.ciudades = res.data.data || []
      } catch (err) {
        this.ciudades = []
      } finally {
        this.loadingCiudades = false
      }
    },
  },
}
</script>
