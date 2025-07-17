<template>
  <div>
    <b-overlay :show="overlay">
      <b-button
        :disabled="buttonDisabled"
        :variant="variants.button"
        @click="$bvModal.show(modal)"
      >
        Revisiones
        <b-badge :variant="variants.badge">{{ nroRevisiones }}</b-badge>
      </b-button>

      <b-modal
        :size="size"
        :title="title"
        :id="modal"
        hide-footer
      >
        <b-container>
          <b-row>
            <b-col>
              <b-card-group
                v-for="(rev, index) in revisiones"
                v-bind:key="index"
                class="mb-4 mt-4"
                deck
              >
                <diseno-revisionesForm :item="rev" />
                <!-- <diseno-uploadPropuesta
                  :id="item.id"
                  :revision="rev.revision"
                  :item="rev"
                  :reload="banReload"
                  :nextReview="nextReview"
                  :button="enableButton"
                  :idorden="item.id_orden"
                /> -->
              </b-card-group>
            </b-col>
          </b-row>
        </b-container>
      </b-modal>
    </b-overlay>
  </div>
</template>

<script>
import axios from "axios";
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],
  data() {
    return {
      size: "lg",
      title: "Revisiones",
      overlay: false,
      buttonDisabled: true,
      revisiones: [],
      nroRevisiones: 0,
      reloadMe: false,
      variants: {
        button: "secondary",
        badge: "secondary",
      },
    };
  },

  watch: {
    reloadMe(val) {
      if (val) {
        this.overlay = true;
        this.checkReviews().then(() => {
          this.reloadMe = false;
          this.overlay = false;
        });
      }
    },
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

  methods: {
    async reload() {
      /* setInterval(
        await this.$axios
          .get(
            `${this.$config.API}/diseno/revisiones/${this.$store.state.login.dataUser.id_empleado}`
          )
          .then((res) => {
            this.revisiones = res.data.revisiones
            this.nroRevisiones = res.data.total_revisiones
            if (this.nroRevisiones > 0) {
              this.variants.button = 'success'
              this.variants.badge = 'danger'
              this.buttonDisabled = false
            } else {
              this.variants.button = 'secondary'
              this.variants.badge = 'secondary'
            }
          }),
        3000
      ) */
    },
    /* async reload() {
      setInterval(await this.checkReviews(), 45000)
    }, */

    async checkReviews() {
      await this.$axios
        .get(
          `${this.$config.API}/diseno/revisiones/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.revisiones = res.data.revisiones;
          this.nroRevisiones = res.data.total_revisiones;
          if (this.nroRevisiones > 0) {
            this.variants.button = "success";
            this.variants.badge = "danger";
            this.buttonDisabled = false;
          } else {
            this.variants.button = "secondary";
            this.variants.badge = "secondary";
          }
        });
      return true;
    },
  },
  mounted() {
    this.checkReviews();
    // setInterval(this.checkReviews, 12000)
    // this.reload()
  },
};
</script>
