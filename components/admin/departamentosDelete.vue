<template>
    <div>
        <b-button size="sm" class="mb-4" @click="confirmRmove" variant="danger" :disabled="isDefaultDepartment">
            <b-icon icon="trash"></b-icon>
        </b-button>
    </div>
</template>

<script>
// import mixin from "~/mixins/mixins.js";
// import { mapGetters } from "vuex";
export default {
    // mixins: [mixin],

    data() {
        return {
            title: "Eliminar departamento",
        };
    },

    computed: {
        isDefaultDepartment() {
            // Los IDs 1-7 son departamentos por defecto del sistema
            return this.iddep >= 1 && this.iddep <= 7;
        }
    },

    /* computed: {
        ...mapGetters("login", ["getModulosSelect"]),
    }, */

    methods: {
        confirmRmove() {
            // console.log("data a eliminar end epartamentos", this.$props);
            this.$confirm(
                ``,
                `¿desea elininar el departamento ${this.nombre}?`,
                "question"
            ).then(() => {
                this.removeDep();
            });
        },

        onModalHidden() {
            this.newDep = "";
            this.asiganr_numero_de_paso = 0;
        },

        async removeDep() {
            this.overlay = true;

            await this.$axios
                .delete(`${this.$config.API}/departamentos/${this.iddep}`)
                .then((res) => {
                    this.$emit("reload");
                    this.$fire({
                        title: `El departamento ${this.nombre} se ha eliminado`,
                        html: `<p></p>`,
                        type: "success",
                    });
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>No se eliminó departamento ${this.nombre}</p><p>${err}</p>`,
                        type: "error",
                    });
                });
        },
    },

    props: ["iddep", "reload", "nombre"],
};
</script>
