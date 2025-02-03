<template>
    <div>
        <b-button size="sm" class="mb-4" @click="$bvModal.show(modal)" variant="primary">
            <b-icon icon="pencil"></b-icon></b-button>

        <b-modal :id="modal" :title="title" @hidden="onModalHidden" hide-footer size="md">
            <b-overlay :show="overlay" spinner-small>
                <div>
                    <span class="floatme">
                        <b-form-input style="width: 250px" type="text" v-model="newDep" :disabled="overlay" />
                    </span>
                    <span class="floatme">
                        <b-form-checkbox id="checkbox-1" v-model="asiganr_numero_de_paso" name="checkbox-1" value="1"
                            unchecked-value="0">
                            Asiganr número de paso
                        </b-form-checkbox>
                    </span>
                </div>
                <div>
                    <b-button class="floatme" @click="guardarOrdenDepartamento()" variant="success" :disabled="overlay">
                        <b-icon icon="check-lg"></b-icon>
                    </b-button>
                </div>
            </b-overlay>
        </b-modal>
        <!-- mmm -->

    </div>
</template>

<script>
export default {
    data() {
        return {
            title: 'Editar Departamento',
            overlay: false,
            newDep: '',
            asiganr_numero_de_paso: 0
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        onModalHidden() {
            // this.newDep = ''
            // this.asiganr_numero_de_paso = 0
        },

        async guardarOrdenDepartamento() {
            let ok = true
            let msg = ''
            let icon = 'success'

            if (this.newDep.trim() === '') {
                ok = false
                msg += '<p>Debe indicar el nuevo nombre del departamento</p>'
                icon = 'info'
            }

            if (!ok) {
                this.$fire({
                    title: "Editar Departamento",
                    html: msg,
                    type: icon,
                })
            } else {
                this.overlay = true
                const data = new URLSearchParams()
                data.set("id_departamento", this.item._id)
                data.set("departamento", this.newDep)
                data.set("asignar_paso", this.asiganr_numero_de_paso)

                await this.$axios
                    .post(
                        // `${this.$config.API}/departamentos/orden-paso`, data)
                        `${this.$config.API}/departamentos/editar`, data)
                    .then((res) => {
                        this.$emit("reload", "true")
                        this.$fire({
                            title: "Editar Departamento",
                            html: '<p>El nuevo nombre del departamento se actualizó correctamente</p>',
                            type: 'success',
                        })
                        this.$bvModal.hide(this.modal)
                    })
                    .catch((err) => {
                        this.$fire({
                            title: "Editar Departamento",
                            html: `<p>Ocurrió un error al conectarse a internet</p> <p>${err}</p> `,
                            type: "error",
                        })
                    })
                    .finally(() => {
                        this.overlay = false
                    })
            }


        },
    },

    mounted() {
        this.newDep = this.item.departamento
    },

    props: ['item', 'reload']
}
</script>