<template>
    <div>
        <!-- <b-button v-b-modal.modalPopover>Ver detalles</b-button> -->
        <b-button variant="info" @click="$bvModal.show(modal)">
            <b-icon icon="eye"></b-icon>
        </b-button>

        <b-modal :id="modal" :title="title" size="lg" ok-only>
            <b-row class="mt-2">
                <b-col>
                    <div v-html="detalleLocal"></div>
                </b-col>
            </b-row>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            title: `Detallede la reposición`,
            detalleLocal: "",
        };
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7);

            return `modal-${rand}`;
        },
    },

    methods: {
        async postBorrador(borrador) {
            this.msg = "Guardando...";
            const data = new URLSearchParams();
            data.set("id_orden", this.idorden);
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            );
            data.set("borrador", borrador);

            await axios
                .post(`${this.$config.API}/ordenes/borrador`, data)
                .then((res) => {
                    this.msg = "Se guardaron sus cambios";
                })
                .catch((error) => {
                    this.msg = "No se pudo guardar su borrador";
                });
        },

        onEditorChange({ editor, html, text }) {
            console.log("editor change!", editor, html, text);
            this.postBorrador(html);
            this.borrador = html;
        },
    },

    mounted() {
        if (this.detalle == null) {
            this.detalleLocal = "No hay detalle de esta reposición";
        } else {
            this.detalleLocal = this.detalle;
        }
    },

    props: ["detalle"],
};
</script>
