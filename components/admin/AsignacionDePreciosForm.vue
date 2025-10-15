<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <div class="mb-2">
                <label for="input-precio">Precio </label>
                <b-form-input id="input-precio" style="width: 100px" type="number" min="0" step="0.10" v-model="item.price" />

                <label for="input-description">Descripción </label>
                <b-form-input id="input-description" style="width: 100px" type="text" v-model="item.description" />
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
