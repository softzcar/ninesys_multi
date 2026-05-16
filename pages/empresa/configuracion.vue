<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      
      <b-container class="mt-4 pb-5">
        <!-- Navegación y Título -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <b-button v-if="activeSection" variant="link" @click="activeSection = null" class="p-0 mr-2">
              <i class="ti ti-arrow-left"></i>
            </b-button>
            {{ sectionTitle }}
          </h2>
          <b-button v-if="!activeSection" variant="outline-primary" @click="activeSection = 'wizard'">
            <i class="ti ti-wand mr-1"></i> Asistente de Configuración
          </b-button>
        </div>

        <!-- Menú de Opciones (Solo si no hay sección activa) -->
        <b-row v-if="!activeSection">
          <b-col md="4" v-for="item in menuItems" :key="item.id" class="mb-4">
            <b-card 
              @click="activeSection = item.id" 
              class="h-100 text-center shadow-sm hover-card pointer"
              bg-variant="light"
            >
              <div class="display-4 mb-3 text-primary">
                <i :class="item.icon"></i>
              </div>
              <h4>{{ item.title }}</h4>
              <p class="text-muted small">{{ item.description }}</p>
            </b-card>
          </b-col>
        </b-row>

        <!-- Secciones Individuales -->
        <div v-else class="section-content">
          <b-card shadow-sm>
            <div v-if="activeSection === 'wizard'">
              <configuracion-wizard :is-full-config-mode="true" />
            </div>

            <div v-else-if="activeSection === 'admin'">
              <config-admin-form 
                :initial-data="adminData" 
                :country-codes="countryCodes" 
                @phone-blur="handlePhoneBlur"
                @saved="loadInitialData"
              />
            </div>

            <div v-else-if="activeSection === 'empresa'">
              <config-empresa-form 
                :initial-data="empresaData" 
                :country-codes="countryCodes" 
                :country-options="countryOptions"
                @phone-blur="handlePhoneBlur"
                @saved="loadInitialData"
              />
            </div>

            <div v-else-if="activeSection === 'monedas'">
              <config-monedas-form 
                :initial-data="monedasData" 
                @saved="loadInitialData"
              />
            </div>

            <div v-else-if="activeSection === 'horario'">
              <config-horario-form 
                :initial-data="horarioData" 
                @saved="loadInitialData"
              />
            </div>

            <div v-else-if="activeSection === 'personalizacion'">
              <config-personalizacion-form 
                :initial-data="personalizacionData" 
                @saved="loadInitialData"
              />
            </div>

            <div v-else-if="activeSection === 'gastos'">
              <config-gastos-form 
                :initial-data="gastosData" 
                :monedas="monedasData"
                @saved="loadInitialData"
              />
            </div>

            <div v-else-if="activeSection === 'resumen'">
              <config-resumen 
                :admin-data="adminData"
                :empresa-data="empresaData"
                :monedas-data="monedasData"
                :gastos-data="gastosData"
                :horario-data="horarioData"
                :personalizacion-data="personalizacionData"
              />
            </div>
          </b-card>
          
          <div class="mt-4">
             <b-button variant="secondary" @click="activeSection = null">
               <i class="ti ti-arrow-left mr-1"></i> Volver al Menú
             </b-button>
          </div>
        </div>
      </b-container>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import ConfiguracionWizard from '~/components/empresa/configuracionWizard.vue'
import ConfigAdminForm from '~/components/empresa/ConfigAdminForm.vue'
import ConfigEmpresaForm from '~/components/empresa/ConfigEmpresaForm.vue'
import ConfigPersonalizacionForm from '~/components/empresa/ConfigPersonalizacionForm.vue'
import ConfigHorarioForm from '~/components/empresa/ConfigHorarioForm.vue'
import ConfigGastosForm from '~/components/empresa/ConfigGastosForm.vue'
import ConfigMonedasForm from '~/components/empresa/ConfigMonedasForm.vue'
import ConfigResumen from '~/components/empresa/ConfigResumen.vue'
import phoneValidation from "~/mixins/phoneValidation.js"

export default {
  name: 'ConfiguracionEmpresa',
  components: {
    ConfiguracionWizard,
    ConfigAdminForm,
    ConfigEmpresaForm,
    ConfigPersonalizacionForm,
    ConfigHorarioForm,
    ConfigGastosForm,
    ConfigMonedasForm,
    ConfigResumen
  },
  mixins: [phoneValidation],
  data() {
    return {
      activeSection: null,
      adminData: {
        nombre: "",
        telefono: "",
        countryCode: "VE",
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
      personalizacionData: {},
      horarioData: {},
      monedasData: [],
      gastosData: [],
      menuItems: [
        { id: 'admin', title: 'Datos del Administrador', icon: 'ti ti-user', description: 'Nombre, teléfono y cambio de contraseña.' },
        { id: 'empresa', title: 'Datos de la Empresa', icon: 'ti ti-home', description: 'Información legal, dirección y contacto.' },
        { id: 'monedas', title: 'Monedas', icon: 'ti ti-money', description: 'Configure las monedas activas en el sistema.' },
        { id: 'horario', title: 'Horario Laboral', icon: 'ti ti-alarm-clock', description: 'Defina los días y horas de operación.' },
        { id: 'personalizacion', title: 'Personalización', icon: 'ti ti-palette', description: 'Opciones visuales y comportamiento del sistema.' },
        { id: 'gastos', title: 'Gastos Fijos', icon: 'ti ti-receipt', description: 'Registre sus costos operativos mensuales.' },
        { id: 'resumen', title: 'Resumen', icon: 'ti ti-check-box', description: 'Vista general de toda su configuración.' },
      ],
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
    }
  },
  computed: {
    ...mapState("login", ["access"]),
    sectionTitle() {
      if (!this.activeSection) return 'Configuración de Empresa';
      if (this.activeSection === 'wizard') return 'Asistente de Configuración';
      const item = this.menuItems.find(i => i.id === this.activeSection);
      return item ? item.title : 'Configuración';
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
  },
  methods: {
    loadInitialData() {
      const loginData = this.$store.state.login;
      const userData = loginData.dataUser;
      const companyData = loginData.dataEmpresa;
      const personalizacionData = loginData.datos_personalizacion;

      if (userData) {
        this.adminData.nombre = userData.nombre || '';
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
        if (companyData.tipos_de_monedas) this.monedasData = companyData.tipos_de_monedas;
        if (companyData.horario_laboral) this.horarioData = companyData.horario_laboral;
        if (companyData.gastos_fijos) this.gastosData = companyData.gastos_fijos;
      }

      if (personalizacionData) {
        this.personalizacionData = { ...personalizacionData };
      }
    },
    parseAndSetPhoneNumber(formType, fullNumber) {
      if (!fullNumber) return;
      const fullPhoneNumber = fullNumber.toString();
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
            return;
          }
        }
      }
    },
    handlePhoneBlur(event) {
      const { type, data } = event;
      const targetData = type === 'admin' ? this.adminData : this.empresaData;
      Object.assign(targetData, data);
      
      if (!targetData.phoneNumber) return;
      const countryCodeData = this.countryCodes.find(c => c.value === targetData.countryCode);
      const phoneCode = countryCodeData ? countryCodeData.text.match(/\+(\d+)/)[1] : '';
      const fullNumberToValidate = `+${phoneCode}${targetData.phoneNumber}`;
      
      const result = this.validateAndFormatPhone(fullNumberToValidate, targetData.countryCode);
      if (result.isValid) {
        this.parseAndSetPhoneNumber(type, result.formatted);
      }
    }
  },
  mounted() {
    this.loadInitialData();
  },
  head() {
    return {
      title: 'Configuración de Empresa - Ninesys'
    }
  }
}
</script>

<style scoped>
.hover-card:hover {
  transform: translateY(-5px);
  transition: all 0.3s ease;
  background-color: #f8f9fa !important;
  border-color: #007bff;
}
.pointer {
  cursor: pointer;
}
.section-content {
  animation: fadeIn 0.5s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>