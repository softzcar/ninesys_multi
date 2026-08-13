<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <div class="mb-2">
                <label for="input-monto">Monto </label>
                <campo-decimal id="input-monto" style="width: 100px" v-model="item.monto" />

                <label for="input-descripcion">Descripción </label>
                <b-form-input id="input-descripcion" style="width: 200px" type="text" v-model="item.descripcion" />

                <b-button
                    variant="danger"
                    size="sm"
                    @click="$emit('remove')"
                    class="ml-2"
                >
                    <b-icon icon="trash"></b-icon>
                </b-button>
            </div>
        </b-overlay>
    </div>
</template>

<script>
export default {
    data() {
        return {
            overlay: false,
        }
    },
    props: ["item", "index"],
}
</script>