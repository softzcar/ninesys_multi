<template>
  <div v-if="isLoggedIn">
    <!-- Fondo en pantallas chicas (el panel se superpone) -->
    <div v-if="isOpen" class="aichat-backdrop d-lg-none" @click="close" />

    <aside
      v-show="isOpen"
      class="aichat-panel"
      :style="{ '--aichat-width': width + 'px' }"
      aria-label="Asistente IA"
    >
      <!-- Borde arrastrable para cambiar el ancho (solo escritorio) -->
      <div class="aichat-resizer d-none d-lg-block" title="Arrastra para cambiar el ancho" @mousedown.prevent="startResize" />

      <header class="aichat-header">
        <div class="d-flex align-items-center">
          <b-icon icon="robot" class="mr-2" />
          <strong>Asistente IA</strong>
        </div>
        <div class="d-flex align-items-center">
          <b-button
            variant="link"
            size="sm"
            class="aichat-header-btn"
            :disabled="isLoading || !messages.length"
            v-b-tooltip.hover.bottom
            title="Nueva conversación"
            @click="nuevaConversacion"
          >
            <b-icon icon="arrow-counterclockwise" />
          </b-button>
          <b-button variant="link" size="sm" class="aichat-header-btn" v-b-tooltip.hover.bottom title="Cerrar" @click="close">
            <b-icon icon="x-lg" />
          </b-button>
        </div>
      </header>

      <div ref="messages" class="aichat-messages">
        <div v-if="!messages.length" class="aichat-welcome">
          <p class="mb-1">👋 ¡Hola{{ userName ? ' ' + userName : '' }}! Soy tu asistente de consultas.</p>
          <p class="mb-1">Puedo ayudarte con:</p>
          <ul class="mb-0">
            <li>Productos y precios del catálogo</li>
            <li>Estado de cuenta, órdenes y pagos de un cliente</li>
            <li>Diseños de una orden, imagen aprobada y propuestas pendientes</li>
            <li>Telas, tallas, horario y galería</li>
          </ul>
        </div>

        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['aichat-msg', msg.sender === 'user' ? 'is-user' : 'is-bot']"
        >
          <div :class="['aichat-bubble', { 'is-error': msg.error }]">
            <div v-if="msg.sender === 'user'" class="aichat-user-text">{{ msg.text }}</div>
            <div v-else class="aichat-md" v-html="renderMarkdown(msg.text)" />

            <div v-if="imagesOf(msg).length" class="aichat-images">
              <figure
                v-for="(img, j) in imagesOf(msg)"
                :key="j"
                class="aichat-thumb"
                role="button"
                tabindex="0"
                @click="openViewer(img)"
                @keydown.enter="openViewer(img)"
              >
                <img :src="img.url" :alt="img.caption" loading="lazy" @error="onImgError" />
                <figcaption>{{ img.caption }}</figcaption>
              </figure>
            </div>
          </div>
          <small class="aichat-time">{{ msg.time }}</small>
        </div>

        <div v-if="isLoading" class="aichat-msg is-bot">
          <div class="aichat-bubble">
            <div class="aichat-typing"><span /><span /><span /></div>
          </div>
        </div>
      </div>

      <footer class="aichat-input">
        <b-form-textarea
          ref="input"
          v-model="draft"
          rows="1"
          max-rows="6"
          no-resize
          placeholder="Escribe tu pregunta…  (Enter envía, Shift+Enter nueva línea)"
          :disabled="isLoading"
          @keydown.enter.exact.prevent="enviar"
        />
        <b-button variant="primary" :disabled="!draft.trim() || isLoading" title="Enviar" @click="enviar">
          <b-icon icon="arrow-up-circle-fill" />
        </b-button>
      </footer>
    </aside>

    <!-- Visor de imagen ampliada -->
    <b-modal v-model="viewer.show" :title="viewer.caption" size="xl" centered hide-footer>
      <div class="text-center">
        <img :src="viewer.url" :alt="viewer.caption" class="aichat-viewer-img" />
        <div class="mt-2">
          <a :href="viewer.url" target="_blank" rel="noopener noreferrer">Abrir en pestaña nueva ↗</a>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { MIN_WIDTH } from '~/store/aichat'

// Solo se muestran imágenes https de los CDN del ecosistema (defensa en profundidad:
// la API ya filtra; las URLs vienen de los datos de las tools, no del modelo).
const HOSTS_PERMITIDOS = ['cdn.ninesys19.com', 'cdn.nineteengreen.com']

// Los enlaces del texto del asistente abren en pestaña nueva.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export default {
  name: 'AiChatPanel',

  data() {
    return {
      draft: '',
      viewer: { show: false, url: '', caption: '' },
    }
  },

  computed: {
    ...mapState('aichat', ['messages', 'isOpen', 'isLoading', 'width']),
    isLoggedIn() {
      return !!this.$store.state.login.access
    },
    userName() {
      return (this.$store.state.login.dataUser && this.$store.state.login.dataUser.nombre) || ''
    },
  },

  watch: {
    isOpen(open) {
      if (open) this.scrollToBottom(true)
    },
    'messages.length'() {
      this.scrollToBottom()
    },
    isLoading() {
      this.scrollToBottom()
    },
  },

  mounted() {
    if (this.isOpen) this.scrollToBottom(true)
  },

  beforeDestroy() {
    this.stopResize()
  },

  methods: {
    close() {
      this.$store.commit('aichat/setOpen', false)
    },

    nuevaConversacion() {
      this.$store.commit('aichat/reset')
      this.focusInput()
    },

    async enviar() {
      const query = this.draft.trim()
      if (!query || this.isLoading) return
      this.draft = ''
      await this.$store.dispatch('aichat/send', { query, apiUrl: this.$config.API })
      this.focusInput()
    },

    renderMarkdown(text) {
      const html = marked.parse(String(text || ''), { breaks: true, gfm: true })
      return DOMPurify.sanitize(html, {
        FORBID_TAGS: ['img', 'style', 'iframe', 'form', 'input', 'button', 'script'],
        FORBID_ATTR: ['style', 'onerror', 'onclick'],
      })
    },

    imagesOf(msg) {
      return (msg.images || []).filter((img) => {
        try {
          const u = new URL(img.url)
          return u.protocol === 'https:' && HOSTS_PERMITIDOS.includes(u.hostname)
        } catch (e) {
          return false
        }
      })
    },

    openViewer(img) {
      this.viewer = { show: true, url: img.url, caption: img.caption || 'Imagen' }
    },

    onImgError(ev) {
      const fig = ev.target.closest('figure')
      if (fig) fig.classList.add('is-broken')
    },

    scrollToBottom(instant = false) {
      this.$nextTick(() => {
        const el = this.$refs.messages
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: instant ? 'auto' : 'smooth' })
      })
    },

    focusInput() {
      this.$nextTick(() => {
        const ta = this.$refs.input && this.$refs.input.$el
        if (ta) ta.focus()
      })
    },

    // ---- Redimensionar arrastrando el borde izquierdo ----
    startResize() {
      document.addEventListener('mousemove', this.onResize)
      document.addEventListener('mouseup', this.stopResize)
      document.body.classList.add('aichat-resizing')
    },
    onResize(ev) {
      const max = Math.min(900, Math.round(window.innerWidth * 0.5))
      const width = Math.min(max, Math.max(MIN_WIDTH, window.innerWidth - ev.clientX))
      this.$store.commit('aichat/setWidth', width)
    },
    stopResize() {
      document.removeEventListener('mousemove', this.onResize)
      document.removeEventListener('mouseup', this.stopResize)
      document.body.classList.remove('aichat-resizing')
    },
  },
}
</script>

<style lang="scss" scoped>
$accent: #17a2b8;

.aichat-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: var(--aichat-width, 440px);
  max-width: 100vw;
  background: #fff;
  border-left: 1px solid #dee2e6;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  z-index: 1035; // sobre la barra móvil (1030), debajo de los modales (1040+)

  @media (max-width: 991.98px) {
    width: 100vw;
    box-shadow: none;
  }
}

.aichat-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1034;
}

.aichat-resizer {
  position: absolute;
  left: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 2;

  &:hover {
    background: rgba($accent, 0.35);
  }
}

.aichat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.75rem 0.65rem 1rem;
  background: $accent;
  color: #fff;
  flex-shrink: 0;
}

.aichat-header-btn {
  color: #fff;
  padding: 0.25rem 0.45rem;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
  &:disabled {
    color: rgba(255, 255, 255, 0.5);
  }
}

.aichat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f8f9fa;
}

.aichat-welcome {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  color: #495057;

  ul {
    padding-left: 1.2rem;
  }
}

.aichat-msg {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.85rem;

  &.is-user {
    align-items: flex-end;
  }
  &.is-bot {
    align-items: stretch;
  }
}

.aichat-bubble {
  padding: 0.6rem 0.85rem;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
  word-wrap: break-word;

  .is-user & {
    max-width: 85%;
    background: $accent;
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .is-bot & {
    background: #fff;
    color: #212529;
    border: 1px solid #e9ecef;
    border-bottom-left-radius: 4px;
  }
  &.is-error {
    background: #fff5f5;
    border-color: #f5c2c7;
    color: #842029;
  }
}

.aichat-user-text {
  white-space: pre-wrap;
}

// Markdown del asistente
.aichat-md {
  ::v-deep p {
    margin: 0 0 0.5rem;
  }
  ::v-deep p:last-child {
    margin-bottom: 0;
  }
  ::v-deep ul,
  ::v-deep ol {
    padding-left: 1.25rem;
    margin: 0.25rem 0 0.5rem;
  }
  ::v-deep li {
    margin-bottom: 0.15rem;
  }
  ::v-deep h1,
  ::v-deep h2,
  ::v-deep h3,
  ::v-deep h4 {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0.6rem 0 0.35rem;
  }
  ::v-deep table {
    width: 100%;
    font-size: 0.82rem;
    border-collapse: collapse;
    margin: 0.4rem 0;
    display: block;
    overflow-x: auto;
  }
  ::v-deep th,
  ::v-deep td {
    border: 1px solid #dee2e6;
    padding: 0.25rem 0.45rem;
  }
  ::v-deep code {
    background: #f1f3f5;
    padding: 0 0.25rem;
    border-radius: 3px;
  }
}

.aichat-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.aichat-thumb {
  margin: 0;
  cursor: zoom-in;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;

  img {
    width: 100%;
    height: 120px;
    object-fit: contain;
    background: #f1f3f5;
    display: block;
  }
  figcaption {
    font-size: 0.72rem;
    color: #6c757d;
    padding: 0.25rem 0.4rem;
    line-height: 1.25;
  }
  &:hover,
  &:focus {
    border-color: $accent;
    outline: none;
  }
  &.is-broken {
    display: none;
  }
}

.aichat-time {
  font-size: 0.7rem;
  color: #adb5bd;
  margin-top: 0.2rem;
}

.aichat-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;

  span {
    width: 7px;
    height: 7px;
    background: #adb5bd;
    border-radius: 50%;
    animation: aichat-typing 1.4s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes aichat-typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

.aichat-input {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
  background: #fff;
  flex-shrink: 0;

  .btn {
    flex-shrink: 0;
  }
}

.aichat-viewer-img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
}
</style>

<style>
/* Evita seleccionar texto mientras se arrastra el borde del panel */
body.aichat-resizing {
  cursor: col-resize;
  user-select: none;
}
body.aichat-resizing .main-wrapper {
  transition: none !important;
}
</style>
