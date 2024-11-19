<template>
  <div>
    <div class="link_vinculada" v-for="orden in vinculadas">
      <linkSearch :id="orden.id_child" />
    </div>
  </div>
</template>

<script>
import LinkSearch from '../linkSearch.vue'
export default {
  data() {
    return {
      id_orden_father: null,
      ordenes_vinculadas: [],
    }
  },
  methods: {
    /* async getVinculadas() {
      await axios
        .get(`${this.$config.API}/ordenes/vinculadas/${this.id_orden}`)
        .then((res) => {
          this.ordenes_vinculadas = res.data
        })
    }, */
  },
  mounted() {
    if (typeof this.vinculadas === 'string') {
      this.vinculadas = this.vinculadas.split(',').map((item) => item.trim())
    }
  },
  props: ['vinculadas'],
  components: { LinkSearch },
}
</script>

<style scoped>
.link_vinculada {
  float: left;
  margin-right: 4px;
}
</style>
