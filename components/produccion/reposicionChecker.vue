<template>
    <div>
        <div v-if="showControl">
            <b-button
                variant="success"
                style="margin-top: -7px"
                @click="$bvModal.show(modal)"
            >
                <b-icon icon="eye"></b-icon>
            </b-button>
        </div>

        <!-- <pre>
        reposiciones registradas apra este producto: {{ repos }}
    </pre> -->

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :overlay="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col xl="12" lg="12" md="12" sm="12">
                            <b-table striped hover :items="repos"></b-table>
                        </b-col>
                    </b-row>
                </b-container>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"

export default {
    data() {
        return {
            size: "lg",
            title: "Detalles de la reposición",
            overlay: false,
            repos: null,
            reload: false,
        }
    },

    methods: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },

        async getRepositions() {
            await this.$axios
                .get(
                    `${this.$config.API}/reposiciones/${this.item.item.Reponer}/${this.item.item.Orden}`
                )
                .then((res) => {
                    this.repos = res.data.data
                })
        },
    },

    mounted() {
        this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
            this.getRepositions().then(() => {
                if (this.repos.length) {
                    this.showControl = true
                }
            })
        })
    },

    props: ["item", "showControl"],
}
</script>
