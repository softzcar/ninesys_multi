<template>
    <div>
        <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="journal-code"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row class="justify-content-md-center">
                        <b-col cols="4">
                            <b-form-input size="lg" class="mb-3 text-center" type="url" v-model="codigoDiseno"
                                @change="updateCodigo"></b-form-input>
                        </b-col>
                    </b-row>
                </b-container>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            size: 'lg',
            title: 'Código del diseño',
            overlay: false,
            imageWidth: '100%',
            codigoDiseno: this.item.codigo_diseno,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        async getCodigo() {
            this.overlay = true
            await axios
                .get(`${this.$config.API}/disenos/codigo/${this.item.id}`)
                .then((resp) => {
                    this.codigoDiseno = resp.data.codigo_diseno
                    this.overlay = false
                })
        },

        async updateCodigo() {
            this.overlay = true
            const data = new URLSearchParams()
            data.set('cod', this.codigoDiseno)
            data.set('id', this.item.id)

            await axios.post(`${this.$config.API}/disenos/codigo`, data).then((res) => {
                this.overlay = false
                // this.codigoDiseno = res.data.codigo_diseno
            })
        },

        token() {
            const length = 8
            var a =
                'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split(
                    ''
                )
            var b = []
            for (var i = 0; i < length; i++) {
                var j = (Math.random() * (a.length - 1)).toFixed(0)
                b[i] = a[j]
            }
            return b.join('')
        },
    },

    props: ['item'],

    mounted() {
        // this.getCodigo()
        // this.codigoDiseno = this.codigo_diseno
    },
}
</script>

<style>
.float-button {
    width: 100%;
    float: left;
    margin-bottom: 40px;
    margin-top: 1rem;
}

.image img {
    width: auto;
}
</style>
