<template>
  <div>
    <div v-if="!ordenes_vinculadas || ordenes_vinculadas.length == 0">
    </div>
    <div v-else>
      <div class="link_vinculada" v-for="orden in ordenes_vinculadas" :key="orden.id_child">
          <linkSearch :id="orden.id_child" />
      </div>
    </div>
  </div>
</template>

<script>
import linkSearch from '../linkSearch.vue';

export default {
  components: {
    linkSearch
  },
  data() {
    return {
      vinculadas: [],
    }
  },

  methods: {
    async getOrdenesVinculadas() {
      // Solo hacer la llamada si tenemos id_orden definido y no tenemos datos
      if (!this.id_orden || this.ordenes_vinculadas?.length > 0) {
        return;
      }
      
      await this.$axios
        .get(`${this.$config.API}/ordenes/vinculadas/${this.id_orden}`)
        .then((res) => {
          this.vinculadas = res.data;
        })
        .catch((err) => {
          console.error(`Error al obtener ordene vinculadas de la orden ${this.id_orden}`, err);
        })
    },
  },
 
  mounted() {
    // Solo llamar si no recibimos ordenes_vinculadas como prop
    if (this.ordenes_vinculadas === undefined || this.ordenes_vinculadas === null) {
      this.getOrdenesVinculadas()
    }
  },
  props: ['ordenes_vinculadas', 'id_orden'],
}
</script>

<style scoped>
.link_vinculada {
  float: left;
  margin-right: 4px;
}
</style>

