<template>
    <div>
        <b-row v-if="images.length === 1">
            <b-col cols="12" class="mb-4 d-flex justify-content-center">
                <div class="image-container">
                    <div @click="zoomImage(images[0])" class="clickable-image">
                        <b-img-lazy :src="imgesUrls[0]" fluid class="image-zoom"></b-img-lazy>
                    </div>
                    <button v-if="shouldShowDelete()" class="btn btn-danger btn-sm delete-btn"
                        @click="confirmDelete(images[0], 0)">
                        X
                    </button>
                </div>
            </b-col>
        </b-row>
        <b-row v-else>
            <b-col v-for="(image, index) in imgesUrls" :key="index" cols="12" md="6"
                class="mb-4 d-flex justify-content-center">
                <div class="image-container">
                    <div @click="zoomImage(image)" class="clickable-image">
                        <b-img-lazy :src="image" fluid class="image-zoom"></b-img-lazy>
                    </div>
                    <button v-if="shouldShowDelete()" class="btn btn-danger btn-sm delete-btn"
                        @click="confirmDelete(image, index)">
                        X
                    </button>
                </div>
            </b-col>
        </b-row>
        <b-modal id="zoom-modal" centered size="xl" hide-footer ref="zoomModal" class="zoom-modal">
            <div class="d-flex justify-content-center align-items-center zoom-modal-content">
                <b-img :src="zoomedImage" fluid class="zoomed-image"></b-img>
            </div>
        </b-modal>
    </div>
</template>

<script>
export default {
    name: "ImagesGallery",
    props: {
        images: {
            type: Array,
            required: true,
        },
        showdelete: {
            type: String,
            default: "true",
        },
        idorden: {
            default: "0",
        },
    },
    data() {
        return {
            zoomedImage: null,
            disableDelete: false, // Nueva propiedad para deshabilitar el botón de eliminar
        }
    },
    computed: {
        imgesUrls() {
            let myImages = []
            if (this.images.length) {
                myImages = this.images.map((image) => {
                    let token = this.token()
                    // return `${this.$config.API}/${image}` + "&_=" + token
                    // return `${this.$config.API}/${image}`
                    return `${this.$config.API}/${image}?&_=${token}`
                })
            }
            return myImages
        },
    },
    mounted() {
        this.checkNoImage()
    },
    methods: {
        token() {
            const length = 8
            var a =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
                    ""
                )
            var b = []
            for (var i = 0; i < length; i++) {
                var j = (Math.random() * (a.length - 1)).toFixed(0)
                b[i] = a[j]
            }
            return b.join("")
        },

        async deleteImageFromServer(url) {
            this.overlay = true
            // EXTRAER NOMBRE DE LA IMAGEN A ELIMINAR
            const parts = url.split("/")

            // El nombre de la imagen será el último elemento del array resultante
            const imageName = parts[parts.length - 1]

            await this.$axios
                .delete(
                    `${this.$config.API}/disenos/images/${this.idorden}/${imageName}`
                )
                .then((res) => {
                    let iconType = ""
                    let title = ""
                    let html = `<p>${res.data.message}</p>`
                    if (res.data.status === "success") {
                        title = "Imagen Eliminada"
                        iconType = "success"
                    } else {
                        title = "Error"
                        iconType = "warning"
                    }

                    this.$fire({
                        title: title,
                        html: html,
                        type: iconType,
                    })
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<P>Ocurrió un error al eliminar la imagen.</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        confirmDelete(url, index) {
            this.$confirm(
                `¿Desea eliminar esta imagen?`,
                "Eliminar Imagen",
                "question"
            ).then(() => {
                this.deleteImageFromServer(url).then(() => {
                    this.deleteImage(index)
                })
            })
        },
        deleteImage(index) {
            this.images.splice(index, 1)
        },
        zoomImage(image) {
            this.zoomedImage = `${this.$config.API}/${image}?&_=${this.token()}`
            console.log("Zoomed Image:", this.zoomedImage) // Log para verificar el valor de zoomedImage
            this.$refs.zoomModal.show()
        },
        shouldShowDelete() {
            return this.showdelete === "true" && !this.disableDelete
        },
        checkNoImage() {
            // Asegurarse de que la comparación es correcta para todas las imágenes
            if (this.images.some((image) => image.includes("no-image.png"))) {
                this.disableDelete = true
            }
        },
    },
}
</script>

<style scoped>
.image-container {
    position: relative;
}

.delete-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
}

.image-zoom {
    cursor: pointer;
}

.clickable-image {
    cursor: pointer;
}

.zoom-modal-content {
    height: 80vh;
    /* Ajusta esto si es necesario */
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.zoomed-image {
    max-height: 100%;
    max-width: 100%;
}
</style>
