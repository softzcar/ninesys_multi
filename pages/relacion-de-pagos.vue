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
            <h2 class="mb-4 text-center">Mi Relación de Pagos</h2>

            <!-- Opción para Vendedores -->
            <div v-if="dataUser.departamento === 'Comercialización' || dataUser.departamento === 'Comecialización' || dataUser.departamento === 'Administración'" >
              <vendedores-TablaDePagosVendedor :emp="dataUser.id_empleado" />
            </div>

            <!-- Opción para Administración y otros roles de producción -->
            <div v-else-if="hasGeneralAccess">
              <empleados-TablaDePagos :emp="dataUser.id_empleado" />
            </div>

            <!-- Mensaje para usuarios sin acceso -->
            <div v-else>
              <b-container>
                <b-row>
                  <b-col>
                    <b-alert variant="danger" show>
                      <h1>No tiene acceso a este módulo</h1>
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
import TablaDePagos from '~/components/empleados/TablaDePagos.vue';
import TablaDePagosVendedor from '~/components/vendedores/TablaDePagosVendedor.vue';

export default {
  components: {
    'empleados-TablaDePagos': TablaDePagos,
    'vendedores-TablaDePagosVendedor': TablaDePagosVendedor,
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),
    
    // Determina si el usuario tiene acceso a la vista general de pagos
    hasGeneralAccess() {
      const allowedDepts = [
        'Administración',
        'Diseño',
        'Empleado',
        'Corte',
        'Impresión',
        'Estampado',
        'Costura',
        'Limpieza',
        'Revisión'
      ];
      return allowedDepts.includes(this.dataUser.departamento);
    }
  },
};
</script>
