<template>
  <div class="wizard-operativo-container d-flex align-items-center justify-content-center">
    <b-container fluid class="mt-5 wizard-operativo-inner">
      <h2 class="text-center mb-4">Configuración de tu Empresa</h2>

      <form-wizard
        v-if="isReady"
        title="Completa la configuración de tu empresa"
        subtitle="Carga tus datos reales donde los tengas a mano. Donde no, puedes dejar el valor por defecto y completarlo después desde Configuración."
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
              >
                Siguiente
              </b-button>
              <b-button @click="finalizarWizard()" v-else variant="success">
                Finalizar
              </b-button>
            </div>
          </div>
        </template>

        <tab-content title="Bienvenida" icon="ti ti-hand-point-right">
          <h2 class="display-4 text-center mb-4">¡Bienvenido a Ninesys!</h2>
          <p class="lead text-center">
            Tu cuenta se creó con datos de ejemplo (empresa, departamentos, empleados, productos,
            insumos, impresoras, etc.) para que puedas explorar el sistema de inmediato.
          </p>
          <hr class="my-4" />
          <p class="text-center">
            Este asistente te guía, paso a paso, para cargar los datos reales de tu empresa. Si en
            algún paso no tienes el dato a mano, puedes dejarlo con su valor por defecto y
            completarlo después desde Configuración.
          </p>
          <p class="mt-4 text-center">
            Por favor, haz clic en <strong>Siguiente</strong> para comenzar.
          </p>
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('admin'))"
          :icon="pasoPorClave('admin').icon"
          :before-change="() => validarPaso(0)"
        >
          <paso-cabecera :paso="pasoPorClave('admin')" />
          <config-admin-form
            ref="adminForm"
            :initial-data="adminData"
            :country-codes="countryCodes"
            :show-save-button="false"
            @phone-blur="handlePhoneBlur"
          />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('empresa'))"
          :icon="pasoPorClave('empresa').icon"
          :before-change="() => validarPaso(1)"
        >
          <paso-cabecera :paso="pasoPorClave('empresa')" />
          <config-empresa-form
            ref="empresaForm"
            :initial-data="empresaData"
            :country-codes="countryCodes"
            :show-save-button="false"
            @phone-blur="handlePhoneBlur"
          />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('monedas'))"
          :icon="pasoPorClave('monedas').icon"
          :before-change="() => validarPaso(2)"
        >
          <paso-cabecera :paso="pasoPorClave('monedas')" />
          <b-alert show variant="warning" class="small">
            Si omites este paso sin configurar al menos una moneda con método de pago, no podrás
            capturar pagos en Nueva Orden hasta que lo configures.
          </b-alert>
          <config-monedas-form ref="monedasForm" :show-save-button="false" />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('horario'))"
          :icon="pasoPorClave('horario').icon"
          :before-change="() => validarPaso(3)"
        >
          <paso-cabecera :paso="pasoPorClave('horario')" />
          <config-horario-form ref="horarioForm" :initial-data="horarioData" :show-save-button="false" />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('personalizacion'))"
          :icon="pasoPorClave('personalizacion').icon"
          :before-change="() => validarPaso(4)"
        >
          <paso-cabecera :paso="pasoPorClave('personalizacion')" />
          <config-personalizacion-form ref="personalizacionForm" :initial-data="personalizacionData" :show-save-button="false" />
          <hr class="my-4" />
          <config-timezone-form ref="timezoneForm" :initial-data="timezoneData" :show-save-button="false" />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('gastos'))"
          :icon="pasoPorClave('gastos').icon"
          :before-change="() => validarPaso(5)"
        >
          <paso-cabecera :paso="pasoPorClave('gastos')" />
          <config-gastos-form ref="gastosForm" :initial-data="gastosData" :monedas="monedasData" :show-save-button="false" />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('departamentos'))"
          :icon="pasoPorClave('departamentos').icon"
          :before-change="() => validarPaso(6)"
        >
          <paso-cabecera :paso="pasoPorClave('departamentos')" />
          <departamentos-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('empleados'))"
          :icon="pasoPorClave('empleados').icon"
          :before-change="() => validarPaso(7)"
        >
          <paso-cabecera :paso="pasoPorClave('empleados')" />
          <empleados-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('categorias'))"
          :icon="pasoPorClave('categorias').icon"
          :before-change="() => validarPaso(8)"
        >
          <paso-cabecera :paso="pasoPorClave('categorias')" />
          <categorias-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('productos'))"
          :icon="pasoPorClave('productos').icon"
          :before-change="() => validarPaso(9)"
        >
          <paso-cabecera :paso="pasoPorClave('productos')" />
          <productos-gestion />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('insumos'))"
          :icon="pasoPorClave('insumos').icon"
          :before-change="() => validarPaso(10)"
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
          :before-change="() => validarPaso(11)"
        >
          <paso-cabecera :paso="pasoPorClave('comisiones')" />
          <admin-ComisionesProductos />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('impresoras'))"
          :icon="pasoPorClave('impresoras').icon"
          :before-change="() => validarPaso(12)"
        >
          <paso-cabecera :paso="pasoPorClave('impresoras')" />
          <impresoras-gestion v-if="!pasoPorClave('impresoras').noAplica" />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('inventario_tintas'))"
          :icon="pasoPorClave('inventario_tintas').icon"
          :before-change="() => validarPaso(13)"
        >
          <paso-cabecera :paso="pasoPorClave('inventario_tintas')" />
          <inventario-InsumoNuevoTinta v-if="!pasoPorClave('inventario_tintas').noAplica" />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('tintas'))"
          :icon="pasoPorClave('tintas').icon"
          :before-change="() => validarPaso(14)"
        >
          <paso-cabecera :paso="pasoPorClave('tintas')" />
          <AdminRecargaTintas v-if="!pasoPorClave('tintas').noAplica" />
        </tab-content>

        <tab-content
          :title="tituloPaso(pasoPorClave('tallas_telas'))"
          :icon="pasoPorClave('tallas_telas').icon"
          :before-change="() => validarPaso(15)"
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
          :before-change="() => validarPaso(16)"
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
import ConfigAdminForm from "~/components/empresa/ConfigAdminForm.vue";
import ConfigEmpresaForm from "~/components/empresa/ConfigEmpresaForm.vue";
import ConfigMonedasForm from "~/components/empresa/ConfigMonedasForm.vue";
import ConfigHorarioForm from "~/components/empresa/ConfigHorarioForm.vue";
import ConfigPersonalizacionForm from "~/components/empresa/ConfigPersonalizacionForm.vue";
import ConfigTimezoneForm from "~/components/empresa/ConfigTimezoneForm.vue";
import ConfigGastosForm from "~/components/empresa/ConfigGastosForm.vue";
import institucionalWizardData from "~/mixins/institucionalWizardData.js";
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
    clave: "admin",
    titulo: "Datos del Administrador",
    icon: "ti ti-user",
    descripcion: "Nombre, teléfono y contraseña del administrador de la cuenta.",
    rutaSugerida: "Configuración > Datos del Administrador",
    formRefs: ["adminForm"],
    // Sin valor por defecto razonable (no hay "nombre de admin" genérico) --
    // este paso sí bloquea el avance si el formulario queda incompleto.
    bloqueaSiIncompleto: true,
  },
  {
    clave: "empresa",
    titulo: "Datos de la Empresa",
    icon: "ti ti-home",
    descripcion: "Nombre legal, registro, dirección y datos de contacto de tu empresa.",
    rutaSugerida: "Configuración > Datos de la Empresa",
    formRefs: ["empresaForm"],
    // Igual que "admin": nombre/registro legal/dirección/teléfono/email de la
    // empresa no tienen ningún default válido, así que este paso bloquea.
    bloqueaSiIncompleto: true,
  },
  {
    clave: "monedas",
    titulo: "Monedas",
    icon: "ti ti-money",
    descripcion: "Configura las monedas y métodos de pago que vas a aceptar.",
    rutaSugerida: "Configuración > Monedas",
    formRefs: ["monedasForm"],
  },
  {
    clave: "horario",
    titulo: "Horario Laboral",
    icon: "ti ti-alarm-clock",
    descripcion: "Días y horas de operación de tu empresa.",
    rutaSugerida: "Configuración > Horario Laboral",
    formRefs: ["horarioForm"],
  },
  {
    clave: "personalizacion",
    titulo: "Personalización",
    icon: "ti ti-palette",
    descripcion: "Opciones visuales, zona horaria y comportamiento del sistema.",
    rutaSugerida: "Configuración > Personalización",
    formRefs: ["personalizacionForm", "timezoneForm"],
  },
  {
    clave: "gastos",
    titulo: "Gastos Fijos",
    icon: "ti ti-receipt",
    descripcion: "Registra tus costos operativos mensuales recurrentes.",
    rutaSugerida: "Configuración > Gastos Fijos",
    formRefs: ["gastosForm"],
  },
  {
    clave: "departamentos",
    titulo: "Departamentos",
    icon: "ti ti-briefcase",
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
    icon: "ti ti-stats-up",
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
    clave: "inventario_tintas",
    titulo: "Inventario de Tintas",
    icon: "ti ti-ink-pen",
    descripcion: "Registra el stock inicial de cada tinta (color y tecnología) que usarán tus impresoras -- sin esto no podrás recargarlas en el siguiente paso.",
    rutaSugerida: "Inventario > Gestión",
  },
  {
    clave: "tintas",
    titulo: "Recarga de tintas",
    icon: "ti ti-spray",
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
    icon: "ti ti-comments",
    descripcion: "Escanea el código QR para conectar tu número de WhatsApp y decide si el bot responde automáticamente.",
    rutaSugerida: "WhatsApp > Conexión",
  },
];

export default {
  name: "OperativaWizard",
  mixins: [institucionalWizardData],
  components: {
    FormWizard,
    TabContent,
    PasoCabecera,
    ConfigAdminForm,
    ConfigEmpresaForm,
    ConfigMonedasForm,
    ConfigHorarioForm,
    ConfigPersonalizacionForm,
    ConfigTimezoneForm,
    ConfigGastosForm,
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
    mostrarBotonOmitirTodo(activeTabIndex) {
      // Visible desde el 2º paso real en adelante (tab 2 = "empleados"), no en
      // la Bienvenida ni durante el primer paso ("departamentos").
      return activeTabIndex >= 2 && activeTabIndex <= this.pasos.length;
    },
    async avanzar(props) {
      const paso = this.obtenerPasoPorTab(props.activeTabIndex);
      if (paso && !paso.noAplica) {
        // Pasos institucionales: intenta guardar de verdad con el formulario
        // real (mismo save() que usa el wizard viejo). Si falla la
        // validación (campos vacíos/inválidos), el propio formulario ya
        // avisa con su alerta. La mayoría de estos pasos tienen un valor por
        // defecto razonable (país, horario, personalización) y dejan
        // avanzar igual -- pero "admin" y "empresa" no tienen ningún
        // default válido (no existe un "nombre de empresa" genérico), así
        // que esos dos sí bloquean el avance hasta completarse.
        if (paso.formRefs) {
          for (const refName of paso.formRefs) {
            const formInstance = this.$refs[refName];
            if (formInstance && typeof formInstance.save === "function") {
              const guardado = await formInstance.save();
              if (!guardado && paso.bloqueaSiIncompleto) {
                return;
              }
            }
          }
        }
        if (!paso.revisado) {
          const ok = await this.marcarRevisado(paso.clave);
          if (!ok) return;
        }
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

/* El wizard institucional viejo tiene pocos pasos y cabe en el ancho
   normal de Bootstrap; este, con 18 pasos, necesita más espacio horizontal
   para que quepan la mayor cantidad posible de círculos en una sola fila
   antes de pasar a una segunda línea. */
.wizard-operativo-inner {
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}

/* Achica un poco los círculos y sus etiquetas para que quepan más por
   fila sin verse amontonados. */
.wizard-operativo-inner .wizard-icon-circle {
  width: 50px;
  height: 50px;
}
.wizard-operativo-inner .wizard-icon-circle .wizard-icon {
  /* El proyecto tiene una regla global "body * { font-size: 99% !important }"
     que gana por !important sin importar la especificidad -- hay que
     igualarla para que el tamaño del ícono realmente se aplique. */
  font-size: 32px !important;
}
.wizard-operativo-inner .stepTitle {
  font-size: 12px;
}

/* Cuando los pasos no caben en una sola fila, la librería los centra por
   defecto -- eso hace que la fila de abajo se vea como un bloque aparte
   en vez de continuación de la fila de arriba. El <ul> de pasos no ocupa
   el 100% del ancho disponible por defecto (se ajusta a su contenido),
   así que aunque se le ponga justify-content:flex-start, el <ul> completo
   queda centrado como bloque dentro de .wizard-navigation -- forzar el
   ancho completo es lo que realmente hace que la alineación a la
   izquierda tenga efecto. */
.wizard-operativo-inner .wizard-navigation {
  width: 100% !important;
  justify-content: flex-start !important;
}
.wizard-operativo-inner .wizard-nav-pills {
  width: 100% !important;
  flex: 1 1 100% !important;
  justify-content: flex-start !important;
  text-align: left !important;
}
/* Ancho fijo por paso: si cada <li> se dimensiona a su propio contenido
   (flex: 0 0 auto), el ancho varía según el largo del título ("Datos del
   Administrador" vs "Monedas"), y al envolver en varias filas cada fila
   termina con una distribución de espacio distinta -- se ve desordenado
   y los pasos de una fila no quedan alineados con los de la fila de
   arriba. Con un ancho fijo igual para todos, flex-wrap arma una
   cuadrícula real: la misma cantidad de pasos por fila y cada columna
   alineada verticalmente entre filas. */
.wizard-operativo-inner .wizard-nav-pills > li {
  text-align: center;
  flex: 0 0 120px;
  width: 120px;
}
</style>
