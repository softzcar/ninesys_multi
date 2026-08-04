<template>
  <div v-if="contenidoHtml" class="page-guide w-100 mb-3">
    <b-button
      v-b-toggle="toggleId"
      size="sm"
      variant="outline-info"
      class="d-flex align-items-center"
    >
      <i class="fas fa-question-circle mr-2"></i>
      <span>¿Cómo leer esta página?</span>
      <i class="fas fa-chevron-down ml-2"></i>
    </b-button>

    <b-collapse :id="toggleId" class="mt-2">
      <b-card class="page-guide-card">
        <div class="page-guide-content" v-html="contenidoHtml"></div>
      </b-card>
    </b-collapse>
  </div>
</template>

<script>
import { marked } from "marked";

export default {
  name: "PageGuide",
  props: {
    // Solo necesario para rutas dinámicas (ej. /ordenes/123) donde la guía
    // debe ser la misma sin importar el parámetro -- en el resto de los
    // casos se deriva automáticamente de la ruta actual.
    slug: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      contenidoHtml: null,
    };
  },
  computed: {
    slugResuelto() {
      if (this.slug) return this.slug;
      return (this.$route.path || "")
        .replace(/^\/+|\/+$/g, "")
        .replace(/\//g, "-");
    },
    toggleId() {
      return `page-guide-${this.slugResuelto || "default"}`;
    },
  },
  async mounted() {
    if (!this.slugResuelto) return;
    try {
      const res = await fetch(`/guias/${this.slugResuelto}.md`);
      if (!res.ok) return;
      const markdown = await res.text();
      this.contenidoHtml = marked.parse(markdown);
    } catch (e) {
      // Sin guía disponible para esta página -- no es un error, el
      // componente simplemente no se muestra (adopción incremental).
    }
  },
};
</script>

<style scoped>
.page-guide-card {
  max-width: 100%;
}
.page-guide-content >>> h1,
.page-guide-content >>> h2,
.page-guide-content >>> h3 {
  font-size: 1.1rem;
}
.page-guide-content >>> table {
  max-width: 100%;
  display: block;
  overflow-x: auto;
}
</style>
