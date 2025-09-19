<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <b-container>
        <b-row>
          <b-col>
            <!--
              Este V-IF es la capa de seguridad que valida que solo los usuarios
              del departamento de Comercialización puedan ver este módulo.
            -->
            <div v-if="dataUser.departamento === 'Comercialización'">
              <h2 class="mb-4 text-center">Mi Relación de Pagos</h2>
              <vendedores-TablaDePagosVendedor :emp="dataUser.id_empleado" />
            </div>

            <!--
              Si el usuario no es de Comercialización, se muestra la alerta.
              Esto previene el acceso manual a través de la URL.
            -->
            <div v-else>
              <b-container>
                <b-row>
                  <b-col>
                    <b-alert variant="danger" show>
                      <h1>Este módulo no existe</h1>
                    </b-alert>
                  </b-col>
                </b-row>
              </b-container>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState("login", ["dataUser", "access"]),
  },
};
</script>
