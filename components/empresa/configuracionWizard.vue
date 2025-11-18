<template>
  <div
    class="wizard-container d-flex align-items-center justify-content-center"
    :class="{ 'full-config-mode': isFullConfigMode }"
  >
    <b-container class="mt-5">
      <h2 class="text-center mb-4">
        {{ isFullConfigMode ? 'Configuración de Empresa' : 'Asistente de Configuración de Ninesys' }}
      </h2>
      <form-wizard
        v-if="isReady"
        :title="isFullConfigMode ? 'Edita la Configuración de tu Empresa' : 'Completa la Configuración de tu Empresa'"
        :subtitle="isFullConfigMode ? 'Modifica los datos de tu empresa según sea necesario.' : 'Sigue los siguientes pasos para dejar todo listo.'"
        color="#007bff"
        @on-complete="guardarConfiguracion"
        :start-index="startIndex"
      >
        <template v-slot:footer="props">
          <div class="d-flex justify-content-between w-100">
            <div>
              <b-button @click="props.prevTab()" v-if="props.activeTabIndex > 0" variant="secondary">Anterior</b-button>
            </div>
            <div>
              <b-button @click="props.nextTab()" v-if="!props.isLastStep" variant="primary">
                {{ props.activeTabIndex === 0 ? 'Continuar' : 'Guardar y Continuar' }}
              </b-button>
              <b-button @click="guardarConfiguracion()" v-else variant="success">
                Salir
              </b-button>
            </div>
          </div>
        </template>

        <tab-content :title="getStepTitle('Bienvenida')" icon="ti ti-hand-point-right">
          <h2 class="display-4 text-center mb-4">¡Bienvenido a Ninesys!</h2>
          <p class="lead text-center">
            Hemos detectado que la configuración de tu empresa aún no está
            completa.
          </p>
          <hr class="my-4" />
          <p class="text-center">
            Este asistente te guiará paso a paso para registrar la información
            esencial y dejar tu entorno de trabajo listo para operar.
          </p>
          <p class="mt-4 text-center">
            Por favor, haz clic en <strong>Siguiente</strong> para comenzar.
          </p>
        </tab-content>

        <tab-content :title="getStepTitle('Datos del Administrador')" icon="ti ti-user" :before-change="validateAdminStep">
          <b-row class="justify-content-center">
            <b-col md="8">
              <b-form>
                <b-form-group
                  label="Nombre Completo del Administrador:"
                  label-for="admin-nombre"
                >
                  <b-form-input
                    id="admin-nombre"
                    v-model="adminData.nombre"
                    placeholder="Ingrese su nombre y apellido"
                    required
                  ></b-form-input>
                </b-form-group>

                <b-form-group
                  label="Teléfono de Contacto (WhatsApp):"
                  label-for="admin-telefono"
                >
                  <b-input-group>
                    <b-form-select
                      v-model="adminData.countryCode"
                      :options="countryCodes"
                      style="max-width: 150px"
                    ></b-form-select>
                    <b-form-input
                      id="admin-telefono"
                      v-model="adminData.phoneNumber"
                      type="number"
                      placeholder="Ej: 4141234567"
                      required
                    ></b-form-input>
                  </b-input-group>
                </b-form-group>

                <hr class="my-4" />
                <h5>Cambiar Contraseña</h5>

                <b-form-group label="Nueva Contraseña:" label-for="admin-new-password">
                  <b-input-group>
                    <b-form-input
                      id="admin-new-password"
                      v-model="adminData.newPassword"
                      :type="adminData.newPasswordType"
                      placeholder="Ingrese la nueva contraseña"
                    ></b-form-input>
                    <b-input-group-append>
                      <b-button @click="togglePasswordVisibility('new')">
                        <b-icon :icon="adminData.newPasswordType === 'password' ? 'eye-slash' : 'eye'"></b-icon>
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                  <b-form-text>
                    La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial (ej: !@#$%).
                  </b-form-text>
                </b-form-group>

                <b-form-group
                  label="Confirmar Nueva Contraseña:"
                  label-for="admin-confirm-password"
                >
                  <b-input-group>
                    <b-form-input
                      id="admin-confirm-password"
                      v-model="adminData.confirmPassword"
                      :type="adminData.confirmPasswordType"
                      placeholder="Repita la nueva contraseña"
                    ></b-form-input>
                    <b-input-group-append>
                      <b-button @click="togglePasswordVisibility('confirm')">
                        <b-icon :icon="adminData.confirmPasswordType === 'password' ? 'eye-slash' : 'eye'"></b-icon>
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-form>
            </b-col>
          </b-row>
        </tab-content>

        <tab-content :title="getStepTitle('Datos de la Empresa')" icon="ti ti-home" :before-change="validateEmpresaStep">
          <b-row class="justify-content-center">
            <b-col md="8">
              <b-form>
                <b-form-group label="Nombre de la Empresa:" label-for="empresa-nombre">
                  <b-form-input
                    id="empresa-nombre"
                    v-model="empresaData.nombre"
                    placeholder="Ingrese el nombre comercial"
                    required
                  ></b-form-input>
                </b-form-group>

                <b-form-group
                  label="Número de Registro Legal (RIF/NIT/RUT):"
                  label-for="empresa-registro"
                >
                  <b-form-input
                    id="empresa-registro"
                    v-model="empresaData.numero_registro_legal"
                    placeholder="Ingrese el identificador fiscal"
                    required
                  ></b-form-input>
                </b-form-group>

                <b-form-group label="País:" label-for="empresa-pais">
                  <b-form-select
                    id="empresa-pais"
                    v-model="empresaData.pais"
                    :options="countryOptions"
                    required
                  ></b-form-select>
                </b-form-group>

                <b-form-group label="Dirección Fiscal:" label-for="empresa-direccion">
                  <b-form-textarea
                    id="empresa-direccion"
                    v-model="empresaData.direccion"
                    placeholder="Ingrese la dirección completa"
                    rows="3"
                    required
                  ></b-form-textarea>
                </b-form-group>

                <b-form-group label="Teléfono de la Empresa:" label-for="empresa-telefono">
                  <b-input-group>
                    <b-form-select
                      v-model="empresaData.countryCode"
                      :options="countryCodes"
                      style="max-width: 150px"
                    ></b-form-select>
                    <b-form-input
                      id="empresa-telefono"
                      v-model="empresaData.phoneNumber"
                      type="number"
                      placeholder="Ej: 2121234567"
                      required
                    ></b-form-input>
                  </b-input-group>
                </b-form-group>

                <b-form-group label="Email de la Empresa:" label-for="empresa-email">
                  <b-form-input
                    id="empresa-email"
                    v-model="empresaData.email"
                    type="email"
                    placeholder="Ingrese un correo electrónico"
                    required
                  ></b-form-input>
                </b-form-group>
              </b-form>
            </b-col>
          </b-row>
        </tab-content>

        <!-- <tab-content :title="getStepTitle('Monedas')" icon="ti ti-money" :before-change="validateMonedasStep">
           <monedas-manager :initial-currencies="monedasData" @change="updateMonedas($event)" />
         </tab-content> -->

        <tab-content :title="getStepTitle('Horario Laboral')" icon="ti ti-alarm-clock" :before-change="validateHorarioStep">
           <horario-laboral-editor :initial-horario="horarioData" @change="updateHorario($event)" />
         </tab-content>

        <tab-content :title="getStepTitle('Personalización')" icon="ti ti-palette" :before-change="validatePersonalizacionStep">
           <b-row class="justify-content-center">
             <b-col md="8">
               <b-form>
                 <div
                   v-for="(item, index) in personalizacionItems"
                   :key="item.key"
                   class="mb-4"
                 >
                   <b-form-group
                     :label="item.label"
                     class="d-flex justify-content-between align-items-center"
                   >
                     <b-form-checkbox
                       v-model="personalizacionData[item.key]"
                       switch
                       size="lg"
                     ></b-form-checkbox>
                   </b-form-group>

                   <!-- Línea horizontal entre switches (excepto después del último) -->
                   <hr v-if="index < personalizacionItems.length - 1" class="my-3" />
                 </div>
               </b-form>

             </b-col>
           </b-row>
         </tab-content>

        <tab-content :title="getStepTitle('Gastos Fijos')" icon="ti ti-receipt" :before-change="validateGastosStep">
           <gastos-manager :monedas="monedasData" :initial-gastos="gastosData" @change="updateGastos($event)" />
         </tab-content>

        <tab-content :title="getStepTitle('Resumen')" icon="ti ti-check-box">
          <b-card header-tag="header">
            <template #header>
              <h4 class="mb-0">Resumen de Configuración</h4>
            </template>

            <b-row>
              <b-col md="6">
                <h5 class="mb-3">👤 Datos del Administrador</h5>
                <b-list-group flush>
                  <b-list-group-item><strong>Nombre:</strong> {{ adminData.nombre }}</b-list-group-item>
                  <b-list-group-item><strong>Teléfono:</strong> {{ adminData.telefono }}</b-list-group-item>
                </b-list-group>

                <h5 class="mt-4 mb-3">🏢 Datos de la Empresa</h5>
                <b-list-group flush>
                  <b-list-group-item><strong>Nombre:</strong> {{ empresaData.nombre }}</b-list-group-item>
                  <b-list-group-item><strong>Registro Legal:</strong> {{ empresaData.numero_registro_legal }}</b-list-group-item>
                  <b-list-group-item><strong>País:</strong> {{ empresaData.pais }}</b-list-group-item>
                  <b-list-group-item><strong>Dirección:</strong> {{ empresaData.direccion }}</b-list-group-item>
                  <b-list-group-item><strong>Teléfono:</strong> {{ empresaData.telefono }}</b-list-group-item>
                  <b-list-group-item><strong>Email:</strong> {{ empresaData.email }}</b-list-group-item>
                </b-list-group>
              </b-col>

              <b-col md="6">
                <h5 class="mb-3">💵 Monedas Activas</h5>
                <b-table small :items="monedasData" :fields="[{key: 'mondeda_nombre', label: 'Nombre'}]" striped></b-table>

                <h5 class="mt-4 mb-3">🧾 Gastos Fijos</h5>
                <b-table small :items="gastosData" :fields="['nombre', 'monto', 'moneda']" striped></b-table>
              </b-col>
            </b-row>

            <hr />

            <b-row>
              <b-col>
                <h5 class="mt-2 mb-3">⏰ Horario Laboral</h5>
                <p v-if="horarioData.diasLaborales && horarioData.diasLaborales.length > 0">
                  <strong>Días:</strong> {{ formatDiasLaborales(horarioData.diasLaborales) }} <br />
                  <strong>Mañana:</strong> de {{ decimalToTime(horarioData.horaInicioManana) }} a {{ decimalToTime(horarioData.horaFinManana) }} <br />
                  <strong>Tarde:</strong> de {{ decimalToTime(horarioData.horaInicioTarde) }} a {{ decimalToTime(horarioData.horaFinTarde) }}
                </p>
                 <p v-else>No se ha definido un horario laboral.</p>
              </b-col>
            </b-row>

             <b-row>
              <b-col>
                <h5 class="mt-2 mb-3">🎨 Personalización</h5>
                 <p>Opciones de visualización guardadas.</p>
              </b-col>
            </b-row>

          </b-card>

          <b-alert show variant="success" class="mt-4 text-center">
            <h4>¡Todo listo!</h4>
            <p class="mb-0">
              Si la información es correcta, presiona el botón "Finalizar" para
              guardar la configuración y empezar a usar la aplicación.
            </p>
          </b-alert>
        </tab-content>
      </form-wizard>

      <!-- Botón para ir a la aplicación (solo en modo configuración inicial) -->
      <div v-if="!isFullConfigMode" class="text-center mt-4">
        <button @click="goOut" class="btn btn-success">
          Ir a la Aplicación
        </button>
      </div>
    </b-container>
  </div>
</template>

<script>
import { FormWizard, TabContent } from "vue-form-wizard";
import "vue-form-wizard/dist/vue-form-wizard.min.css";
import { mapState } from "vuex";
import MonedasManager from "./MonedasManager.vue";
import HorarioLaboralEditor from "./HorarioLaboralEditor.vue";
import GastosManager from "./GastosManager.vue";

export default {
  name: "ConfiguracionWizard",
  components: {
    FormWizard,
    TabContent,
    MonedasManager,
    HorarioLaboralEditor,
    GastosManager,
  },
  props: {
    isFullConfigMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isReady: false,
      gastosData: [],
      horarioData: {},
      monedasData: [],
      adminData: {
        nombre: "",
        telefono: "",
        countryCode: "VE", // Default to Venezuela
        phoneNumber: "",
        newPassword: "",
        confirmPassword: "",
        newPasswordType: "password",
        confirmPasswordType: "password",
      },
      empresaData: {
        nombre: "",
        numero_registro_legal: "",
        direccion: "",
        telefono: "",
        countryCode: "VE",
        phoneNumber: "",
        email: "",
      },
      personalizacionData: {
        sys_mostrar_detalle_terminar_indicidual: false,
        sys_mostrar_rollo_en_empleado_corte: false,
        sys_mostrar_rollo_en_empleado_estampado: false,
        sys_mostrar_insumo_en_empleado_costura: false,
        sys_mostrar_insumo_en_empleado_limpieza: false,
        sys_mostrar_insumo_en_empleado_revision: false,
        sys_comision_de_costura: false,
      },
      countryCodes: [
        { value: 'AF', text: '+93 (Afganistán)' },
        { value: 'AL', text: '+355 (Albania)' },
        { value: 'DE', text: '+49 (Alemania)' },
        { value: 'AD', text: '+376 (Andorra)' },
        { value: 'AO', text: '+244 (Angola)' },
        { value: 'AI', text: '+1-264 (Anguila)' },
        { value: 'AQ', text: '+672 (Antártida)' },
        { value: 'AG', text: '+1-268 (Antigua y Barbuda)' },
        { value: 'SA', text: '+966 (Arabia Saudita)' },
        { value: 'DZ', text: '+213 (Argelia)' },
        { value: 'AR', text: '+54 (Argentina)' },
        { value: 'AM', text: '+374 (Armenia)' },
        { value: 'AW', text: '+297 (Aruba)' },
        { value: 'AU', text: '+61 (Australia)' },
        { value: 'AT', text: '+43 (Austria)' },
        { value: 'AZ', text: '+994 (Azerbaiyán)' },
        { value: 'BS', text: '+1-242 (Bahamas)' },
        { value: 'BH', text: '+973 (Bahrein)' },
        { value: 'BD', text: '+880 (Bangladesh)' },
        { value: 'BB', text: '+1-246 (Barbados)' },
        { value: 'BE', text: '+32 (Bélgica)' },
        { value: 'BZ', text: '+501 (Belice)' },
        { value: 'BJ', text: '+229 (Benín)' },
        { value: 'BM', text: '+1-441 (Bermudas)' },
        { value: 'BY', text: '+375 (Bielorrusia)' },
        { value: 'BO', text: '+591 (Bolivia)' },
        { value: 'BA', text: '+387 (Bosnia y Herzegovina)' },
        { value: 'BW', text: '+267 (Botsuana)' },
        { value: 'BR', text: '+55 (Brasil)' },
        { value: 'BN', text: '+673 (Brunéi)' },
        { value: 'BG', text: '+359 (Bulgaria)' },
        { value: 'BF', text: '+226 (Burkina Faso)' },
        { value: 'BI', text: '+257 (Burundi)' },
        { value: 'BT', text: '+975 (Bután)' },
        { value: 'CV', text: '+238 (Cabo Verde)' },
        { value: 'KH', text: '+855 (Camboya)' },
        { value: 'CM', text: '+237 (Camerún)' },
        { value: 'CA', text: '+1 (Canadá)' },
        { value: 'TD', text: '+235 (Chad)' },
        { value: 'CL', text: '+56 (Chile)' },
        { value: 'CN', text: '+86 (China)' },
        { value: 'CY', text: '+357 (Chipre)' },
        { value: 'VA', text: '+379 (Ciudad del Vaticano)' },
        { value: 'CO', text: '+57 (Colombia)' },
        { value: 'KM', text: '+269 (Comoras)' },
        { value: 'CG', text: '+242 (Congo)' },
        { value: 'CD', text: '+243 (Congo (Rep. Dem.))' },
        { value: 'KP', text: '+850 (Corea del Norte)' },
        { value: 'KR', text: '+82 (Corea del Sur)' },
        { value: 'CI', text: '+225 (Costa de Marfil)' },
        { value: 'CR', text: '+506 (Costa Rica)' },
        { value: 'HR', text: '+385 (Croacia)' },
        { value: 'CU', text: '+53 (Cuba)' },
        { value: 'CW', text: '+599 (Curazao)' },
        { value: 'DK', text: '+45 (Dinamarca)' },
        { value: 'DM', text: '+1-767 (Dominica)' },
        { value: 'EC', text: '+593 (Ecuador)' },
        { value: 'EG', text: '+20 (Egipto)' },
        { value: 'SV', text: '+503 (El Salvador)' },
        { value: 'AE', text: '+971 (Emiratos Árabes Unidos)' },
        { value: 'ER', text: '+291 (Eritrea)' },
        { value: 'SK', text: '+421 (Eslovaquia)' },
        { value: 'SI', text: '+386 (Eslovenia)' },
        { value: 'ES', text: '+34 (España)' },
        { value: 'US', text: '+1 (Estados Unidos)' },
        { value: 'EE', text: '+372 (Estonia)' },
        { value: 'ET', text: '+251 (Etiopía)' },
        { value: 'PH', text: '+63 (Filipinas)' },
        { value: 'FI', text: '+358 (Finlandia)' },
        { value: 'FJ', text: '+679 (Fiyi)' },
        { value: 'FR', text: '+33 (Francia)' },
        { value: 'GA', text: '+241 (Gabón)' },
        { value: 'GM', text: '+220 (Gambia)' },
        { value: 'GE', text: '+995 (Georgia)' },
        { value: 'GH', text: '+233 (Ghana)' },
        { value: 'GI', text: '+350 (Gibraltar)' },
        { value: 'GD', text: '+1-473 (Granada)' },
        { value: 'GR', text: '+30 (Grecia)' },
        { value: 'GL', text: '+299 (Groenlandia)' },
        { value: 'GP', text: '+590 (Guadalupe)' },
        { value: 'GU', text: '+1-671 (Guam)' },
        { value: 'GT', text: '+502 (Guatemala)' },
        { value: 'GF', text: '+594 (Guayana Francesa)' },
        { value: 'GG', text: '+44 (Guernsey)' },
        { value: 'GN', text: '+224 (Guinea)' },
        { value: 'GQ', text: '+240 (Guinea Ecuatorial)' },
        { value: 'GW', text: '+245 (Guinea-Bissau)' },
        { value: 'GY', text: '+592 (Guyana)' },
        { value: 'HT', text: '+509 (Haití)' },
        { value: 'HN', text: '+504 (Honduras)' },
        { value: 'HK', text: '+852 (Hong Kong)' },
        { value: 'HU', text: '+36 (Hungría)' },
        { value: 'IN', text: '+91 (India)' },
        { value: 'ID', text: '+62 (Indonesia)' },
        { value: 'IR', text: '+98 (Irán)' },
        { value: 'IQ', text: '+964 (Irak)' },
        { value: 'IE', text: '+353 (Irlanda)' },
        { value: 'IM', text: '+44 (Isla de Man)' },
        { value: 'CX', text: '+61 (Isla de Navidad)' },
        { value: 'NF', text: '+672 (Isla Norfolk)' },
        { value: 'IS', text: '+354 (Islandia)' },
        { value: 'AX', text: '+358 (Islas Åland)' },
        { value: 'KY', text: '+1-345 (Islas Caimán)' },
        { value: 'CC', text: '+61 (Islas Cocos)' },
        { value: 'CK', text: '+682 (Islas Cook)' },
        { value: 'FO', text: '+298 (Islas Feroe)' },
        { value: 'GS', text: '+ (Islas Georgias del Sur y Sandwich del Sur)' },
        { value: 'HM', text: '+ (Islas Heard y McDonald)' },
        { value: 'FK', text: '+500 (Islas Malvinas)' },
        { value: 'MP', text: '+1-670 (Islas Marianas del Norte)' },
        { value: 'MH', text: '+692 (Islas Marshall)' },
        { value: 'PN', text: '+870 (Islas Pitcairn)' },
        { value: 'SB', text: '+677 (Islas Salomón)' },
        { value: 'TC', text: '+1-649 (Islas Turcas y Caicos)' },
        { value: 'UM', text: '+1 (Islas Ultramarinas Menores de Estados Unidos)' },
        { value: 'VG', text: '+1-284 (Islas Vírgenes Británicas)' },
        { value: 'VI', text: '+1-340 (Islas Vírgenes de los Estados Unidos)' },
        { value: 'IL', text: '+972 (Israel)' },
        { value: 'IT', text: '+39 (Italia)' },
        { value: 'JM', text: '+1-876 (Jamaica)' },
        { value: 'JP', text: '+81 (Japón)' },
        { value: 'JE', text: '+44 (Jersey)' },
        { value: 'JO', text: '+962 (Jordania)' },
        { value: 'KZ', text: '+7 (Kazajistán)' },
        { value: 'KE', text: '+254 (Kenia)' },
        { value: 'KG', text: '+996 (Kirguistán)' },
        { value: 'KI', text: '+686 (Kiribati)' },
        { value: 'KW', text: '+965 (Kuwait)' },
        { value: 'LA', text: '+856 (Laos)' },
        { value: 'LS', text: '+266 (Lesoto)' },
        { value: 'LV', text: '+371 (Letonia)' },
        { value: 'LB', text: '+961 (Líbano)' },
        { value: 'LR', text: '+231 (Liberia)' },
        { value: 'LY', text: '+218 (Libia)' },
        { value: 'LI', text: '+423 (Liechtenstein)' },
        { value: 'LT', text: '+370 (Lituania)' },
        { value: 'LU', text: '+352 (Luxemburgo)' },
        { value: 'MO', text: '+853 (Macao)' },
        { value: 'MK', text: '+389 (Macedonia del Norte)' },
        { value: 'MG', text: '+261 (Madagascar)' },
        { value: 'MY', text: '+60 (Malasia)' },
        { value: 'MW', text: '+265 (Malaui)' },
        { value: 'MV', text: '+960 (Maldivas)' },
        { value: 'ML', text: '+223 (Mali)' },
        { value: 'MT', text: '+356 (Malta)' },
        { value: 'MA', text: '+212 (Marruecos)' },
        { value: 'MQ', text: '+596 (Martinica)' },
        { value: 'MU', text: '+230 (Mauricio)' },
        { value: 'MR', text: '+222 (Mauritania)' },
        { value: 'YT', text: '+262 (Mayotte)' },
        { value: 'MX', text: '+52 (México)' },
        { value: 'FM', text: '+691 (Micronesia)' },
        { value: 'MD', text: '+373 (Moldavia)' },
        { value: 'MC', text: '+377 (Mónaco)' },
        { value: 'MN', text: '+976 (Mongolia)' },
        { value: 'ME', text: '+382 (Montenegro)' },
        { value: 'MS', text: '+1-664 (Montserrat)' },
        { value: 'MZ', text: '+258 (Mozambique)' },
        { value: 'MM', text: '+95 (Myanmar)' },
        { value: 'NA', text: '+264 (Namibia)' },
        { value: 'NR', text: '+674 (Nauru)' },
        { value: 'NP', text: '+977 (Nepal)' },
        { value: 'NI', text: '+505 (Nicaragua)' },
        { value: 'NE', text: '+227 (Níger)' },
        { value: 'NG', text: '+234 (Nigeria)' },
        { value: 'NU', text: '+683 (Niue)' },
        { value: 'NO', text: '+47 (Noruega)' },
        { value: 'NC', text: '+687 (Nueva Caledonia)' },
        { value: 'NZ', text: '+64 (Nueva Zelanda)' },
        { value: 'OM', text: '+968 (Omán)' },
        { value: 'NL', text: '+31 (Países Bajos)' },
        { value: 'PK', text: '+92 (Pakistán)' },
        { value: 'PW', text: '+680 (Palaos)' },
        { value: 'PS', text: '+970 (Palestina)' },
        { value: 'PA', text: '+507 (Panamá)' },
        { value: 'PG', text: '+675 (Papúa Nueva Guinea)' },
        { value: 'PY', text: '+595 (Paraguay)' },
        { value: 'PE', text: '+51 (Perú)' },
        { value: 'PF', text: '+689 (Polinesia Francesa)' },
        { value: 'PL', text: '+48 (Polonia)' },
        { value: 'PT', text: '+351 (Portugal)' },
        { value: 'PR', text: '+1-787,1-939 (Puerto Rico)' },
        { value: 'QA', text: '+974 (Qatar)' },
        { value: 'GB', text: '+44 (Reino Unido)' },
        { value: 'CF', text: '+236 (República Centroafricana)' },
        { value: 'CZ', text: '+420 (República Checa)' },
        { value: 'DO', text: '+1-809,1-829,1-849 (República Dominicana)' },
        { value: 'RE', text: '+262 (Reunión)' },
        { value: 'RW', text: '+250 (Ruanda)' },
        { value: 'RO', text: '+40 (Rumania)' },
        { value: 'RU', text: '+7 (Rusia)' },
        { value: 'EH', text: '+212 (Sahara Occidental)' },
        { value: 'WS', text: '+685 (Samoa)' },
        { value: 'AS', text: '+1-684 (Samoa Americana)' },
        { value: 'BL', text: '+590 (San Bartolomé)' },
        { value: 'KN', text: '+1-869 (San Cristóbal y Nieves)' },
        { value: 'SM', text: '+378 (San Marino)' },
        { value: 'MF', text: '+590 (San Martín (Francia))' },
        { value: 'PM', text: '+508 (San Pedro y Miquelón)' },
        { value: 'VC', text: '+1-784 (San Vicente y las Granadinas)' },
        { value: 'SH', text: '+290 (Santa Elena)' },
        { value: 'LC', text: '+1-758 (Santa Lucía)' },
        { value: 'ST', text: '+239 (Santo Tomé y Príncipe)' },
        { value: 'SN', text: '+221 (Senegal)' },
        { value: 'RS', text: '+381 (Serbia)' },
        { value: 'SC', text: '+248 (Seychelles)' },
        { value: 'SL', text: '+232 (Sierra Leona)' },
        { value: 'SG', text: '+65 (Singapur)' },
        { value: 'SX', text: '+1-721 (Sint Maarten)' },
        { value: 'SY', text: '+963 (Siria)' },
        { value: 'SO', text: '+252 (Somalia)' },
        { value: 'LK', text: '+94 (Sri Lanka)' },
        { value: 'SZ', text: '+268 (Suazilandia)' },
        { value: 'ZA', text: '+27 (Sudáfrica)' },
        { value: 'SD', text: '+249 (Sudán)' },
        { value: 'SS', text: '+211 (Sudán del Sur)' },
        { value: 'SE', text: '+46 (Suecia)' },
        { value: 'CH', text: '+41 (Suiza)' },
        { value: 'SR', text: '+597 (Surinam)' },
        { value: 'SJ', text: '+47 (Svalbard y Jan Mayen)' },
        { value: 'TH', text: '+66 (Tailandia)' },
        { value: 'TW', text: '+886 (Taiwán)' },
        { value: 'TZ', text: '+255 (Tanzania)' },
        { value: 'TJ', text: '+992 (Tayikistán)' },
        { value: 'IO', text: '+246 (Territorio Británico del Océano Índico)' },
        { value: 'TF', text: '+ (Territorios Australes Franceses)' },
        { value: 'TL', text: '+670 (Timor Oriental)' },
        { value: 'TG', text: '+228 (Togo)' },
        { value: 'TK', text: '+690 (Tokelau)' },
        { value: 'TO', text: '+676 (Tonga)' },
        { value: 'TT', text: '+1-868 (Trinidad y Tobago)' },
        { value: 'TN', text: '+216 (Túnez)' },
        { value: 'TM', text: '+993 (Turkmenistán)' },
        { value: 'TR', text: '+90 (Turquía)' },
        { value: 'TV', text: '+688 (Tuvalu)' },
        { value: 'UA', text: '+380 (Ucrania)' },
        { value: 'UG', text: '+256 (Uganda)' },
        { value: 'UY', text: '+598 (Uruguay)' },
        { value: 'UZ', text: '+998 (Uzbekistán)' },
        { value: 'VU', text: '+678 (Vanuatu)' },
        { value: 'VE', text: '+58 (Venezuela)' },
        { value: 'VN', text: '+84 (Vietnam)' },
        { value: 'WF', text: '+681 (Wallis y Futuna)' },
        { value: 'YE', text: '+967 (Yemen)' },
        { value: 'DJ', text: '+253 (Yibuti)' },
        { value: 'ZM', text: '+260 (Zambia)' },
        { value: 'ZW', text: '+263 (Zimbabue)' },
      ],
    };
  },
  computed: {
    ...mapState("login", ["configuracionFaltante"]),
    personalizacionItems() {
      return Object.keys(this.personalizacionData).map(key => ({
        key,
        value: this.personalizacionData[key],
        label: this.formatSwitchLabel(key)
      }));
    },
    startIndex() {
      if (!this.configuracionFaltante || this.configuracionFaltante.length === 0) {
        return 0; // Empezar en el primer paso si no hay errores
      }
      const errorMap = {
        "Teléfono del usuario": 1,
        "Número de registro legal de la empresa": 2,
        "Teléfono de la empresa": 2,
        "Horario laboral": 4,
      };
      const stepIndexes = this.configuracionFaltante
        .map(error => {
            const foundKey = Object.keys(errorMap).find(key => error.trim().startsWith(key));
            return foundKey ? errorMap[foundKey] : -1;
        })
        .filter(index => index !== -1);

      if (stepIndexes.length > 0) {
        return Math.min(...stepIndexes);
      }
      return 0;
    },
    catagoriesSelect() {
      return this.$store.state.comerce.dataCategories.map((el) => ({
        value: el.id,
        text: el.name,
      }));
    },
    countryOptions() {
      const countries = this.countryCodes.map(country => {
        const codeMatch = country.text.match(/\+(\d+)/);
        const code = codeMatch ? codeMatch[1] : country.value;
        const nameMatch = country.text.match(/\(([^)]+)\)/);
        const name = nameMatch ? nameMatch[1] : country.value;
        return { value: code, text: name };
      });
      countries.sort((a, b) => a.text.localeCompare(b.text));
      return [{ value: null, text: "Seleccione un país" }, ...countries];
    },
    startIndex() {
      if (!this.configuracionFaltante || this.configuracionFaltante.length === 0) {
        return 0; // Empezar en el primer paso si no hay errores
      }

      // Mapeo de los mensajes de error de la API a los índices de las pestañas
      const errorMap = {
        "Teléfono del usuario": 1,
        "Número de registro legal de la empresa": 2,
        "Teléfono de la empresa": 2,
        "Dirección de la empresa (en empresas)": 2,
        // Añadir más mapeos aquí a medida que se definan los errores
        "Horario laboral": 4,
      };

      const stepIndexes = this.configuracionFaltante
        .map(error => {
            // Buscar una subcadena del error en las llaves del mapa
            const foundKey = Object.keys(errorMap).find(key => error.includes(key));
            return foundKey ? errorMap[foundKey] : -1;
        })
        .filter(index => index !== -1);

      if (stepIndexes.length > 0) {
        return Math.min(...stepIndexes); // Devuelve el índice más bajo encontrado
      }

      return 0; // Fallback por si ningún error coincide
    }
  },
  methods: {
    getIconForStep(title) {
      const icons = {
        Bienvenida: "ti ti-hand-point-right",
        "Datos del Administrador": "ti ti-user",
        "Datos de la Empresa": "ti ti-home",
        Monedas: "ti ti-money",
        "Horario Laboral": "ti ti-alarm-clock",
        Personalización: "ti ti-palette",
        "Gastos Fijos": "ti ti-receipt",
        Resumen: "ti ti-check-box",
      };
      return icons[title] || "ti-help"; // Devuelve un icono de ayuda por defecto
    },

    stepHasError(title) {
      if (!this.configuracionFaltante || this.configuracionFaltante.length === 0) {
        return false;
      }
      const errorMap = {
        "Teléfono del usuario": "Datos del Administrador",
        "Número de registro legal de la empresa": "Datos de la Empresa",
        "Teléfono de la empresa": "Datos de la Empresa",
        "Dirección de la empresa (en empresas)": "Datos de la Empresa",
        "Horario laboral": "Horario Laboral",
      };

      return this.configuracionFaltante.some(error => errorMap[error] === title);
    },

    getStepTitle(baseTitle) {
      if (this.stepHasError(baseTitle)) {
        return `${baseTitle} 🔴`;
      }
      return baseTitle;
    },

    updateMonedas(newMonedas) {
      this.monedasData = newMonedas;
    },

    updateHorario(newHorario) {
      this.horarioData = newHorario;
    },

    updateGastos(newGastos) {
      this.gastosData = newGastos;
    },

    // --- Métodos para el Resumen ---
    decimalToTime(decimal) {
      if (decimal === null || decimal === undefined) return "00:00";
      const hours = Math.floor(decimal);
      const minutes = Math.round((decimal % 1) * 60);
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    },

    formatDiasLaborales(dias) {
      const diaMap = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' };
      return dias.map(d => diaMap[d]).join(', ');
    },

    formatSwitchLabel(key) {
      const labelMap = {
        'sys_mostrar_detalle_terminar_indicidual': 'Muestra el formulario de ingresar detalle de la terminación del item individual en el módulo de empleados al momento de terminar una tarea individual',
        'sys_comision_de_costura': 'Define si a costura se le calcula comisión por el porcentaje en la tabla empleados o el porcentaje en la tabla productos'
      };

      if (labelMap[key]) {
        return labelMap[key];
      }

      let text = key.replace(/_/g, " ").replace("sys ", "");
      return text.charAt(0).toUpperCase() + text.slice(1);
    },

    parseAndSetPhoneNumber(formType, fullNumber) {
      if (!fullNumber) return;
      const fullPhoneNumber = fullNumber.toString();

      // Ordenar los códigos de país por la longitud del código de marcación, de mayor a menor
      // para asegurar que se encuentre la coincidencia más específica primero (ej: +441 vs +44)
      const sortedCountryCodes = [...this.countryCodes].sort((a, b) => {
        const codeA = (a.text.match(/\+(\d+)/) || ['', ''])[1];
        const codeB = (b.text.match(/\+(\d+)/) || ['', ''])[1];
        return codeB.length - codeA.length;
      });

      for (const country of sortedCountryCodes) {
        const match = country.text.match(/\+(\d+)/);
        if (match) {
          const dialingCode = match[1];
          if (fullPhoneNumber.startsWith(dialingCode)) {
            const targetData = formType === 'admin' ? this.adminData : this.empresaData;
            targetData.countryCode = country.value;
            targetData.phoneNumber = fullPhoneNumber.substring(dialingCode.length);
            return; // Salir después de encontrar la primera y más larga coincidencia
          }
        }
      }
    },

    async validateAdminStep() {
      const errors = [];
      const data = this.adminData;

      // 1. Validar Nombre
      if (!data.nombre.trim()) errors.push("El nombre completo es obligatorio.");

      // 2. Validar Teléfono
      const phoneRegex = /^\d{7,15}$/;
      if (!data.phoneNumber.trim()) {
        errors.push("El número de teléfono es obligatorio.");
      } else if (!phoneRegex.test(data.phoneNumber.trim())) {
        errors.push("El número de teléfono no es válido. Ingrese solo números, sin espacios ni símbolos.");
      }

      // 3. Validar Contraseña
      let passwordPayload = null; // Por defecto, null si no se cambia
      if (data.newPassword !== "" || data.confirmPassword !== "") {
        const pass = data.newPassword;
        if (pass.length < 8) errors.push("La contraseña debe tener al menos 8 caracteres.");
        if (!/[a-z]/.test(pass)) errors.push("La contraseña debe contener al menos una letra minúscula.");
        if (!/[A-Z]/.test(pass)) errors.push("La contraseña debe contener al menos una letra mayúscula.");
        if (!/\d/.test(pass)) errors.push("La contraseña debe contener al menos un número.");
        if (!/[!@#$%^&*]/.test(pass)) errors.push("La contraseña debe contener al menos un carácter especial (ej: !@#$%).");
        if (pass !== data.confirmPassword) errors.push("Las contraseñas no coinciden.");
        
        // Si no hay errores de formato, preparamos la contraseña para el envío
        if (errors.filter(e => e.includes("contraseña") || e.includes("contraseñas")).length === 0) {
          passwordPayload = pass;
        }
      }

      // 4. Manejar el resultado de la validación
      if (errors.length > 0) {
        this.$fire({
          title: "Datos Incompletos o Inválidos",
          html: `<div class="text-left"><ul>${errors.map((e) => `<li>${e}</li>`).join("")}</ul></div>`,
          type: "warning",
        });
        return false; // Bloquear el avance
      }

      // 5. Si la validación es exitosa, guardar datos en la API
      this.overlay = true;
      try {
        const countryCodeData = this.countryCodes.find(c => c.value === data.countryCode);
        const phoneCode = countryCodeData ? countryCodeData.text.match(/\+(\d+)/)[1] : '';
        const fullPhoneNumber = `${phoneCode}${data.phoneNumber}`;

        const payload = new URLSearchParams();
        payload.set("nombre", data.nombre);
        payload.set("telefono", fullPhoneNumber);
        // Enviar siempre el campo de la contraseña, será null si no se cambió
        payload.set("password", passwordPayload);

        const adminUserId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/admin/${adminUserId}`, payload);

        // Si todo va bien, actualizamos la store para quitar el error y avanzamos
        this.$store.commit("login/removeConfiguracionFaltante", ["Teléfono del usuario"]);
        this.overlay = false;
        return true; // Permitir el avance
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar los datos del administrador. <p>${err.response?.data?.message || err.message}</p>`,
          type: "error",
        });
        this.overlay = false;
        return false; // Bloquear el avance
      }
    },

    togglePasswordVisibility(field) {
      if (field === 'new') {
        this.adminData.newPasswordType = this.adminData.newPasswordType === 'password' ? 'text' : 'password';
      } else if (field === 'confirm') {
        this.adminData.confirmPasswordType = this.adminData.confirmPasswordType === 'password' ? 'text' : 'password';
      }
    },

    async validateEmpresaStep() {
      console.log('validateEmpresaStep called');
      console.log('empresaData:', this.empresaData);
      const errors = [];
      const data = this.empresaData;

      if (!data.nombre.trim()) errors.push("El nombre de la empresa es obligatorio.");
      if (!data.numero_registro_legal || !String(data.numero_registro_legal).trim()) errors.push("El número de registro legal es obligatorio.");
      if (!data.pais) errors.push("Debe seleccionar un país.");
      if (!data.direccion || !data.direccion.trim()) errors.push("La dirección es obligatoria.");

      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!data.email.trim()) {
        errors.push("El email de la empresa es obligatorio.");
      } else if (!emailRegex.test(data.email.trim())) {
        errors.push("El formato del email no es válido.");
      }

      const phoneRegex = /^\d{7,15}$/;
      if (!data.phoneNumber || !String(data.phoneNumber).trim()) {
        errors.push("El número de teléfono de la empresa es obligatorio.");
      } else if (!phoneRegex.test(String(data.phoneNumber).trim())) {
        errors.push("El número de teléfono de la empresa no es válido.");
      }

      console.log('Validation errors:', errors);
      console.log('Validation errors:', errors);
      if (errors.length > 0) {
        this.$fire({
          title: "Datos Incompletos o Inválidos",
          html: `<div class="text-left"><ul>${errors.map(e => `<li>${e}</li>`).join("")}</ul></div>`,
          type: "warning",
        });
        return false;
      }
      console.log('Validation passed, proceeding to POST');
      console.log('Validation passed, proceeding to POST');

      // Enviar datos a la API
      this.overlay = true;
      try {
        const countryCodeData = this.countryCodes.find(c => c.value === data.countryCode);
        const phoneCode = countryCodeData ? countryCodeData.text.match(/\+(\d+)/)[1] : '';
        const fullPhoneNumber = `${phoneCode}${data.phoneNumber}`;

        const payload = new URLSearchParams();
        payload.set("nombre", data.nombre);
        payload.set("numero_registro_legal", data.numero_registro_legal);
        payload.set("pais", data.pais);
        payload.set("direccion", data.direccion);
        payload.set("telefono", fullPhoneNumber);
        payload.set("email", data.email);

        const employeeId = this.$store.state.login.dataUser?.id_empleado;
        console.log('employeeId:', employeeId);
        if (!employeeId) {
          this.$fire({
            title: "Error",
            html: "ID de empleado no disponible. Por favor, recarga la página.",
            type: "error",
          });
          return false;
        }
        const url = `${this.$config.API}/configuracion/empresa/${employeeId}`;
        console.log('Sending POST to', url, 'with payload', payload);
        await this.$axios.post(url, payload);
        console.log('POST success');

        const errorsToRemove = [
          "Número de registro legal de la empresa",
          "Dirección de la empresa (en empresas)",
          "Teléfono de la empresa"
        ];
        this.$store.commit("login/removeConfiguracionFaltante", errorsToRemove);

        this.overlay = false;
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar los datos de la empresa. <p>${err.response?.data?.message || err.message}</p>`,
          type: "error",
        });
        this.overlay = false;
        return false;
      }
    },

    async validateMonedasStep() {
      if (!this.monedasData || this.monedasData.length === 0) {
        this.$fire({
          title: "Datos Incompletos",
          html: "Debe seleccionar al menos una moneda.",
          type: "warning",
        });
        return false;
      }

      try {
        const employeeId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/monedas`, {
          id_empleado: employeeId,
          monedas: this.monedasData
        });
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar las monedas. <p>${err.response?.data?.message || err.message}</p>`,
          type: "error",
        });
        return false;
      }
    },

    async validateHorarioStep() {
      if (!this.horarioData || !this.horarioData.diasLaborales || this.horarioData.diasLaborales.length === 0) {
        this.$fire({
          title: "Datos Incompletos",
          html: "Debe configurar al menos un día laboral.",
          type: "warning",
        });
        return false;
      }

      try {
        const employeeId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/horario`, {
          id_empleado: employeeId,
          ...this.horarioData
        });
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudo guardar el horario laboral. <p>${err.response?.data?.message || err.message}</p>`,
          type: "error",
        });
        return false;
      }
    },

    async validatePersonalizacionStep() {
      try {
        const employeeId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/personalizacion`, {
          id_empleado: employeeId,
          personalizacion: this.personalizacionData
        });
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar las opciones de personalización. <p>${err.response?.data?.message || err.message}</p>`,
          type: "error",
        });
        return false;
      }
    },

    async validateGastosStep() {
      try {
        const employeeId = this.$store.state.login.dataUser.id_empleado;
        await this.$axios.post(`${this.$config.API}/configuracion/gastos`, {
          id_empleado: employeeId,
          gastos: this.gastosData || []
        });
        return true;
      } catch (err) {
        this.$fire({
          title: "Error al Guardar",
          html: `No se pudieron guardar los gastos fijos. <p>${err.response?.data?.message || err.message}</p>`,
          type: "error",
        });
        return false;
      }
    },

    guardarConfiguracion() {
      if (this.isFullConfigMode) {
        // En modo configuración completa, mostrar mensaje de éxito y permitir continuar
        this.$fire({
          title: "¡Configuración Actualizada!",
          html: "Los datos de tu empresa han sido guardados correctamente.",
          type: "success",
        });
        // Podríamos emitir un evento para que el componente padre sepa que se guardó
        this.$emit('configuracion-guardada');
      } else {
        // En modo configuración inicial, forzar un refresco completo de la aplicación
        window.location.reload();
      }
    },

    goOut() {
      this.$confirm(`¿Desea ir a la aplicación?`, "Ir a la Aplicación", "question")
        .then(() => {
          window.location.assign('/logout');
        })
        .catch(() => {
          return false;
        });
    },

    loadInitialData() {
      // Pre-rellenar los formularios con los datos existentes de la store
      const loginData = this.$store.state.login;
      const userData = loginData.dataUser;
      const companyData = loginData.dataEmpresa;
      const personalizacionData = loginData.datos_personalizacion;

      if (userData) {
        this.adminData.nombre = userData.nombre || '';
        // El teléfono del administrador viene en dataUser.telefono
        if (userData.telefono) {
          this.parseAndSetPhoneNumber('admin', userData.telefono);
        }
      }

      if (companyData) {
        this.empresaData.nombre = companyData.nombre || '';
        this.empresaData.numero_registro_legal = companyData.numero_registro_legal || '';
        this.empresaData.direccion = companyData.direccion || '';
        this.empresaData.email = companyData.email || '';
        this.empresaData.pais = companyData.pais || null;
        if (companyData.telefono) {
          this.parseAndSetPhoneNumber('empresa', companyData.telefono);
        }

        // Cargar datos de monedas, horario y gastos
        if (companyData.tipos_de_monedas) {
          this.monedasData = companyData.tipos_de_monedas;
        }
        if (companyData.horario_laboral) {
          this.horarioData = companyData.horario_laboral;
        }
        if (companyData.gastos_fijos) {
          this.gastosData = companyData.gastos_fijos;
        }
      }

      // Cargar datos de personalización
      if (personalizacionData) {
        const merged = {
          sys_mostrar_detalle_terminar_indicidual: false,
          ...personalizacionData
        };
        this.$set(this, 'personalizacionData', merged);
        this.$forceUpdate();
      }
    },
  }, // Fin del objeto methods

  watch: {
    configuracionFaltante: {
      handler(newValue) {
        // Si isReady ya es true, no hacemos nada más.
        if (this.isReady) return;

        // En cuanto el valor deja de ser `undefined`, significa que la store se ha inicializado.
        if (newValue !== undefined) {
          this.loadInitialData();
          this.isReady = true;
        }
      },
      immediate: true, // Es importante para la carga inicial
    },
  },


};
</script>

<style>
.wizard-nav-item.has-error .wizard-icon-container {
  position: relative;
  border-color: #dc3545; /* Opcional: colorear el borde del círculo */
}

.wizard-nav-item.has-error .wizard-icon-container::after {
  content: "";
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background-color: #dc3545; /* Rojo de Bootstrap para danger */
  border-radius: 50%;
  border: 2px solid white;
}

/* Pequeños ajustes para los iconos de Themify si se usan */
.wizard-icon-container {
  font-size: 1.5rem;
}
.wizard-container {
  min-height: 80vh;
}

/* Estilos específicos para el modo de configuración completa */
.wizard-container.full-config-mode {
  min-height: auto;
  padding: 2rem 0;
}

.wizard-container.full-config-mode .wizard-title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}
</style>
