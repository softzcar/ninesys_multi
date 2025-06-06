<template>
    <div>
        <b-button @click="$bvModal.show(modal)" :variant="statusbutton"
            >OK</b-button
        >

        <b-modal :id="modal" :title="title" hide-footer size="xl">
            <b-overlay :show="overlay" spinner-small>
                FORMULARIO AQUI
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            title: `Nuevo item de catálogo`,
            overlay: false,
            statusbutton: "info",
        };
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-${rand}`;
        },
    },

    mounted() {
        this.$root.$on("bv::modal::show", (bvEvent, modal) => {
            if (modal === this.modal) {
                console.log("acciones al abrir el modal");

                // this.getDeps();
                // this.getOrdenesActivas().then(() => {
                // this.overlay = false;
                // });
            }
        });
    },

    props: ["reload"],
};
</script>
