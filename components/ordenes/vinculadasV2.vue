<template>
  <div>
    <div class="link_vinculada" v-for="orden in ordenes_vinculadas" :key="orden.id_child">
        <linkSearch :id="orden.id_child" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id_orden_father: null,
    }
  },
 
  mounted() {
   /*  if (typeof this.vinculadas === 'string') {
      this.vinculadas = this.vinculadas.split(',').map((item) => item.trim())
    } */
  },
  props: ['ordenes_vinculadas'],
}
</script>

<style scoped>
.link_vinculada {
  float: left;
  margin-right: 4px;
}
</style>
