<template>
  <div class="wasim-chat">
    <div class="wasim-chat-header">
      <div class="d-flex align-items-center">
        <div class="wasim-avatar"><b-icon icon="person-fill" /></div>
        <div class="ml-2">
          <div class="font-weight-bold">{{ customerLabel }}</div>
          <small class="wasim-subtle">Simulación · nada se envía por WhatsApp</small>
        </div>
      </div>
      <div>
        <b-button size="sm" variant="link" class="wasim-header-btn" title="Exportar conversación" :disabled="!turns.length" @click="$emit('export')">
          <b-icon icon="download" />
        </b-button>
        <b-button size="sm" variant="link" class="wasim-header-btn" title="Reiniciar conversación" :disabled="loading" @click="$emit('reset')">
          <b-icon icon="arrow-counterclockwise" />
        </b-button>
      </div>
    </div>

    <div ref="scroller" class="wasim-messages">
      <div v-if="!turns.length && !loading" class="wasim-empty">
        Escribe como si fueras el cliente. El bot responderá con su configuración real
        (o con tu borrador) y a la derecha verás todo lo que pasó por dentro.
      </div>

      <div v-for="(turn, ti) in turns" :key="ti" class="wasim-turn" :class="{ 'is-selected': ti === selectedIndex }">
        <div class="wasim-row is-out">
          <b-button
            v-if="canRepeat && ti === turns.length - 1"
            size="sm"
            variant="light"
            class="wasim-repeat"
            title="Repetir este mensaje con la configuración actual (borrador o guardado)"
            @click="$emit('repeat')"
          >
            <b-icon icon="arrow-repeat" /> Repetir
          </b-button>
          <div class="wasim-bubble is-out">
            <span class="wasim-text">{{ turn.userText }}</span>
            <span class="wasim-time">{{ timeOf(turn.at) }}</span>
          </div>
        </div>

        <div v-if="turn.error" class="wasim-system is-error">
          <b-icon icon="exclamation-triangle" /> {{ turn.error }}
        </div>

        <template v-for="(m, mi) in turn.messages || []">
          <div :key="`m${mi}`" class="wasim-row is-in" @click="$emit('select', ti)">
            <div class="wasim-bubble is-in" :class="{ 'is-clickable': true }">
              <template v-if="m.type === 'image'">
                <img
                  v-if="isAllowedImage(m.body)"
                  :src="m.body"
                  class="wasim-img"
                  alt="Imagen de galería"
                  @error="onImgError"
                >
                <span v-else class="wasim-subtle">[imagen fuera de los CDN permitidos: {{ m.body }}]</span>
              </template>
              <span v-else class="wasim-text" v-html="format(m.body)" />
              <span class="wasim-time">
                <b-badge v-if="m.via === 'api'" variant="light" class="mr-1" title="Mensaje automático del sistema (no IA)">sistema</b-badge>
                <b-badge
                  v-else
                  :variant="turn.draftUsed ? 'warning' : 'secondary'"
                  class="mr-1 wasim-src"
                  :title="turn.draftUsed ? 'Respondió con tu borrador (sin guardar)' : 'Respondió con la configuración guardada'"
                >{{ turn.draftUsed ? 'borrador' : 'guardado' }}</b-badge>
                {{ timeOf(turn.at) }}
              </span>
            </div>
          </div>
        </template>

        <div v-for="(a, ai) in visibleActions(turn)" :key="`a${ai}`" class="wasim-system" @click="$emit('select', ti)">
          <b-icon :icon="a.icon" /> {{ a.text }}
        </div>

        <!-- Respuestas anteriores al repetir el mensaje, para comparar -->
        <div v-for="(p, pi) in turn.previous || []" :key="`p${pi}`" class="wasim-prev">
          <div class="wasim-prev-title" @click="togglePrev(ti, pi)">
            <b-icon :icon="isPrevOpen(ti, pi) ? 'chevron-down' : 'chevron-right'" />
            Respuesta anterior{{ pi > 0 ? ` (${pi + 1})` : '' }}
            <b-badge :variant="p.draftUsed ? 'warning' : 'secondary'">{{ p.draftUsed ? 'borrador' : 'guardado' }}</b-badge>
          </div>
          <div v-if="isPrevOpen(ti, pi)">
            <div v-if="p.error" class="wasim-system is-error">{{ p.error }}</div>
            <div v-for="(m, mi) in p.messages || []" :key="mi" class="wasim-row is-in">
              <div class="wasim-bubble is-in is-prev">
                <span v-if="m.type === 'image'" class="wasim-subtle">[imagen] {{ m.body }}</span>
                <span v-else class="wasim-text" v-html="format(m.body)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="wasim-row is-in">
        <div class="wasim-bubble is-in wasim-typing">
          <span /><span /><span />
        </div>
      </div>
    </div>

    <div class="wasim-input">
      <b-form-textarea
        ref="input"
        v-model="draftText"
        rows="1"
        max-rows="5"
        placeholder="Escribe un mensaje como cliente…"
        :disabled="loading"
        @keydown.enter.exact.prevent="send"
      />
      <b-button variant="success" class="ml-2 wasim-send" :disabled="loading || !draftText.trim()" @click="send">
        <b-icon icon="cursor-fill" rotate="45" />
      </b-button>
    </div>
  </div>
</template>

<script>
import { waFormat } from '~/utils/waFormat'

const HOSTS_PERMITIDOS = ['cdn.ninesys19.com', 'cdn.nineteengreen.com']

// Acciones que producción ejecutaría, descritas para el chat.
const ACTION_LABELS = {
  would_handoff: (a) => ({ icon: 'person-check', text: `Se escalaría a un asesor humano (${a.reason})` }),
  would_create_presupuesto: (a) => ({
    icon: 'file-earmark-text',
    text: a.preview && a.preview.ok
      ? `Se crearía el presupuesto (total estimado ${Number(a.preview.total).toFixed(2)})`
      : `No se crearía el presupuesto (${(a.preview && a.preview.reason) || 'error'})`,
  }),
  presupuesto_pendiente: (a) => ({
    icon: 'hourglass-split',
    text: a.parseError ? 'La IA envió datos de presupuesto con JSON inválido' : 'Presupuesto listo: esperando que el cliente confirme con "SÍ"',
  }),
  pending_presupuesto_cancelled: () => ({ icon: 'x-circle', text: 'El cliente no confirmó: presupuesto pendiente descartado' }),
  retry_confirm_instruction: () => ({ icon: 'arrow-repeat', text: 'Se forzó a la IA a registrar el presupuesto (confirmó sin datos)' }),
  would_update_notifications: (a) => ({
    icon: 'bell',
    text: a.value ? 'Se reactivarían los mensajes automáticos del cliente' : 'Se daría de baja al cliente de los mensajes automáticos',
  }),
  note_auto_assign: (a) => ({
    icon: 'info-circle',
    text: `En un chat nuevo real, este cliente iría directo a su vendedor histórico (#${a.vendorId}) y la IA no respondería`,
  }),
  fallback: (a) => ({ icon: 'exclamation-circle', text: `Respuesta de respaldo (${a.kind})` }),
}

export default {
  name: 'WaSimChat',
  props: {
    turns: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    selectedIndex: { type: Number, default: -1 },
    customerLabel: { type: String, default: 'Cliente anónimo' },
    canRepeat: { type: Boolean, default: false },
  },
  data() {
    return { draftText: '', openPrev: {} }
  },
  watch: {
    turns() {
      this.openPrev = {}
      this.scrollToBottom()
    },
    loading(val) {
      this.scrollToBottom()
      if (!val) this.$nextTick(() => this.$refs.input && this.$refs.input.focus())
    },
  },
  mounted() {
    this.scrollToBottom()
  },
  methods: {
    send() {
      const text = this.draftText.trim()
      if (!text || this.loading) return
      this.$emit('send', text)
      this.draftText = ''
    },
    format(text) {
      return waFormat(text)
    },
    timeOf(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      return isNaN(d) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    isAllowedImage(url) {
      try {
        const u = new URL(url)
        return u.protocol === 'https:' && HOSTS_PERMITIDOS.includes(u.hostname)
      } catch (_) {
        return false
      }
    },
    onImgError(ev) {
      ev.target.classList.add('is-broken')
      ev.target.alt = 'La imagen no existe (en producción el cliente recibiría una disculpa)'
    },
    visibleActions(turn) {
      return (turn.actions || [])
        .filter((a) => ACTION_LABELS[a.type])
        .map((a) => ACTION_LABELS[a.type](a))
    },
    // La respuesta anterior más reciente se muestra abierta; las demás plegadas.
    isPrevOpen(ti, pi) {
      const key = `${ti}:${pi}`
      return key in this.openPrev ? this.openPrev[key] : pi === 0
    },
    togglePrev(ti, pi) {
      this.$set(this.openPrev, `${ti}:${pi}`, !this.isPrevOpen(ti, pi))
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.scroller
        if (el) el.scrollTop = el.scrollHeight
      })
    },
  },
}
</script>

<style lang="scss" scoped>
$wa-green: #008069;
$wa-out: #d9fdd3;
$wa-bg: #efeae2;

.wasim-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.wasim-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 0.75rem;
  background: $wa-green;
  color: #fff;
  flex-shrink: 0;

  .wasim-subtle { color: rgba(255, 255, 255, 0.8); }
}

.wasim-header-btn {
  color: #fff;
  &:hover:not(:disabled) { color: #fff; background: rgba(255, 255, 255, 0.15); }
  &:disabled { color: rgba(255, 255, 255, 0.5); }
}

.wasim-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.wasim-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem 0.75rem;
  background: $wa-bg;
}

.wasim-empty {
  max-width: 420px;
  margin: 2rem auto;
  background: #fff8c5;
  color: #54656f;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  text-align: center;
}

.wasim-turn {
  border-radius: 8px;
  padding: 2px 0;

  &.is-selected { background: rgba(0, 128, 105, 0.07); }
}

.wasim-row {
  display: flex;
  margin: 3px 0;

  &.is-out { justify-content: flex-end; }
  &.is-in { justify-content: flex-start; }
}

.wasim-bubble {
  max-width: 78%;
  padding: 6px 9px 4px;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #111b21;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
  word-wrap: break-word;

  &.is-out { background: $wa-out; border-top-right-radius: 0; }
  &.is-in { background: #fff; border-top-left-radius: 0; }
  &.is-clickable { cursor: pointer; }
}

.wasim-text { white-space: pre-wrap; }

.wasim-time {
  display: block;
  text-align: right;
  font-size: 0.68rem;
  color: #667781;
  margin-top: 2px;
}

.wasim-img {
  display: block;
  max-width: 260px;
  max-height: 260px;
  border-radius: 6px;

  &.is-broken {
    min-width: 200px;
    min-height: 60px;
    background: #f8d7da;
  }
}

.wasim-system {
  margin: 6px auto;
  max-width: 85%;
  text-align: center;
  font-size: 0.78rem;
  color: #54656f;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 6px;
  padding: 3px 8px;
  cursor: pointer;

  &.is-error { color: #842029; background: #f8d7da; cursor: default; }
}

.wasim-subtle { color: #667781; font-size: 0.8rem; }

.wasim-repeat {
  align-self: center;
  margin-right: 6px;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  opacity: 0.85;
}

.wasim-src { font-size: 0.62rem; font-weight: 500; }

.wasim-prev {
  margin: 4px 0 6px;
  padding-left: 8px;
  border-left: 3px dashed rgba(0, 0, 0, 0.15);
}

.wasim-prev-title {
  font-size: 0.75rem;
  color: #54656f;
  cursor: pointer;
  user-select: none;
}

.wasim-bubble.is-prev { opacity: 0.7; }

.wasim-typing {
  display: flex;
  gap: 4px;
  padding: 10px 12px;

  span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #8696a0;
    animation: wasim-blink 1.2s infinite ease-in-out;
  }
  span:nth-child(2) { animation-delay: 0.2s; }
  span:nth-child(3) { animation-delay: 0.4s; }
}

@keyframes wasim-blink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

.wasim-input {
  display: flex;
  align-items: flex-end;
  padding: 0.5rem;
  background: #f0f2f5;
  flex-shrink: 0;

  textarea { resize: none; border-radius: 18px; }
}

.wasim-send { border-radius: 50%; width: 40px; height: 40px; padding: 0; }

::v-deep .wa-mono {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 0 3px;
  border-radius: 3px;
}
</style>
