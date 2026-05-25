<template>
    <div>
        <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="cloud-upload"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col xl="6" lg="6" md="6" sm="12">
                            <div class="image-container">
                                <img
                                    :src="imageUrl"
                                    :width="imageWidth"
                                    :height="imageHeight"
                                />
                            </div>
                        </b-col>
                        <b-col xl="6" lg="6" md="6" sm="12">
                            <div class="float-button">
                                <b-form-file
                                    v-model="newImage"
                                    :state="Boolean(newImage)"
                                    placeholder="Seleccione el diseño"
                                    drop-placeholder="Arrastre el diseño aquí"
                                    accept="image/jpeg, image/png"
                                ></b-form-file>
                                <div class="mt-3">
                                    {{ newImage ? newImage.name : "" }}
                                </div>
                            </div>
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
            newImage: null,
            size: "lg",
            title: "Imágen del diseño",
            overlay: true,
            imageWidth: "100%",
            imageHeight: "auto",
            imageUrl: "",
            actionURL: "",

            // ANTIGUO
            titulo: "",
            fileList: [],
        }
    },

    computed: {
        srcImag() {
            let token = this.token()
            return this.imageUrl + "&_=" + token
        },
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)

            return `modal-${rand}`
        },
    },

    watch: {
        async newImage() {
            if (!this.newImage) return
            this.overlay = true
            let fileToUpload = this.newImage
            if (this.newImage && this.newImage.type.startsWith("image/")) {
                try {
                    fileToUpload = await this.resizeImage(this.newImage)
                } catch (e) {
                    console.error("Error client-side resizing image:", e)
                }
            }
            let formData = new FormData()
            formData.append("file", fileToUpload)
            this.$axios
                // .post(`${this.$config.CDN}/?id=${this.id}`, formData, {
                .post(
                    `${this.$config.API}/disenos/imagen/${this.id}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                )
                .then(() => {
                    this.getImagen().then(() => {
                        this.overlay = false
                        this.newImage = null
                    })
                })
        },
    },

    methods: {
        resizeImage(file, maxWidth = 1200, maxHeight = 1200) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > maxWidth) {
                                height = Math.round((height * maxWidth) / width);
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = Math.round((width * maxHeight) / height);
                                height = maxHeight;
                            }
                        }

                        const canvas = document.createElement("canvas");
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, width, height);

                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    resolve(new File([blob], file.name, { type: file.type }));
                                } else {
                                    reject(new Error("Canvas toBlob failed"));
                                }
                            },
                            file.type || "image/png"
                        );
                    };
                    img.onerror = (err) => reject(err);
                };
                reader.onerror = (err) => reject(err);
            });
        },
        async getImagen() {
            await this.$axios(`${this.$config.CDN}/?id=${this.id}`)
                .then((res) => res.json())
                .then((res) => {
                    // let rnd = Math.floor( Math.random() * 10 ) // PREVENIR CAHCHEAR LA IMAGEN
                    this.imageUrl = `https://` + res.url + `?t=${this.token()}`
                })
                .catch((err) => {
                    console.log(err)
                })
        },

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
    },

    props: ["id"],

    mounted() {
        this.overlay = true
        this.titulo = `Imagen de la orden ${this.id}`
        this.getImagen().then(() => {
            this.overlay = false
            this.actionURL = `${this.$config.CDN}/?id=${this.id}`
        })
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
