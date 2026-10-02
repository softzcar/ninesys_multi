<template>
  <div class="wasim-draft">
    <b-alert :show="showHelp" variant="info" dismissible class="py-2 small" @dismissed="hideHelp">
      <strong>Cómo usarlo:</strong> edita el prompt o la base de conocimiento → escribe en el chat
      o pulsa <b-icon icon="arrow-repeat" /> <em>Probar de nuevo</em> para repetir la última pregunta →
      compara con la respuesta anterior → <em>Guardar</em>. Nada cambia en WhatsApp hasta que guardes.
    </b-alert>

    <b-form-group label="Agente a probar" label-size="sm" class="mb-2">
      <b-form-select v-model="target" :options="targetOptions" size="sm" />
      <small class="text-muted">{{ targetHelp }}</small>
    </b-form-group>

    <div class="d-flex justify-content-between align-items-center mb-2">
      <b-form-checkbox v-model="useDraft" switch>
        Responder con el borrador
      </b-form-checkbox>
      <b-badge v-if="isDirty" :variant="useDraft ? 'warning' : 'secondary'">
        {{ changedFields.length }} cambio(s) sin guardar
      </b-badge>
      <b-badge v-else variant="light">Igual a lo guardado</b-badge>
    </div>

    <b-row>
      <b-col cols="6">
        <b-form-group label="Modelo" label-size="sm" class="mb-2">
          <b-form-select v-model="form.model" :options="models" size="sm" />
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group label="Temp." label-size="sm" class="mb-2">
          <b-form-input v-model.number="form.temperature" type="number" min="0" max="2" step="0.05" size="sm" />
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group label="Máx. tokens" label-size="sm" class="mb-2">
          <b-form-input v-model.number="form.maxTokens" type="number" min="1" max="8192" size="sm" />
        </b-form-group>
      </b-col>
    </b-row>

    <b-form-group label-size="sm" class="mb-2">
      <template #label>
        Prompt del sistema
        <b-badge v-if="base.sources.systemPrompt === 'global'" variant="light" title="El agente no tiene prompt propio: usa el de la configuración global">heredado de global</b-badge>
      </template>
      <b-form-textarea v-model="form.systemPrompt" rows="10" max-rows="24" size="sm" class="wasim-mono" />
    </b-form-group>

    <b-form-group label-size="sm" class="mb-2">
      <template #label>
        Base de conocimiento (JSON)
        <b-badge v-if="base.sources.knowledgeBase === 'global'" variant="light" title="El agente no tiene base propia: usa la de la configuración global">heredada de global</b-badge>
      </template>
      <b-form-textarea v-model="form.knowledgeBaseText" rows="8" max-rows="24" size="sm" class="wasim-mono" :state="kbValid" />
      <b-form-invalid-feedback>El contenido debe ser un JSON válido.</b-form-invalid-feedback>
    </b-form-group>

    <div class="d-flex flex-wrap justify-content-end wasim-draft-actions">
      <b-button
        size="sm"
        variant="success"
        class="mr-auto"
        :disabled="!canRepeat"
        :title="canRepeat ? 'Repite el último mensaje del chat con la configuración actual' : 'Primero envía un mensaje en el chat'"
        @click="$emit('repeat')"
      >
        <b-icon icon="arrow-repeat" /> Probar de nuevo
      </b-button>
      <b-button size="sm" variant="outline-secondary" :disabled="!isDirty" @click="$bvModal.show(diffModalId)">
        <b-icon icon="file-diff" /> Ver cambios
      </b-button>
      <b-button size="sm" variant="outline-secondary" :disabled="!isDirty || saving" @click="discard">
        Descartar
      </b-button>
      <b-button v-if="saveAgent" size="sm" variant="info" :disabled="!isDirty || !kbOk || saving" @click="save('agent')">
        <b-spinner v-if="saving === 'agent'" small /> Guardar en agente «{{ saveAgent.name }}»
      </b-button>
      <b-button size="sm" :variant="saveAgent ? 'outline-info' : 'info'" :disabled="!isDirty || !kbOk || saving" @click="save('global')">
        <b-spinner v-if="saving === 'global'" small /> Guardar en global
      </b-button>
    </div>

    <b-modal :id="diffModalId" title="Cambios del borrador frente a lo guardado" size="xl" ok-only ok-title="Cerrar" scrollable>
      <div v-for="d in diffs" :key="d.field" class="mb-3">
        <h6>{{ d.label }}</h6>
        <pre v-if="d.lines" class="wasim-diff"><span v-for="(l, i) in d.lines" :key="i" :class="`is-${l.type}`">{{ l.type === 'add' ? '+ ' : l.type === 'del' ? '- ' : '  ' }}{{ l.text }}
</span></pre>
        <div v-else class="small"><del class="text-danger">{{ d.before }}</del> → <strong class="text-success">{{ d.after }}</strong></div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { lineDiff } from '~/utils/lineDiff'

const DEFAULT_TARGET = 'default'
const HELP_KEY = 'wa-sim:ayuda-editor'

function kbToText(kb) {
  if (!kb) return ''
  if (typeof kb === 'object') return JSON.stringify(kb, null, 2)
  try { return JSON.stringify(JSON.parse(kb), null, 2) } catch (_) { return String(kb) }
}

export default {
  name: 'WaSimDraftEditor',
  props: {
    agents: { type: Array, default: () => [] },
    settings: { type: Object, default: null },
    models: { type: Array, default: () => ['gemini-2.5-flash'] },
    canRepeat: { type: Boolean, default: false },
  },
  data() {
    return {
      target: DEFAULT_TARGET,
      useDraft: true,
      form: { systemPrompt: '', knowledgeBaseText: '', model: '', temperature: 0.3, maxTokens: 1024 },
      saving: null,
      diffModalId: 'wasim-diff-modal',
      showHelp: true,
    }
  },
  computed: {
    ...mapState('login', ['idEmpresa']),
    enabledAgents() { return this.agents.filter((a) => a.enabled) },
    defaultAgent() { return this.enabledAgents.find((a) => a.isDefault) || null },
    // Agente que realmente responde: el elegido, o el por defecto (como un chat nuevo).
    effectiveAgent() {
      if (this.target === DEFAULT_TARGET) return this.defaultAgent
      return this.enabledAgents.find((a) => a.id === this.target) || null
    },
    targetOptions() {
      const def = this.defaultAgent
      return [
        { value: DEFAULT_TARGET, text: def ? `Como un chat nuevo (agente por defecto: ${def.name})` : 'Como un chat nuevo (configuración global)' },
        ...this.enabledAgents.map((a) => ({ value: a.id, text: `${a.name}${a.isDefault ? ' (por defecto)' : ''}` })),
      ]
    },
    targetHelp() {
      return this.effectiveAgent
        ? 'Los campos vacíos del agente se completan con la configuración global.'
        : 'No hay agente por defecto activo: responde la configuración global.'
    },
    // Valores guardados efectivos (mismo fallback campo a campo que el backend).
    base() {
      const s = this.settings || {}
      const a = this.effectiveAgent
      const globalKb = s.knowledgeBase ?? s.knowledge_base ?? null
      const globalPrompt = s.systemPrompt ?? s.system_prompt ?? ''
      return {
        systemPrompt: (a && a.systemPrompt) || globalPrompt || '',
        knowledgeBaseText: kbToText((a && a.knowledgeBase) || globalKb),
        model: a ? a.model : (s.model || 'gemini-2.5-flash'),
        temperature: Number(a ? a.temperature : (s.temperature ?? 0.3)),
        maxTokens: Number(a ? a.maxTokens : (s.maxTokens ?? s.max_tokens ?? 1024)),
        sources: {
          systemPrompt: a && a.systemPrompt ? 'agent' : 'global',
          knowledgeBase: a && a.knowledgeBase ? 'agent' : 'global',
        },
      }
    },
    kbValid() {
      if (!this.form.knowledgeBaseText.trim()) return null
      try { JSON.parse(this.form.knowledgeBaseText); return true } catch (_) { return false }
    },
    kbOk() { return this.kbValid !== false },
    changedFields() {
      return ['systemPrompt', 'knowledgeBaseText', 'model', 'temperature', 'maxTokens']
        .filter((f) => String(this.form[f]) !== String(this.base[f]))
    },
    isDirty() { return this.changedFields.length > 0 },
    saveAgent() { return this.effectiveAgent },
    // Overrides que viajan al simulador (solo lo que cambió).
    draft() {
      if (!this.useDraft || !this.isDirty) return null
      const d = {}
      for (const f of this.changedFields) {
        if (f === 'knowledgeBaseText') {
          if (this.kbOk && this.form.knowledgeBaseText.trim()) d.knowledgeBase = this.form.knowledgeBaseText
        } else {
          d[f] = this.form[f]
        }
      }
      return Object.keys(d).length ? d : null
    },
    diffs() {
      const labels = { systemPrompt: 'Prompt del sistema', knowledgeBaseText: 'Base de conocimiento', model: 'Modelo', temperature: 'Temperatura', maxTokens: 'Máx. tokens' }
      return this.changedFields.map((f) => (
        f === 'systemPrompt' || f === 'knowledgeBaseText'
          ? { field: f, label: labels[f], lines: lineDiff(this.base[f], this.form[f]) }
          : { field: f, label: labels[f], before: this.base[f], after: this.form[f] }
      ))
    },
  },
  watch: {
    base: { handler() { this.resetForm() }, immediate: true },
    draft: { handler(val) { this.$emit('draft', val) }, immediate: true },
    effectiveAgent: {
      handler(a) { this.$emit('agent', this.target === DEFAULT_TARGET ? null : (a ? a.id : null)) },
      immediate: true,
    },
  },
  mounted() {
    try { this.showHelp = localStorage.getItem(HELP_KEY) !== 'oculta' } catch (_) { /* sin almacenamiento */ }
  },
  methods: {
    hideHelp() {
      this.showHelp = false
      try { localStorage.setItem(HELP_KEY, 'oculta') } catch (_) { /* sin almacenamiento */ }
    },
    resetForm() {
      this.form = {
        systemPrompt: this.base.systemPrompt,
        knowledgeBaseText: this.base.knowledgeBaseText,
        model: this.base.model,
        temperature: this.base.temperature,
        maxTokens: this.base.maxTokens,
      }
    },
    discard() { this.resetForm() },
    async save(where) {
      const label = where === 'agent' ? `el agente «${this.saveAgent.name}»` : 'la configuración GLOBAL'
      // Guardar en global un campo que el agente tiene propio no cambia sus respuestas.
      let warning = ''
      if (where === 'global' && this.saveAgent) {
        const own = this.changedFields.filter((f) => (
          f === 'systemPrompt' ? this.base.sources.systemPrompt === 'agent'
            : f === 'knowledgeBaseText' ? this.base.sources.knowledgeBase === 'agent'
              : true // modelo/temperatura/tokens siempre salen del agente
        ))
        if (own.length) {
          warning = ` OJO: el agente «${this.saveAgent.name}» tiene valor propio en ${own.length} de esos campos, así que sus respuestas no cambiarán.`
        }
      }
      const ok = await this.$bvModal.msgBoxConfirm(
        `Se guardarán ${this.changedFields.length} cambio(s) en ${label}. Desde ese momento el bot real responderá con esta configuración.${warning}`,
        { title: 'Guardar configuración del bot', okTitle: 'Guardar', cancelTitle: 'Cancelar', okVariant: 'info' }
      ).catch(() => false)
      if (!ok) return

      const kb = this.form.knowledgeBaseText.trim() ? JSON.parse(this.form.knowledgeBaseText) : null
      const changed = new Set(this.changedFields)
      this.saving = where
      try {
        if (where === 'agent') {
          const payload = {}
          if (changed.has('systemPrompt')) payload.systemPrompt = this.form.systemPrompt || null
          if (changed.has('knowledgeBaseText')) payload.knowledgeBase = kb
          if (changed.has('model')) payload.model = this.form.model
          if (changed.has('temperature')) payload.temperature = this.form.temperature
          if (changed.has('maxTokens')) payload.maxTokens = this.form.maxTokens
          await this.$wsApi.put(`/ai/agents/${this.idEmpresa}/${this.saveAgent.id}`, payload)
        } else {
          const payload = {}
          if (changed.has('systemPrompt')) payload.system_prompt = this.form.systemPrompt || null
          if (changed.has('knowledgeBaseText')) payload.knowledge_base = kb
          if (changed.has('model')) payload.model = this.form.model
          if (changed.has('temperature')) payload.temperature = this.form.temperature
          if (changed.has('maxTokens')) payload.max_tokens = this.form.maxTokens
          await this.$wsApi.put(`/ai/settings/${this.idEmpresa}`, payload)
        }
        this.$bvToast.toast(`Guardado en ${label}.`, { title: 'Configuración del bot', variant: 'success' })
        this.$emit('saved')
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, { title: 'Error al guardar', variant: 'danger' })
      } finally {
        this.saving = null
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.wasim-mono {
  font-family: SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78rem;
}

.wasim-draft-actions { gap: 0.4rem; }

.wasim-diff {
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  padding: 0.5rem;
  max-height: 60vh;

  .is-add { background: #d1e7dd; color: #0f5132; display: block; }
  .is-del { background: #f8d7da; color: #842029; display: block; }
  .is-same { color: #6c757d; display: block; }
}
</style>
