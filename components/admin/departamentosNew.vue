<template>
    <div>
        <b-button size="sm" class="mb-4" @click="$bvModal.show(modal)" variant="primary">
            <b-icon icon="plus-lg"></b-icon> Nuevo Departamento</b-button>

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
                    <span class="floatme">
                        <b-button class="floatme" @click="crearDepartamento()" variant="success" :disabled="overlay">
                            <b-icon icon="check-lg"></b-icon>
                        </b-button>
                    </span>
                </div>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"
export default {
    mixins: [mixin],

    data() {
        return {
            title: 'Nuevo Departamento',
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
            this.newDep = ''
            this.asiganr_numero_de_paso = 0
        },
        async crearDepartamento() {
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
                    title: "Nuevo Departamento",
                    html: msg,
                    type: icon,
                })
            } else {
                this.overlay = true
                const data = new URLSearchParams()
                data.set("departamento", this.newDep)
                data.set("asignar_paso", this.asiganr_numero_de_paso)

                await this.$axios
                    .post(
                        // `${this.$config.API}/departamentos/orden-paso`, data)
                        `${this.$config.API}/departamentos/nuevo`, data)
                    .then((res) => {
                        // PRONBAR checkResponse
                        const checkMe = this.checkResponse(res)
                        console.log('checkResponse', checkMe)

                        if (checkMe) {
                            this.$store.commit("login/setDepartamentos", res.data)
                            this.$emit("reload", "true")
                            this.$fire({
                                title: "Nuevo Departamento",
                                html: '<p>El nuevo departamento se creó correctamente</p>',
                                type: 'success',
                            })
                            this.$bvModal.hide(this.modal)
                        }
                    })
                    .catch((err) => {
                        this.$fire({
                            title: "Nuevo Departamento",
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

    props: ['item', 'reload']
}
</script>