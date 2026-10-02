<template>
  <div class="wasim">
    <!-- Barra: con quién se simula -->
    <b-card class="mb-3 border-0 shadow-sm" body-class="py-2">
      <div class="d-flex flex-wrap align-items-center wasim-toolbar">
        <strong class="mr-2">Simular como:</strong>
        <b-form-radio-group v-model="customerMode" :options="customerModeOptions" size="sm" buttons button-variant="outline-secondary" :disabled="loading" />

        <div v-if="customerMode === 'customer'" class="wasim-search">
          <b-input-group size="sm">
            <b-form-input v-model="customerQuery" placeholder="Nombre, cédula o teléfono…" debounce="350" :disabled="loading" />
            <b-input-group-append v-if="selectedCustomer">
              <b-button variant="outline-secondary" title="Quitar" @click="clearCustomer"><b-icon icon="x" /></b-button>
            </b-input-group-append>
          </b-input-group>
          <b-list-group v-if="customerResults.length && !selectedCustomer" class="wasim-results shadow-sm">
            <b-list-group-item v-for="c in customerResults" :key="c.id" button class="py-1 small" @click="pickCustomer(c)">
              <strong>{{ c.nombre }}</strong> <span class="text-muted">#{{ c.id }} · {{ c.phone || 'sin teléfono' }}</span>
            </b-list-group-item>
          </b-list-group>
        </div>

        <b-form-input
          v-if="customerMode === 'phone'"
          v-model="phone"
          size="sm"
          class="wasim-phone"
          placeholder="Ej. 584141234567"
          :disabled="loading"
        />

        <small class="text-muted ml-auto">
          Nada se envía por WhatsApp ni se guarda en conversaciones · costo aparte como «gemini_sandbox»
        </small>
      </div>
      <b-alert v-if="customerChangedMidChat" show variant="warning" class="mt-2 mb-0 py-1 small">
        Cambiaste el cliente con la conversación en curso. Reinicia para que el bot lo vea desde el principio.
      </b-alert>
    </b-card>

    <b-alert v-if="loadError" show variant="danger">{{ loadError }}</b-alert>

    <b-row ref="panes">
      <b-col lg="6" class="mb-3">
        <div class="wasim-pane" :style="chatPaneStyle">
          <WaSimChat
            :turns="turns"
            :loading="loading"
            :selected-index="selectedIndex"
            :customer-label="customerLabel"
            @send="send"
            @select="selectedIndex = $event"
            @reset="reset"
            @export="exportJson"
          />
        </div>
      </b-col>
      <b-col lg="6" class="mb-3">
        <b-card class="wasim-pane border-0 shadow-sm" no-body :style="rightPaneStyle">
          <b-tabs card small class="wasim-right" content-class="wasim-right-body">
            <b-tab active>
              <template #title>
                <b-icon icon="search" /> Inspector
                <small v-if="selectedTurn" class="text-muted">· turno {{ selectedIndex + 1 }}</small>
              </template>
              <WaSimInspector :turn="selectedTurn" />
            </b-tab>
            <b-tab>
              <template #title>
                <b-icon icon="pencil-square" /> Prompt y conocimiento
                <b-badge v-if="draft" variant="warning" class="ml-1">borrador</b-badge>
              </template>
              <WaSimDraftEditor
                :agents="agents"
                :settings="settings"
                :models="models"
                @draft="draft = $event"
                @agent="agentId = $event"
                @saved="loadConfig"
              />
            </b-tab>
          </b-tabs>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import WaSimChat from './WaSimChat.vue'
import WaSimInspector from './WaSimInspector.vue'
import WaSimDraftEditor from './WaSimDraftEditor.vue'

const REQUEST_TIMEOUT_MS = 90000
const MAX_STORED_TURNS = 20

export default {
  name: 'WaSimulador',
  components: { WaSimChat, WaSimInspector, WaSimDraftEditor },
  data() {
    return {
      sessionId: null,
      history: [],
      convState: {},
      turns: [],
      selectedIndex: -1,
      loading: false,
      loadError: null,
      // configuración
      agents: [],
      settings: null,
      models: ['gemini-2.5-flash'],
      draft: null,
      agentId: null,
      // cliente simulado
      customerMode: 'anonymous',
      customerModeOptions: [
        { value: 'anonymous', text: 'Anónimo' },
        { value: 'customer', text: 'Cliente registrado' },
        { value: 'phone', text: 'Teléfono' },
      ],
      customerQuery: '',
      customerResults: [],
      selectedCustomer: null,
      phone: '',
      customerAtStart: null,
      // alto disponible para los paneles (desde su borde superior hasta el final de la ventana)
      paneHeight: null,
      isWide: true,
    }
  },
  computed: {
    ...mapState('login', ['idEmpresa', 'dataUser']),
    storageKey() {
      const user = (this.dataUser && (this.dataUser.id_empleado || this.dataUser.id_usuario)) || 'x'
      return `wa-sim:${this.idEmpresa}:${user}`
    },
    selectedTurn() {
      return this.turns[this.selectedIndex] || null
    },
    asCustomer() {
      if (this.customerMode === 'customer' && this.selectedCustomer) return { customerId: this.selectedCustomer.id }
      const digits = this.phone.replace(/\D/g, '')
      if (this.customerMode === 'phone' && digits.length >= 7) return { phone: digits }
      return null
    },
    customerLabel() {
      if (this.customerMode === 'customer' && this.selectedCustomer) return this.selectedCustomer.nombre
      if (this.customerMode === 'phone' && this.asCustomer) return `+${this.asCustomer.phone}`
      return 'Cliente anónimo'
    },
    chatPaneStyle() {
      return this.paneHeight ? { height: `${this.paneHeight}px` } : {}
    },
    // En pantallas angostas los paneles se apilan: el inspector va debajo con alto propio.
    rightPaneStyle() {
      return this.paneHeight && this.isWide ? { height: `${this.paneHeight}px` } : {}
    },
    customerChangedMidChat() {
      return this.turns.length > 0 && JSON.stringify(this.asCustomer) !== JSON.stringify(this.customerAtStart)
    },
  },
  watch: {
    // Lo que aparece/desaparece encima de los paneles cambia el espacio disponible.
    customerChangedMidChat() { this.$nextTick(this.fitPanes) },
    loadError() { this.$nextTick(this.fitPanes) },
    async customerQuery(q) {
      if (this.selectedCustomer && q === this.selectedCustomer.nombre) return
      this.selectedCustomer = null
      if (!q || q.trim().length < 2) { this.customerResults = []; return }
      try {
        const { data } = await this.$wsApi.get(`/ai/sandbox/${this.idEmpresa}/customers`, { params: { q } })
        this.customerResults = data || []
      } catch (_) {
        this.customerResults = []
      }
    },
  },
  mounted() {
    this.restore()
    this.loadConfig()
    window.addEventListener('resize', this.fitPanes)
    this.$nextTick(this.fitPanes)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.fitPanes)
  },
  methods: {
    // Ajusta el alto de los paneles al espacio visible para que el cuadro de
    // texto del chat quede siempre a la vista sin hacer scroll de la página.
    fitPanes() {
      const row = this.$refs.panes && this.$refs.panes.$el
      if (!row) return
      const top = row.getBoundingClientRect().top + window.scrollY
      const BOTTOM_GAP = 16 // margen inferior (mb-3)
      this.isWide = window.innerWidth >= 992
      this.paneHeight = Math.max(360, Math.floor(window.innerHeight - top - BOTTOM_GAP))
    },

    async loadConfig() {
      this.loadError = null
      try {
        const [meta, agents, settings] = await Promise.all([
          this.$wsApi.get(`/ai/sandbox/${this.idEmpresa}/meta`),
          this.$wsApi.get(`/ai/agents/${this.idEmpresa}`).catch(() => ({ data: [] })),
          this.$wsApi.get(`/ai/settings/${this.idEmpresa}`),
        ])
        this.models = meta.data.models || this.models
        this.agents = agents.data || []
        this.settings = settings.data || null
      } catch (e) {
        const status = e.response && e.response.status
        this.loadError = status === 403
          ? 'No tienes permiso para usar el simulador (requiere el módulo de Administración).'
          : 'No se pudo cargar la configuración del bot: ' + ((e.response && e.response.data && e.response.data.message) || e.message)
      }
    },

    async send(text) {
      if (!this.turns.length) this.customerAtStart = this.asCustomer
      this.loading = true
      try {
        const { data } = await this.$wsApi.post(`/ai/sandbox/${this.idEmpresa}/message`, {
          sessionId: this.sessionId,
          text,
          history: this.history,
          state: this.convState,
          agentId: this.agentId,
          draft: this.draft,
          asCustomer: this.asCustomer,
        }, { timeout: REQUEST_TIMEOUT_MS })
        this.sessionId = data.sessionId
        this.history = data.history
        this.convState = data.state
        this.turns.push({ ...data.turn, draftUsed: !!this.draft })
      } catch (e) {
        const msg = (e.response && e.response.data && e.response.data.message) ||
          (e.code === 'ECONNABORTED' ? 'El bot tardó demasiado en responder.' : e.message)
        // El turno fallido no entra al historial: se puede reintentar.
        this.turns.push({ at: new Date().toISOString(), userText: text, messages: [], actions: [], error: msg })
      } finally {
        this.loading = false
        this.selectedIndex = this.turns.length - 1
        this.persist()
      }
    },

    async reset() {
      if (this.turns.length) {
        const ok = await this.$bvModal.msgBoxConfirm('Se borrará la conversación de prueba actual.', {
          title: 'Reiniciar simulación', okTitle: 'Reiniciar', cancelTitle: 'Cancelar', okVariant: 'danger',
        }).catch(() => false)
        if (!ok) return
      }
      if (this.sessionId) {
        await this.$wsApi.post(`/ai/sandbox/${this.idEmpresa}/reset`, { sessionId: this.sessionId }).catch(() => {})
      }
      this.sessionId = null
      this.history = []
      this.convState = {}
      this.turns = []
      this.selectedIndex = -1
      this.customerAtStart = this.asCustomer
      this.persist()
    },

    pickCustomer(c) {
      this.selectedCustomer = c
      this.customerQuery = c.nombre
      this.customerResults = []
    },
    clearCustomer() {
      this.selectedCustomer = null
      this.customerQuery = ''
    },

    exportJson() {
      const payload = {
        exportedAt: new Date().toISOString(),
        idEmpresa: this.idEmpresa,
        agentId: this.agentId,
        asCustomer: this.asCustomer,
        draft: this.draft,
        transcript: this.transcript(),
        turns: this.turns,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `simulacion-bot-${this.idEmpresa}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    },
    transcript() {
      const lines = []
      for (const t of this.turns) {
        lines.push(`CLIENTE: ${t.userText}`)
        if (t.error) lines.push(`  [error: ${t.error}]`)
        for (const m of t.messages || []) lines.push(`BOT: ${m.type === 'image' ? `[imagen] ${m.body}` : m.body}`)
        for (const a of t.actions || []) lines.push(`  [acción: ${a.type}${a.reason ? ` ${a.reason}` : ''}]`)
      }
      return lines.join('\n')
    },

    // ── Persistencia local (solo comodidad del usuario; puede no existir) ──
    persist() {
      const data = {
        sessionId: this.sessionId,
        history: this.history,
        convState: this.convState,
        turns: this.turns.slice(-MAX_STORED_TURNS),
        customerAtStart: this.customerAtStart,
      }
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data))
      } catch (_) {
        // Sin espacio (trazas grandes): guardar sin trazas.
        try {
          data.turns = data.turns.map(({ trace, ...rest }) => rest)
          localStorage.setItem(this.storageKey, JSON.stringify(data))
        } catch (__) { /* sin almacenamiento disponible */ }
      }
    },
    restore() {
      try {
        const raw = localStorage.getItem(this.storageKey)
        if (!raw) return
        const data = JSON.parse(raw)
        this.sessionId = data.sessionId || null
        this.history = data.history || []
        this.convState = data.convState || {}
        this.turns = data.turns || []
        this.customerAtStart = data.customerAtStart || null
        this.selectedIndex = this.turns.length - 1
      } catch (_) { /* almacenamiento no disponible o corrupto */ }
    },
  },
}
</script>

<style lang="scss" scoped>
.wasim-toolbar { gap: 0.6rem; }

.wasim-search {
  position: relative;
  width: 300px;
  max-width: 100%;
}

.wasim-results {
  position: absolute;
  z-index: 20;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 260px;
  overflow-y: auto;
}

.wasim-phone { width: 180px; }

.wasim-pane {
  // El alto real lo calcula fitPanes(); esto es solo el valor inicial.
  height: 70vh;
}

.wasim-right {
  height: 100%;
  display: flex;
  flex-direction: column;

  ::v-deep .wasim-right-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  ::v-deep .tab-pane { height: 100%; }
}

</style>
