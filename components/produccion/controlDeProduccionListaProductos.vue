<template>
  <div>
    <div>
      <!-- <b-button v-b-modal.modalPopover>Ver detalles</b-button> -->
      <b-button variant="primary" @click="$bvModal.show(modal)">
        <b-icon icon="eye"></b-icon>
      </b-button>

      <b-modal :id="modal" :title="title" size="lg" ok-only>
        {{ $props }}
        <b-row class="mt-2">
          <b-col>
            <div class="floatme">
              <diseno-viewImage :id="idorden" />
            </div>

            <div class="floatme">
              <b-button v-b-toggle.collapse-1 variant="primary"
                >Ver original</b-button
              >
              <b-collapse id="collapse-1" class="mt-2">
                <b-card>
                  <div v-html="detalles"></div>
                </b-card>
              </b-collapse>
            </div>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <div style="border: red 1px; text-align: right">
              {{ msg }}
            </div>
          </b-col>
        </b-row>

        <b-row class="mt-4">
          <b-col>
            <quill-editor
              v-model="borrador"
              @change="onEditorChange($event)"
              :options="quillOptions"
            ></quill-editor>
          </b-col>
        </b-row>
      </b-modal>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import quillOptions from "~/plugins/nuxt-quill-plugin";

export default {
  data() {
    return {
      title: `Detalles de la orden ${this.idorden}`,
      quillOptions,
      msg: "",
      borrador: "",
      html2: "",
    };
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);

      return `modal-${rand}`;
    },
  },

  methods: {
    async postBorrador(borrador) {
      this.msg = "Guardando...";
      const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("borrador", borrador);

      await axios
        .post(`${this.$config.API}/ordenes/borrador`, data)
        .then((res) => {
          this.msg = "Se guardaron sus cambios";
        })
        .catch((error) => {
          this.msg = "No se pudo guardar su borrador";
        });
    },

    onEditorChange({ editor, html, text }) {
      console.log("editor change!", editor, html, text);
      this.postBorrador(html);
      this.borrador = html;
    },
  },

  mounted() {
    this.borrador = this.detalles;
  },

  props: ["idorden", "detalles"],
};
</script>
