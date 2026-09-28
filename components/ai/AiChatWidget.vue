<template>
  <div v-if="isLoggedIn" class="ai-chat-widget">
    <!-- FAB Button -->
    <b-button
      v-if="!isOpen"
      variant="primary"
      class="ai-fab"
      @click="toggleChat"
      v-b-tooltip.hover.left
      title="Asistente IA"
    >
      <b-icon icon="chat-dots-fill"></b-icon>
    </b-button>

    <!-- Chat Panel -->
    <transition name="slide-up">
      <div v-if="isOpen" class="ai-chat-panel">
        <!-- Header -->
        <div class="ai-chat-header bg-primary text-white">
          <div class="d-flex align-items-center">
            <b-icon icon="robot" class="mr-2"></b-icon>
            <span class="font-weight-bold">Asistente IA</span>
          </div>
          <b-button
            variant="light"
            size="sm"
            class="ai-close-btn"
            @click="toggleChat"
            v-b-tooltip.hover.bottom
            title="Cerrar chat"
          >
            <b-icon icon="x-lg"></b-icon>
          </b-button>
        </div>

        <!-- Messages Container -->
        <div class="ai-chat-messages" ref="messagesContainer">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="ai-welcome-message">
            <div class="ai-bubble ai-bubble-bot">
              <p class="mb-0">👋 ¡Hola{{ userName ? ' ' + userName : '' }}! Soy tu asistente de consultas.</p>
              <p class="mb-0 mt-2">Puedo ayudarte a consultar:</p>
              <ul class="mb-0 mt-1">
                <li>Productos y precios del catálogo</li>
                <li>Órdenes y saldo de un cliente (por teléfono)</li>
                <li>Telas, tallas y horario de atención</li>
                <li>Imágenes de la galería</li>
              </ul>
            </div>
          </div>

          <!-- Chat Messages -->
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['ai-message', msg.sender === 'user' ? 'ai-message-user' : 'ai-message-bot']"
          >
            <div :class="['ai-bubble', msg.sender === 'user' ? 'ai-bubble-user' : 'ai-bubble-bot']">
              <div v-html="formatMessage(msg.text)"></div>
            </div>
            <small class="ai-timestamp text-muted">{{ msg.time }}</small>
          </div>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="ai-message ai-message-bot">
            <div class="ai-bubble ai-bubble-bot">
              <div class="ai-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="ai-chat-input">
          <b-form @submit.prevent="sendMessage">
            <b-input-group>
              <b-form-input
                ref="chatInput"
                v-model="userInput"
                placeholder="Escribe tu pregunta..."
                :disabled="isLoading"
                autocomplete="off"
                @keydown.enter.prevent="sendMessage"
              ></b-form-input>
              <b-input-group-append>
                <b-button
                  variant="primary"
                  type="submit"
                  :disabled="!userInput.trim() || isLoading"
                >
                  <b-icon icon="arrow-right-circle-fill"></b-icon>
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'AiChatWidget',

  data() {
    return {
      isOpen: false,
      isLoading: false,
      userInput: '',
      messages: []
    }
  },

  computed: {
    isLoggedIn() {
      // Verificar si el usuario está logueado usando el store de Vuex
      return this.$store?.state?.login?.access === true ||
             (this.$store?.state?.login?.idEmpresa && this.$store.state.login.idEmpresa > 0)
    },
    userName() {
      return this.$store?.state?.login?.dataUser?.nombre || ''
    }
  },

  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return

      const query = this.userInput.trim()
      this.userInput = ''
      this.$nextTick(() => {
        if (this.$refs.chatInput && this.$refs.chatInput.$el) {
          this.$refs.chatInput.$el.value = ''
        }
      })

      this.messages.push({ sender: 'user', text: query, time: this.getCurrentTime() })
      this.scrollToBottom()
      this.isLoading = true

      try {
        const apiUrl = this.$config?.API || 'https://api.ninesys19.com'

        // Historial reciente (últimos 10) para continuidad conversacional.
        const history = this.messages
          .slice(-10)
          .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', text: msg.text }))

        // NO se sobreescribe Authorization: el interceptor de axios adjunta el
        // Bearer JWT, del que la API deriva la empresa. El bucle de IA vive en el
        // agente (ninesys-ai-agent) al que la API hace de proxy; aquí solo se
        // consulta (lectura). La creación de órdenes se hará en una fase posterior.
        const response = await this.$axios.post(`${apiUrl}/ai/chat`, { query, history })
        const data = response.data

        if (data && data.success) {
          this.messages.push({ sender: 'bot', text: data.response, time: this.getCurrentTime() })
        } else {
          this.messages.push({
            sender: 'bot',
            text: '❌ ' + ((data && (data.error || data.response)) || 'Error al procesar la consulta'),
            time: this.getCurrentTime()
          })
        }
      } catch (error) {
        console.error('AI Chat Error:', error)
        this.messages.push({
          sender: 'bot',
          text: '❌ Error de conexión. Por favor, intenta de nuevo.',
          time: this.getCurrentTime()
        })
      } finally {
        this.isLoading = false
        this.scrollToBottom()
        this.$nextTick(() => {
          if (this.$refs.chatInput) this.$refs.chatInput.focus()
        })
      }
    },

    getCurrentTime() {
      return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) container.scrollTop = container.scrollHeight
      })
    },

    formatMessage(text) {
      if (typeof text === 'object' && text !== null) {
        text = text.prompt || text.message || text.text || text.response || JSON.stringify(text)
      }
      if (typeof text !== 'string') text = String(text)

      // Escapar HTML antes de aplicar formato -- auditoría de seguridad 2026-09-11
      // (Fase 5, hallazgo A7): tanto los mensajes del bot como lo que escribe el
      // usuario pasan por acá.
      const textEscapado = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

      return textEscapado
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/• /g, '&bull; ')
    }
  }
}
</script>

<style scoped>
/* FAB Button */
.ai-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-fab:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Chat Panel */
.ai-chat-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 380px;
  height: 520px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 100000;
  overflow: hidden;
}

/* Header */
.ai-chat-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.ai-close-btn {
  padding: 4px 8px;
  border-radius: 6px;
  opacity: 0.9;
}

.ai-close-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.25);
}

/* Messages Container */
.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

/* Message Bubbles */
.ai-message {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.ai-message-user {
  align-items: flex-end;
}

.ai-message-bot {
  align-items: flex-start;
}

.ai-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
}

.ai-bubble-user {
  background: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-bubble-bot {
  background: #e9ecef;
  color: #212529;
  border-bottom-left-radius: 4px;
}

.ai-timestamp {
  font-size: 11px;
  margin-top: 4px;
}

/* Welcome Message */
.ai-welcome-message {
  margin-bottom: 12px;
}

.ai-welcome-message ul {
  padding-left: 20px;
  font-size: 13px;
}

/* Input Area */
.ai-chat-input {
  padding: 12px;
  background: #fff;
  border-top: 1px solid #dee2e6;
  flex-shrink: 0;
}

/* Typing Animation */
.ai-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.ai-typing span {
  width: 8px;
  height: 8px;
  background: #6c757d;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.ai-typing span:nth-child(1) { animation-delay: 0s; }
.ai-typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

/* Slide Animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Mobile Responsive */
@media (max-width: 576px) {
  .ai-chat-panel {
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .ai-fab {
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>
