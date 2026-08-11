<template>
    <div>
        <b-table striped hover :fields="fields" :items="items">
            <template #cell(id_orden)="data">
                <linkSearch :id="data.item.id_orden" />
            </template>
            <template #cell(tallas_personalizacion)="data">
                <disenosse-tallasPersoalizacion :item="data.item" :ajustes="ajustes" />
            </template>
        </b-table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            overlay: false,
            events: [],
            items: [],
            revisiones: [],
            ajustes: [],
            fields: [
                {
                    key: 'id_orden',
                    label: 'Orden',
                },
                {
                    key: 'tallas_personalizacion',
                    label: 'Tallas y personalizacion',
                },
            ],
        }
    },

    mounted() {
        this.loadDisenos()
    },

    methods: {
        async loadDisenos() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/sse/disenos-todo`)
                .then((res) => {
                    const rawItems = res.data.items || []
                    this.items = rawItems.reduce((acumulador, objeto) => {
                        const idOrden = objeto.id_orden
                        const objetoExistente = acumulador.find(
                            (item) => item.id_orden === idOrden
                        )

                        if (!objetoExistente) {
                            acumulador.push(objeto)
                        }

                        return acumulador
                    }, [])
                    this.ajustes = res.data.ajustes || []
                    this.overlay = false
                })
                .catch((err) => {
                    console.error('Error al cargar disenos todo:', err)
                    this.overlay = false
                })
        },
    },
}
</script>
