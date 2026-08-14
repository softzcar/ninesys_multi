<template>
  <div class="wizard-operativo-container d-flex align-items-center justify-content-center">
    <b-container class="mt-5">
      <h2 class="text-center mb-4">Configuración Operativa</h2>

      <form-wizard
        v-if="isReady"
        title="Personaliza los datos de ejemplo de tu empresa"
        subtitle="Al crear tu cuenta cargamos datos de ejemplo para que el sistema funcione desde el primer momento. Revísalos y reemplázalos por los tuyos."
        color="#007bff"
        :start-index="startIndex"
        @on-complete="finalizarWizard"
      >
        <template v-slot:footer="props">
          <div class="d-flex justify-content-between w-100">
            <div>
              <b-button @click="props.prevTab()" v-if="props.activeTabIndex > 0" variant="secondary">
                Anterior
              </b-button>
            </div>
            <div>
              <b-button
                v-if="mostrarBotonOmitirTodo(props.activeTabIndex)"
                @click="continuarMasTarde"
                variant="outline-secondary"
                class="mr-2"
              >
                Continuar más tarde
              </b-button>
              <b-button
                v-if="!props.isLastStep"
                @click="avanzar(props)"
                variant="primary"
                :disabled="!pasoSatisfecho(obtenerPasoPorTab(props.activeTabIndex))"
              >
                {{ pasoRevisado(obtenerPasoPorTab(props.activeTabIndex)) ? "Continuar" : "Marcar como revisado y continuar" }}
              </b-button>
              <b-button @click="finalizarWizard()" v-else variant="success">
                Finalizar
              </b-button>
            </div>
          </div>
        </template>

        <tab-content title="Bienvenida" icon="ti ti-hand-point-right">
          <h2 class="display-4 text-center mb-4">¡Ya casi está todo listo!</h2>
          <p class="lead text-center">
            Tu cuenta se creó con datos de ejemplo (departamentos, empleados, productos, insumos,
            impresoras, etc.) para que puedas explorar el sistema de inmediato.
          </p>
          <hr class="my-4" />
          <p class="text-center">
            Este asistente te guía, paso a paso, para reemplazar esos datos de ejemplo por los
            reales de tu negocio. Si en algún paso prefieres dejarlo para después, puedes
            continuar usando el dato de ejemplo por ahora y ajustarlo luego desde el menú normal.
          </p>
          <p class="mt-4 text-center">
            Por favor, haz clic en <strong>Siguiente</strong> para comenzar.
          </p>
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('departamentos'))"
          :icon="pasoPorClave('departamentos').icon"
          :before-change="() => validarPaso(0)"
        >
          <paso-cabecera :paso="pasoPorClave('departamentos')" />
          <departamentos-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('empleados'))"
          :icon="pasoPorClave('empleados').icon"
          :before-change="() => validarPaso(1)"
        >
          <paso-cabecera :paso="pasoPorClave('empleados')" />
          <empleados-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('categorias'))"
          :icon="pasoPorClave('categorias').icon"
          :before-change="() => validarPaso(2)"
        >
          <paso-cabecera :paso="pasoPorClave('categorias')" />
          <categorias-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('productos'))"
          :icon="pasoPorClave('productos').icon"
          :before-change="() => validarPaso(3)"
        >
          <paso-cabecera :paso="pasoPorClave('productos')" />
          <productos-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('insumos'))"
          :icon="pasoPorClave('insumos').icon"
          :before-change="() => validarPaso(4)"
        >
          <paso-cabecera :paso="pasoPorClave('insumos')" />
          <h5 class="mt-4 mb-2">Catálogo de insumos</h5>
          <catalogo-insumos-gestion />
          <hr class="my-4" />
          <h5 class="mb-2">Insumos asignados a cada producto</h5>
          <admin-InsumosDeProductos />
          <hr class="my-4" />
          <h5 class="mb-2">Inventario físico</h5>
          <inventario-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('comisiones'))"
          :icon="pasoPorClave('comisiones').icon"
          :before-change="() => validarPaso(5)"
        >
          <paso-cabecera :paso="pasoPorClave('comisiones')" />
          <admin-ComisionesProductos />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('impresoras'))"
          :icon="pasoPorClave('impresoras').icon"
          :before-change="() => validarPaso(6)"
        >
          <paso-cabecera :paso="pasoPorClave('impresoras')" />
          <impresoras-gestion v-if="!pasoPorClave('impresoras').noAplica" />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('tintas'))"
          :icon="pasoPorClave('tintas').icon"
          :before-change="() => validarPaso(7)"
        >
          <paso-cabecera :paso="pasoPorClave('tintas')" />
          <AdminRecargaTintas v-if="!pasoPorClave('tintas').noAplica" />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('tallas_telas'))"
          :icon="pasoPorClave('tallas_telas').icon"
          :before-change="() => validarPaso(8)"
        >
          <paso-cabecera :paso="pasoPorClave('tallas_telas')" />
          <h5 class="mt-4 mb-2">Tallas</h5>
          <tallas-gestion />
          <hr class="my-4" />
          <h5 class="mb-2">Telas</h5>
          <telas-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('whatsapp'))"
          :icon="pasoPorClave('whatsapp').icon"
          :before-change="() => validarPaso(9)"
        >
          <paso-cabecera :paso="pasoPorClave('whatsapp')" />

          <b-card class="mb-4">
            <b-form-checkbox
              v-model="whatsappAiEnabled"
              switch
              size="lg"
              @change="cambiarWhatsappAiEnabled"
            >
              ¿Deseas que el bot de WhatsApp responda automáticamente a tus clientes?
            </b-form-checkbox>
            <p class="text-muted small mb-0 mt-2">
              Por defecto viene desactivado. Actívalo solo cuando hayas revisado el agente de IA
              (mensajes, catálogo y reglas de negocio) en Configuración de WhatsApp.
            </p>
          </b-card>

          <whatsapp-WaConexion />
        </tab-content>

        <tab-content title="Resumen" icon="ti ti-check-box">
          <b-card header-tag="header">
            <template #header>
              <h4 class="mb-0">Resumen</h4>
            </template>
            <b-list-group flush>
              <b-list-group-item
                v-for="paso in pasos"
                :key="paso.clave"
                class="d-flex justify-content-between align-items-center"
              >
                {{ paso.titulo }}
                <b-badge v-if="paso.noAplica" variant="secondary">No aplica</b-badge>
                <b-badge v-else-if="paso.revisado" variant="success">Revisado</b-badge>
                <b-badge v-else variant="warning">Pendiente</b-badge>
              </b-list-group-item>
            </b-list-group>
          </b-card>

          <b-alert show variant="success" class="mt-4 text-center">
            <h4>¡Todo listo!</h4>
            <p class="mb-0">
              Presiona <strong>Finalizar</strong> para empezar a usar la aplicación.
            </p>
          </b-alert>
        </tab-content>
      </form-wizard>
    </b-container>
  </div>
</template>

<script>
import { FormWizard, TabContent } from "vue-form-wizard";
import "vue-form-wizard/dist/vue-form-wizard.min.css";
import { mapState } from "vuex";
import PasoCabecera from "~/components/empresa/PasoCabecera.vue";
import DepartamentosGestion from "~/pages/departamentos/gestion.vue";
import EmpleadosGestion from "~/pages/empleados/gestion/index.vue";
import CategoriasGestion from "~/pages/categorias/gestion.vue";
import ProductosGestion from "~/pages/productos/gestion.vue";
import CatalogoInsumosGestion from "~/pages/catalogo-insumos-productos.vue";
import InventarioGestion from "~/pages/inventario/gestion/index.vue";
import ImpresorasGestion from "~/pages/impresoras/gestion/index.vue";
import TallasGestion from "~/pages/tallas/index.vue";
import TelasGestion from "~/pages/telas.vue";

const DEFINICION_PASOS = [
  {
    clave: "departamentos",
    titulo: "Departamentos",
    icon: "ti ti-building",
    descripcion:
      "Sembramos 8 departamentos de ejemplo (Impresión, Estampado, Corte, Costura, Administración, Comercialización, Diseño, Producción). Ajusta los nombres y desactiva los que no apliquen a tu negocio -- esto determina más adelante si te pedimos datos de impresoras y tintas.",
    rutaSugerida: "Empleados > Gestión de Departamentos",
  },
  {
    clave: "empleados",
    titulo: "Empleados",
    icon: "ti ti-user",
    descripcion:
      "Creamos un empleado de ejemplo por departamento con correos ficticios. Reemplázalos por las personas reales de tu equipo.",
    rutaSugerida: "Empleados > Gestión",
  },
  {
    clave: "categorias",
    titulo: "Categorías de productos",
    icon: "ti ti-tag",
    descripcion: 'Reemplaza la "Categoría de Pruebas" por las categorías reales de tu catálogo.',
    rutaSugerida: "Productos > Categorías",
  },
  {
    clave: "productos",
    titulo: "Productos",
    icon: "ti ti-package",
    descripcion: "Reemplaza los 3 productos de ejemplo por los productos reales que fabricas o vendes.",
    rutaSugerida: "Productos > Gestión de Productos",
  },
  {
    clave: "insumos",
    titulo: "Insumos de productos",
    icon: "ti ti-layers",
    descripcion:
      "Revisa el catálogo de insumos, la asignación de insumos a cada producto y el inventario físico de ejemplo.",
    rutaSugerida: "Productos > Insumos de Productos",
  },
  {
    clave: "comisiones",
    titulo: "Comisiones de productos",
    icon: "ti ti-percent",
    descripcion: "Ajusta las comisiones de ejemplo por producto y departamento.",
    rutaSugerida: "Productos > Comisiones de Productos",
  },
  {
    clave: "impresoras",
    titulo: "Impresoras",
    icon: "ti ti-printer",
    descripcion: "Reemplaza las 2 impresoras de ejemplo por las impresoras reales de tu taller.",
    rutaSugerida: "Inventario > Gestión de Impresoras",
  },
  {
    clave: "tintas",
    titulo: "Recarga de tintas",
    icon: "ti ti-droplet",
    descripcion: "Registra la primera carga real de tintas para tus impresoras.",
    rutaSugerida: "Inventario > Recarga de Tintas",
  },
  {
    clave: "tallas_telas",
    titulo: "Tallas y telas",
    icon: "ti ti-ruler",
    descripcion: 'Confirma las tallas estándar (S/M/L/XL) y reemplaza la "Tela de Prueba" por tus telas reales.',
    rutaSugerida: "Varios > Tallas y Telas",
  },
  {
    clave: "whatsapp",
    titulo: "WhatsApp",
    icon: "ti ti-brand-whatsapp",
    descripcion: "Escanea el código QR para conectar tu número de WhatsApp y decide si el bot responde automáticamente.",
    rutaSugerida: "WhatsApp > Conexión",
  },
];

export default {
  name: "OperativaWizard",
  components: {
    FormWizard,
    TabContent,
    PasoCabecera,
    DepartamentosGestion,
    EmpleadosGestion,
    CategoriasGestion,
    ProductosGestion,
    CatalogoInsumosGestion,
    InventarioGestion,
    ImpresorasGestion,
    TallasGestion,
    TelasGestion,
  },
  data() {
    return {
      isReady: false,
      pasos: DEFINICION_PASOS.map((p) => ({ ...p, revisado: false, noAplica: false })),
      whatsappAiEnabled: false,
    };
  },
  computed: {
    ...mapState("login", ["wizardOperativo", "idEmpresa"]),
    startIndex() {
      const primerPendiente = this.pasos.findIndex((p) => !p.revisado && !p.noAplica);
      // +1 porque el índice 0 del wizard es la Bienvenida
      return primerPendiente === -1 ? this.pasos.length + 1 : primerPendiente + 1;
    },
  },
  created() {
    this.cargarEstado();
    this.cargarWhatsappAiEnabled();
  },
  methods: {
    async cargarWhatsappAiEnabled() {
      try {
        const { data } = await this.$wsApi.get(`/ai/settings/${this.idEmpresa}`);
        this.whatsappAiEnabled = !!(data && data.enabled);
      } catch (error) {
        console.error("Error al cargar la configuración de IA de WhatsApp:", error);
      }
    },
    async cambiarWhatsappAiEnabled(enabled) {
      try {
        await this.$wsApi.post(`/ai/toggle/${this.idEmpresa}`, { enabled });
      } catch (error) {
        // Revertir el switch visualmente si falla el guardado
        this.whatsappAiEnabled = !enabled;
        console.error("Error al actualizar la configuración de IA de WhatsApp:", error);
        this.$fire({
          type: "error",
          title: "No se pudo guardar",
          html: "Intenta de nuevo en unos segundos.",
        });
      }
    },
    pasoPorClave(clave) {
      return this.pasos.find((p) => p.clave === clave) || {};
    },
    tituloPaso(paso) {
      return paso.noAplica ? `${paso.titulo} (no aplica)` : paso.titulo;
    },
    // El índice global del FormWizard incluye la pestaña "Bienvenida" (tab 0),
    // así que los pasos reales viven en las pestañas 1..pasos.length. La
    // pestaña "Bienvenida" y la de "Resumen" no corresponden a ningún paso.
    obtenerPasoPorTab(activeTabIndex) {
      return this.pasos[activeTabIndex - 1] || null;
    },
    pasoSatisfecho(paso) {
      // null = pestaña sin paso asociado (Bienvenida/Resumen) -> nunca bloquea.
      if (paso === null) return true;
      return !!(paso && (paso.revisado || paso.noAplica));
    },
    pasoRevisado(paso) {
      return !!(paso && paso.revisado);
    },
    mostrarBotonOmitirTodo(activeTabIndex) {
      // Visible desde el 2º paso real en adelante (tab 2 = "empleados"), no en
      // la Bienvenida ni durante el primer paso ("departamentos").
      return activeTabIndex >= 2 && activeTabIndex <= this.pasos.length;
    },
    async avanzar(props) {
      const paso = this.obtenerPasoPorTab(props.activeTabIndex);
      if (paso && !paso.noAplica && !paso.revisado) {
        const ok = await this.marcarRevisado(paso.clave);
        if (!ok) return;
      }
      props.nextTab();
    },
    async validarPaso(index) {
      const paso = this.pasos[index];
      if (!paso) return true;
      return this.pasoSatisfecho(paso);
    },
    async cargarEstado() {
      try {
        const { data } = await this.$axios.get(`${this.$config.API}/wizard-operativo/estado`);
        this.aplicarEstado(data);
      } catch (error) {
        console.error("Error al cargar el estado del wizard operativo:", error);
      } finally {
        this.isReady = true;
      }
    },
    aplicarEstado(data) {
      if (!data || !data.pasos) return;
      this.pasos = this.pasos.map((p) => ({
        ...p,
        revisado: !!data.pasos[p.clave]?.revisado,
        noAplica: !!data.pasos[p.clave]?.no_aplica,
      }));
      this.$store.commit("login/setWizardOperativo", {
        wizard_operativo_completo: !!data.wizard_operativo_completo,
        wizard_operativo_omitido_en: !!data.wizard_operativo_omitido_en,
      });
    },
    async marcarRevisado(clave) {
      try {
        const { data } = await this.$axios.post(`${this.$config.API}/wizard-operativo/paso/${clave}/completar`);
        this.aplicarEstado(data);
        return true;
      } catch (error) {
        console.error("Error al marcar el paso como revisado:", error);
        this.$fire({
          type: "error",
          title: "No se pudo guardar",
          html: "Intenta de nuevo en unos segundos.",
        });
        return false;
      }
    },
    async continuarMasTarde() {
      try {
        const { data } = await this.$axios.post(`${this.$config.API}/wizard-operativo/continuar-mas-tarde`);
        this.aplicarEstado(data);
        window.location.assign("/");
      } catch (error) {
        console.error("Error al posponer el wizard operativo:", error);
      }
    },
    async finalizarWizard() {
      // Cualquier paso pendiente que quede al llegar al Resumen se guarda igual
      // como "revisado" para no dejar el wizard bloqueado por un olvido de UI.
      for (const paso of this.pasos) {
        if (!paso.revisado && !paso.noAplica) {
          await this.marcarRevisado(paso.clave);
        }
      }
      window.location.assign("/");
    },
  },
};
</script>

<style>
.wizard-operativo-container {
  min-height: 80vh;
}
</style>
