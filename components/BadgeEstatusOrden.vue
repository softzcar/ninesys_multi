<template>
  <b-badge :variant="variant" class="font-weight-bold px-2 py-1">{{ label }}</b-badge>
</template>

<script>
// Los datos reales tienen mayúsculas inconsistentes ('cancelada' y
// 'Cancelada' conviven en la misma tabla) -- se normaliza a minúsculas
// antes de mapear color/etiqueta para que el badge sea consistente sin
// importar cómo esté guardado el valor.
const ESTADOS = {
  activa: { variant: "primary", label: "Activa" },
  pausada: { variant: "warning", label: "Pausada" },
  "en espera": { variant: "secondary", label: "En Espera" },
  terminada: { variant: "info", label: "Terminada" },
  entregada: { variant: "success", label: "Entregada" },
  cancelada: { variant: "danger", label: "Cancelada" },
};

export default {
  name: "BadgeEstatusOrden",
  props: {
    estatus: {
      type: String,
      default: "",
    },
  },
  computed: {
    normalizado() {
      return (this.estatus || "").trim().toLowerCase();
    },
    variant() {
      return ESTADOS[this.normalizado]?.variant || "dark";
    },
    label() {
      return ESTADOS[this.normalizado]?.label || (this.estatus || "Desconocido");
    },
  },
};
</script>
