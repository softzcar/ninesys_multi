<template>
  <div class="wasim-inspector">
    <div v-if="!turn" class="text-muted small p-3">
      Envía un mensaje (o haz clic en una respuesta del bot) para ver qué pasó por dentro en ese turno.
    </div>

    <b-tabs v-else small content-class="wasim-tab-body" class="h-100 d-flex flex-column">
      <!-- ── Turno ─────────────────────────────────────────────────────── -->
      <b-tab title="Turno" active>
        <div class="wasim-kv">
          <div><span>Mensaje del cliente</span><strong>{{ turn.userText }}</strong></div>
          <div><span>Camino</span><strong>{{ pathLabel }}</strong></div>
          <div v-if="trace.customer">
            <span>Simulando como</span>
            <strong>{{ trace.customer.nombre || 'teléfono sin registrar' }} <small v-if="trace.customer.phone">({{ trace.customer.phone }})</small></strong>
          </div>
          <template v-if="ai.effective">
            <div>
              <span>Configuración usada</span>
              <strong>
                {{ sourceLabel }}
                <small v-if="ai.agent">— agente «{{ ai.agent.name }}»</small>
              </strong>
            </div>
            <div><span>Modelo</span><strong>{{ ai.effective.model }} · temp {{ ai.effective.temperature }} · máx {{ ai.effective.maxTokens }} tokens</strong></div>
          </template>
          <div v-if="ai.aiEnabled === false">
            <span>IA del tenant</span>
            <strong class="text-warning">APAGADA en producción (el simulador responde igual)</strong>
          </div>
          <div v-if="trace.handoffIntent"><span>Intención de handoff</span><strong>{{ trace.handoffIntent }}</strong></div>
          <div v-if="ai.usageMetadata">
            <span>Tokens</span>
            <strong>{{ ai.usageMetadata.promptTokenCount || 0 }} entrada · {{ ai.usageMetadata.candidatesTokenCount || 0 }} salida</strong>
          </div>
          <div v-if="ai.costUsd != null"><span>Costo Gemini</span><strong>${{ Number(ai.costUsd).toFixed(5) }}</strong></div>
          <div v-if="ai.error"><span>Error</span><strong class="text-danger">{{ ai.error }}</strong></div>
        </div>

        <h6 class="wasim-h">Tiempos</h6>
        <div class="wasim-kv">
          <div v-for="(ms, k) in timings" :key="k"><span>{{ k }}</span><strong>{{ ms }} ms</strong></div>
        </div>

        <h6 class="wasim-h">Lo que haría producción</h6>
        <div v-if="!turn.actions || !turn.actions.length" class="text-muted small">Solo enviar el texto mostrado.</div>
        <div v-for="(a, i) in turn.actions || []" :key="i" class="wasim-action">
          <b-badge variant="info">{{ a.type }}</b-badge>
          <pre v-if="actionDetail(a)" class="wasim-pre">{{ actionDetail(a) }}</pre>
        </div>
      </b-tab>

      <!-- ── Prompt ────────────────────────────────────────────────────── -->
      <b-tab title="Prompt" :disabled="!ai.systemInstruction">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <small class="text-muted">{{ (ai.systemInstruction || '').length.toLocaleString() }} caracteres en total</small>
          <b-button size="sm" variant="outline-secondary" @click="copy(ai.systemInstruction)">
            <b-icon icon="clipboard" /> Copiar completo
          </b-button>
        </div>
        <div v-for="part in promptParts" :key="part.key" class="wasim-part">
          <div class="wasim-part-title" @click="toggle(part.key)">
            <b-icon :icon="open[part.key] ? 'chevron-down' : 'chevron-right'" />
            {{ part.label }}
            <small class="text-muted">· {{ part.text.length.toLocaleString() }} car.</small>
            <b-badge v-if="part.source" variant="light" class="ml-1">{{ part.source }}</b-badge>
          </div>
          <pre v-show="open[part.key]" class="wasim-pre">{{ part.text || '(vacío)' }}</pre>
        </div>
      </b-tab>

      <!-- ── Clasificadores ────────────────────────────────────────────── -->
      <b-tab title="Clasificadores">
        <h6 class="wasim-h mt-0">Handoff (¿pide humano / está frustrado?)</h6>
        <p class="mb-2"><b-badge :variant="trace.handoffIntent === 'none' ? 'secondary' : 'warning'">{{ trace.handoffIntent || '—' }}</b-badge></p>
        <h6 class="wasim-h">Intención del mensaje (contextEnricher)</h6>
        <pre v-if="ai.enrich && ai.enrich.classification" class="wasim-pre">{{ pretty(ai.enrich.classification) }}</pre>
        <div v-else class="text-muted small">Sin clasificación en este turno.</div>
        <div v-if="ai.enrich" class="small text-muted">
          Secciones de contexto inyectadas: {{ ai.enrich.sectionsCount != null ? ai.enrich.sectionsCount : 0 }}
        </div>
      </b-tab>

      <!-- ── Gemini ────────────────────────────────────────────────────── -->
      <b-tab title="Gemini">
        <h6 class="wasim-h mt-0">Texto crudo del modelo</h6>
        <pre class="wasim-pre">{{ (trace.plan && trace.plan.rawText) || ai.rawText || '(vacío)' }}</pre>
        <h6 class="wasim-h">Texto final al cliente</h6>
        <pre class="wasim-pre">{{ (trace.plan && trace.plan.textToSend) || '(no se envía texto)' }}</pre>
        <h6 class="wasim-h">Llamadas a funciones</h6>
        <pre v-if="ai.functionCalls && ai.functionCalls.length" class="wasim-pre">{{ pretty(ai.functionCalls) }}</pre>
        <div v-else class="text-muted small">Ninguna.</div>
        <template v-if="trace.plan">
          <h6 class="wasim-h">Interpretación</h6>
          <div class="wasim-kv">
            <div><span>Resultado</span><strong>{{ trace.plan.kind }}</strong></div>
            <div v-if="trace.plan.gallerySource"><span>Galería por</span><strong>{{ trace.plan.gallerySource }}</strong></div>
            <div v-if="trace.plan.invalidGalleryUrl"><span>URL descartada</span><strong class="text-danger">{{ trace.plan.invalidGalleryUrl }}</strong></div>
            <div v-if="trace.plan.stateOps.length"><span>Cambios de estado</span><strong>{{ trace.plan.stateOps.join(', ') }}</strong></div>
            <div v-if="ai.finishReason"><span>finishReason</span><strong>{{ ai.finishReason }}</strong></div>
          </div>
          <pre v-if="trace.plan.notes.length" class="wasim-pre">{{ trace.plan.notes.join('\n') }}</pre>
        </template>
      </b-tab>

      <!-- ── Historial ─────────────────────────────────────────────────── -->
      <b-tab title="Historial" :disabled="!ai.contents">
        <small class="text-muted d-block mb-2">Mensajes previos que recibió el modelo ({{ (ai.contents || []).length }}).</small>
        <div v-for="(c, i) in ai.contents || []" :key="i" class="wasim-hist" :class="c.role === 'model' ? 'is-model' : 'is-user'">
          <b>{{ c.role === 'model' ? 'bot' : 'cliente' }}:</b> {{ c.parts && c.parts[0] && c.parts[0].text }}
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
const PATH_LABELS = {
  ai: 'Respuesta de la IA',
  presupuesto_confirmation: 'Confirmación de presupuesto (sin IA)',
  subscription_command: 'Comando BAJA/ALTA (sin IA)',
}
const SOURCE_LABELS = { agent: 'Guardada (agente)', settings: 'Guardada (global)', override: 'BORRADOR' }

export default {
  name: 'WaSimInspector',
  props: {
    turn: { type: Object, default: null },
  },
  data() {
    return { open: { prompt: true, kb: false, dynamic: true, extra: true } }
  },
  computed: {
    trace() { return (this.turn && this.turn.trace) || {} },
    ai() { return this.trace.ai || {} },
    pathLabel() { return PATH_LABELS[this.trace.path] || this.trace.path || '—' },
    sourceLabel() { return SOURCE_LABELS[this.ai.settingsSource] || this.ai.settingsSource },
    timings() {
      const t = { ...(this.trace.stages || {}) }
      if (this.ai.enrichMs != null) t.enrichContext = this.ai.enrichMs
      if (this.ai.geminiMs != null) t.gemini = this.ai.geminiMs
      if (this.trace.totalMs != null) t.total = this.trace.totalMs
      return t
    },
    promptParts() {
      const p = this.ai.systemParts || {}
      const fs = (this.ai.effective && this.ai.effective.fieldSources) || {}
      const kb = p.knowledgeBase
      const kbText = !kb ? '' : (typeof kb === 'string' ? this.tryPretty(kb) : this.pretty(kb))
      return [
        { key: 'prompt', label: 'Prompt del sistema', text: p.prompt || '', source: fs.systemPrompt },
        { key: 'kb', label: 'Base de conocimiento', text: kbText, source: fs.knowledgeBase },
        { key: 'dynamic', label: 'Contexto en tiempo real (contextEnricher)', text: p.dynamic || '' },
        { key: 'extra', label: 'Contexto extra (cliente registrado / reintento)', text: p.extra || '' },
      ]
    },
  },
  methods: {
    toggle(key) { this.$set(this.open, key, !this.open[key]) },
    pretty(v) { return JSON.stringify(v, null, 2) },
    tryPretty(s) {
      try { return JSON.stringify(JSON.parse(s), null, 2) } catch (_) { return s }
    },
    actionDetail(a) {
      const { type, ...rest } = a
      return Object.keys(rest).length ? this.pretty(rest) : ''
    },
    async copy(text) {
      try {
        await navigator.clipboard.writeText(text || '')
        this.$bvToast.toast('Copiado al portapapeles', { variant: 'success', autoHideDelay: 1500, solid: true })
      } catch (_) {
        this.$bvToast.toast('No se pudo copiar', { variant: 'warning' })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.wasim-inspector {
  height: 100%;
  min-height: 0;
  overflow: hidden;

  ::v-deep .tab-content { flex: 1; min-height: 0; overflow-y: auto; }
}

::v-deep .wasim-tab-body { padding: 0.75rem 0.25rem; }

.wasim-h {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6c757d;
  margin: 1rem 0 0.4rem;
}

.wasim-kv > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 3px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
  font-size: 0.85rem;

  span { color: #6c757d; flex-shrink: 0; }
  strong { text-align: right; font-weight: 500; word-break: break-word; }
}

.wasim-pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
  max-height: 420px;
  overflow-y: auto;
  margin-bottom: 0.5rem;
}

.wasim-action { margin-bottom: 0.5rem; }

.wasim-part { margin-bottom: 0.4rem; }

.wasim-part-title {
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 3px 0;
  user-select: none;
}

.wasim-hist {
  font-size: 0.8rem;
  padding: 4px 6px;
  border-radius: 4px;
  margin-bottom: 3px;
  white-space: pre-wrap;

  &.is-user { background: rgba(0, 128, 105, 0.08); }
  &.is-model { background: rgba(0, 0, 0, 0.04); }
}
</style>
