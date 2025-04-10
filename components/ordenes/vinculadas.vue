<template>
    <div>
        <!-- <div v-if="vinculadas.length">
            <div
                class="link_vinculada"
                v-for="(orden, index) in vinculadas"
                :key="index"
            >
                <linkSearch :id="orden.id_child" />
            </div>
        </div>

        <div class="link_vinculada" v-else>
            <b-button disabled variant="outline-secondary">
                <b-icon icon="x-circle"></b-icon>
            </b-button>
        </div> -->
    </div>
</template>

<script>
import LinkSearch from "../linkSearch.vue";
export default {
    data() {
        return {
            id_orden_father: null,
            ordenes_vinculadas: [],
        };
    },
    methods: {
        /* async getVinculadas() {
      await this.$axios
        .get(`${this.$config.API}/ordenes/vinculadas/${this.id_orden}`)
        .then((res) => {
          this.ordenes_vinculadas = res.data
        })
    }, */
    },
    mounted() {
        if (this.vinculadas) {
            /* if (typeof this.vinculadas === "string") {
                this.vinculadas = this.vinculadas
                    .split(",")
                    .map((item) => item.trim());
            } */
        }
    },
    props: ["vinculadas"],
    components: { LinkSearch },
};
</script>

<style scoped>
.link_vinculada {
    float: left;
    margin-right: 4px;
}
.table-wrapper {
    overflow-x: auto;
}
.table-header {
    width: 100%;
}
</style>
