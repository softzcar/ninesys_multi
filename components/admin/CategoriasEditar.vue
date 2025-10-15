<template>
  <div>
    <b-button
      size="sm"
      class="mb-4"
      @click="$bvModal.show(modal)"
      variant="primary"
    >
      <b-icon icon="pencil"></b-icon>
    </b-button>

    <b-modal
      :id="modal"
      :title="title"
      @hidden="onModalHidden"
      hide-footer
      size="md"
    >
      <b-overlay :show="overlay" spinner-small>
        <b-form>
          <b-form-group
            id="input-group-1"
            label="Nombre de la categoría:"
            label-for="input-1"
          >
            <b-form-input
              style="width: 250px"
              type="text"
              v-model="newCat"
              :disabled="overlay"
            />
          </b-form-group>

          <b-button
            class="floatme"
            @click="editarCategoria()"
            variant="success"
            :disabled="overlay"
          >
            <b-icon icon="check-lg"></b-icon>
          </b-button>
        </b-form>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],

  data() {
    return {
      title: "Editar Categoría",
      overlay: false,
      newCat: "",
    };
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

  methods: {
    onModalHidden() {
      // this.newCat = ''
    },
    async editarCategoria() {
      let ok = true;
      let msg = "";
      let icon = "success";

      if (this.newCat.trim() === "") {
        ok = false;
        msg += "<p>Debe indicar el nombre de la categoría</p>";
        icon = "info";
      }

      if (!ok) {
        this.$fire({
          title: "Editar Categoría",
          html: msg,
          type: icon,
        });
      } else {
        this.overlay = true;
        const data = new URLSearchParams();
        data.set("name", this.newCat);

        await this.$axios
          .put(`${this.$config.API}/categories/${this.item.id}`, data)
          .then((res) => {
            const checkMe = this.checkResponse(res);
            console.log("checkResponse", checkMe);

            if (checkMe) {
              this.$emit("reload", "true");
              this.$fire({
                title: "Editar Categoría",
                html: "<p>La categoría se actualizó correctamente</p>",
                type: "success",
              });
              this.$bvModal.hide(this.modal);
            }
          })
          .catch((err) => {
            this.$fire({
              title: "Editar Categoría",
              html: `<p>Ocurrió un error al conectarse a internet</p> <p>${err}</p> `,
              type: "error",
            });
          })
          .finally(() => {
            this.overlay = false;
          });
      }
    },
  },

  mounted() {
    this.newCat = this.item.name;
  },

  props: ["item", "reload"],
};
</script>