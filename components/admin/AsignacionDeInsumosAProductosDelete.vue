<template>
    <div>
        <b-button variant="danger" @click="confirmRmove()" aria-label="Eliminar insumo">
            <b-icon icon="trash"></b-icon>
        </b-button>
    </div>
</template>

<script>
export default {
    methods: {
        confirmRmove() {
            this.$confirm(
                ``,
                `¿desea eliminar el insumo ${this.insumo}?`,
                "question"
            ).then(() => {
                this.removeItem();
            });
        },

        async removeItem() {
            this.overlay = true;

            await this.$axios
                .delete(
                    `${this.$config.API}/insumos-productos-asignados/${this.idinsumo}`
                )
                .then((res) => {
                    this.form.splice(index, 1);
                    this.$fire({
                        title: "El insumo seha eliminado",
                        html: `<p></p>`,
                        type: "success",
                    });
                })
                /* .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>No se eliminó el insumo</p><p>${err}</p>`,
                        type: "error",
                        });
                        }) */
                .finally(() => {
                    this.$emit("reload");
                    this.overlay = false;
                });
        },
    },

    props: ["idinsumo", "insumo", "reload"],
};
</script>
