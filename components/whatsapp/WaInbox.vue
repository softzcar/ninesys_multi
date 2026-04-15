<template>
  <div class="wa-inbox" :class="{ 'wa-chat-open': !!selectedJid }">
    <b-row no-gutters class="wa-inbox-row">
      <!-- Panel izquierdo: lista de conversaciones -->
      <b-col md="4" lg="3" class="wa-sidebar-panel">
        <div class="wa-sidebar-header">
          <h5 class="mb-0">Conversaciones</h5>
          <b-input-group size="sm" class="mt-2">
            <b-form-input
              v-model="search"
              placeholder="Buscar conversación..."
              @input="filterConversations"
            />
          </b-input-group>
          <!-- Filtros -->
          <div class="mt-2 d-flex flex-wrap gap-1">
            <b-button
              v-for="f in filters"
              :key="f.value"
              size="sm"
              :variant="activeFilter === f.value ? 'info' : 'outline-secondary'"
              class="mr-1 mb-1"
              @click="activeFilter = f.value"
            >
              {{ f.label }}
            </b-button>
          </div>
        </div>

        <div class="wa-conversations-list" ref="convList">
          <div v-if="loadingConversations" class="text-center py-4">
            <b-spinner small variant="info" />
          </div>
          <div
            v-for="conv in filteredConversations"
            :key="conv.id"
            class="wa-conv-item"
            :class="{ active: selectedJid === conv.id }"
            @click="selectConversation(conv)"
          >
            <div class="d-flex justify-content-between align-items-start">
              <div class="wa-conv-name text-truncate">
                {{ conv.name || formatPhone(conv.id) }}
              </div>
              <small class="text-muted wa-conv-time">{{ formatTime(conv.timestamp) }}</small>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-1">
              <small class="text-muted text-truncate wa-conv-preview">
                {{ conv.lastMessage || 'Sin mensajes' }}
              </small>
              <div class="d-flex align-items-center">
                <b-badge v-if="conv.agentName" variant="info" pill class="mr-1" style="font-size:0.65rem">
                  {{ conv.agentName }}
                </b-badge>
                <b-badge v-if="conv.mode === 'human'" variant="warning" pill style="font-size:0.65rem">
                  Humano
                </b-badge>
                <b-badge
                  v-if="conv.unreadCount > 0"
                  variant="success"
                  pill
                  class="ml-1"
                >
                  {{ conv.unreadCount }}
                </b-badge>
              </div>
            </div>
          </div>
          <div v-if="!loadingConversations && filteredConversations.length === 0" class="text-center py-4 text-muted">
            No hay conversaciones
          </div>
        </div>
      </b-col>

      <!-- Panel derecho: chat -->
      <b-col md="8" lg="9" class="wa-chat-panel">
        <template v-if="selectedJid">
          <!-- Header del chat -->
          <div class="wa-chat-header">
            <div class="d-flex justify-content-between align-items-center flex-wrap wa-chat-header-row">
              <div class="d-flex align-items-center flex-wrap wa-chat-header-title">
                <b-button
                  variant="link"
                  size="sm"
                  class="wa-back-btn d-md-none p-0 mr-2"
                  @click="clearSelection"
                  title="Volver a conversaciones"
                >
                  <b-icon icon="arrow-left" font-scale="1.3" />
                </b-button>
                <strong class="wa-chat-title">{{ selectedConv.name || formatPhone(selectedJid) }}</strong>
                <b-badge v-if="selectedConv.mode === 'human'" variant="warning" class="ml-2">Modo Humano</b-badge>
                <b-badge v-else-if="selectedConv.aiEnabled" variant="info" class="ml-2">IA Activa</b-badge>
                <b-badge v-if="selectedConv.agentName" variant="light" class="ml-1">{{ selectedConv.agentName }}</b-badge>
              </div>
              <div>
                <!-- Asignar agente -->
                <b-dropdown size="sm" variant="outline-info" text="Agente" class="mr-1" right>
                  <b-dropdown-item
                    v-for="a in agents"
                    :key="a.id"
                    @click="assignAgent(a.id)"
                    :active="selectedConv.aiAgentId === a.id"
                  >
                    {{ a.name }} <span v-if="a.isDefault" class="text-muted">(default)</span>
                  </b-dropdown-item>
                  <b-dropdown-divider />
                  <b-dropdown-item @click="assignAgent(null)">
                    Sin agente (usar default)
                  </b-dropdown-item>
                </b-dropdown>
                <!-- Tomar / Liberar -->
                <b-button
                  v-if="selectedConv.mode !== 'human'"
                  size="sm"
                  variant="warning"
                  @click="takeConversation"
                >
                  Tomar conversación
                </b-button>
                <b-button
                  v-else
                  size="sm"
                  variant="outline-success"
                  @click="releaseConversation"
                >
                  Devolver a IA
                </b-button>
              </div>
            </div>
          </div>

          <!-- Mensajes -->
          <div class="wa-messages" ref="messagesContainer">
            <div v-if="loadingMessages" class="text-center py-4">
              <b-spinner small variant="info" />
            </div>
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="wa-message"
              :class="{ 'wa-message-out': msg.from_me, 'wa-message-in': !msg.from_me }"
            >
              <div class="wa-bubble">
                <small v-if="msg.from_me && msg.via" class="wa-via">
                  {{ msg.via === 'ai' ? 'IA' : msg.via === 'human' ? 'Agente' : msg.via }}
                </small>

                <!-- Render por tipo de mensaje -->
                <template v-if="msg.type === 'image' || msg.type === 'sticker'">
                  <img
                    v-if="msg.mediaBlobUrl"
                    :src="msg.mediaBlobUrl"
                    class="wa-media-image"
                    :class="{ 'wa-media-sticker': msg.type === 'sticker' }"
                    @click="openMedia(msg.mediaBlobUrl)"
                  />
                  <div v-else-if="msg.mediaError" class="wa-media-error">
                    <b-icon icon="exclamation-triangle" /> No se pudo cargar la imagen
                  </div>
                  <div v-else class="wa-media-loading">
                    <b-spinner small variant="secondary" /> Cargando imagen...
                  </div>
                  <div v-if="msg.body && msg.type === 'image'" class="wa-body mt-1">{{ msg.body }}</div>
                </template>

                <template v-else-if="msg.type === 'audio'">
                  <audio
                    v-if="msg.mediaBlobUrl"
                    :src="msg.mediaBlobUrl"
                    controls
                    preload="metadata"
                    class="wa-media-audio"
                    @error="onMediaElementError(msg, 'audio', $event)"
                  />
                  <div v-else-if="msg.mediaError" class="wa-media-error">
                    <b-icon icon="exclamation-triangle" /> No se pudo cargar el audio
                  </div>
                  <div v-else class="wa-media-loading">
                    <b-spinner small variant="secondary" /> Cargando audio...
                  </div>
                </template>

                <template v-else-if="msg.type === 'video'">
                  <video
                    v-if="msg.mediaBlobUrl"
                    :src="msg.mediaBlobUrl"
                    controls
                    playsinline
                    preload="metadata"
                    class="wa-media-video"
                    @error="onMediaElementError(msg, 'video', $event)"
                  />
                  <div v-else-if="msg.mediaError" class="wa-media-error">
                    <b-icon icon="exclamation-triangle" /> No se pudo cargar el video
                  </div>
                  <div v-else class="wa-media-loading">
                    <b-spinner small variant="secondary" /> Cargando video...
                  </div>
                  <div v-if="msg.body" class="wa-body mt-1">{{ msg.body }}</div>
                </template>

                <template v-else-if="msg.type === 'document'">
                  <a
                    v-if="msg.mediaBlobUrl"
                    :href="msg.mediaBlobUrl"
                    :download="msg.body || 'documento'"
                    class="wa-media-doc"
                  >
                    <b-icon icon="file-earmark-arrow-down" font-scale="1.3" />
                    <span class="ml-2">{{ msg.body || 'Documento' }}</span>
                  </a>
                  <div v-else-if="msg.mediaError" class="wa-media-error">
                    <b-icon icon="exclamation-triangle" /> No se pudo cargar el documento
                  </div>
                  <div v-else class="wa-media-loading">
                    <b-spinner small variant="secondary" /> Cargando documento...
                  </div>
                </template>

                <div v-else class="wa-body">{{ msg.body || `[${msg.type}]` }}</div>

                <div class="wa-meta">
                  <small>{{ formatMessageTime(msg.ts) }}</small>
                  <small v-if="msg.from_me" class="ml-1">
                    <b-icon :icon="statusIcon(msg.status)" :variant="statusVariant(msg.status)" font-scale="0.8" />
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Input de mensaje -->
          <div class="wa-input-bar">
            <div v-if="inputDisabled" class="wa-input-locked text-center">
              <b-icon icon="robot" class="mr-1" />
              La IA está manejando esta conversación. Pulsa
              <strong>Tomar conversación</strong> para responder manualmente.
            </div>
            <!-- Indicador de grabación -->
            <div v-if="recording" class="wa-recording-indicator">
              <b-icon icon="record-fill" variant="danger" class="recording-pulse mr-2" />
              <span>Grabando... {{ formatRecTime(recordingTime) }}</span>
              <div class="ml-auto">
                <b-button size="sm" variant="outline-danger" @click="cancelRecording" class="mr-2">
                  Cancelar
                </b-button>
                <b-button size="sm" variant="success" @click="stopRecording">
                  <b-icon icon="send-fill" /> Enviar
                </b-button>
              </div>
            </div>

            <b-input-group v-else>
              <b-input-group-prepend>
                <b-button
                  variant="outline-secondary"
                  :disabled="uploadingFile"
                  @click="startRecording"
                  title="Grabar nota de voz"
                >
                  <b-icon icon="mic-fill" />
                </b-button>
                <b-button
                  variant="outline-secondary"
                  :disabled="uploadingFile"
                  @click="$refs.fileInput.click()"
                  title="Adjuntar imagen, video, audio o documento"
                >
                  <b-spinner v-if="uploadingFile" small />
                  <b-icon v-else icon="paperclip" />
                </b-button>
              </b-input-group-prepend>
              <b-form-input
                v-model="newMessage"
                placeholder="Escribe un mensaje..."
                @keyup.enter="sendMessage"
              />
              <b-input-group-append>
                <b-button variant="info" @click="sendMessage" :disabled="!newMessage.trim()">
                  <b-icon icon="cursor-fill" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
            <input
              type="file"
              ref="fileInput"
              style="display:none"
              accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
              @change="onFileSelected"
            />
          </div>
        </template>

        <!-- Estado vacío -->
        <div v-else class="wa-empty-chat">
          <b-icon icon="chat-dots" font-scale="4" class="text-muted" />
          <p class="mt-3 text-muted">Selecciona una conversación para ver los mensajes</p>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "WaInbox",
  data() {
    return {
      conversations: [],
      messages: [],
      agents: [],
      search: "",
      activeFilter: "all",
      selectedJid: null,
      selectedConv: {},
      newMessage: "",
      loadingConversations: false,
      loadingMessages: false,
      uploadingFile: false,
      mediaTypes: ['image', 'audio', 'video', 'document', 'sticker'],
      // Grabación de notas de voz (MediaRecorder)
      recording: false,
      recordingTime: 0,           // segundos transcurridos
      _mediaRecorder: null,       // instancia MediaRecorder (no reactiva necesaria)
      _recChunks: [],
      _recTimer: null,
      _recStartAt: 0,
      _recCancelled: false,
      _recStream: null,
      _recMaxSeconds: 120,        // límite 2 min
      filters: [
        { label: "Todos", value: "all" },
        { label: "Sin leer", value: "unread" },
        { label: "IA activa", value: "ai" },
        { label: "Humano", value: "human" },
      ],
    };
  },
  computed: {
    ...mapState("login", ["idEmpresa", "empleado", "dataUser"]),
    // Id del usuario autenticado (id_empleado en la tabla de empleados)
    currentUserId() {
      return (
        this.dataUser?.id_empleado ||
        this.empleado?.id_empleado ||
        this.empleado?.id ||
        null
      );
    },
    // Input bloqueado cuando la conv la maneja la IA y no la hemos tomado
    inputDisabled() {
      if (!this.selectedJid) return true;
      // Si está en modo humano, siempre se puede escribir
      if (this.selectedConv.mode === "human") return false;
      // hybrid / bot con IA activa → bloquear (toma la conversación primero)
      return !!this.selectedConv.aiEnabled;
    },
    filteredConversations() {
      let list = this.conversations;
      if (this.search) {
        const q = this.search.toLowerCase();
        list = list.filter(
          (c) =>
            (c.name || "").toLowerCase().includes(q) ||
            (c.id || "").includes(q)
        );
      }
      if (this.activeFilter === "unread") {
        list = list.filter((c) => c.unreadCount > 0);
      } else if (this.activeFilter === "ai") {
        list = list.filter((c) => c.aiEnabled && c.mode !== "human");
      } else if (this.activeFilter === "human") {
        list = list.filter((c) => c.mode === "human");
      }
      return list;
    },
  },
  mounted() {
    this.fetchConversations();
    this.fetchAgents();
    this.initSocket();
  },
  beforeDestroy() {
    this.teardownSocket();
    // Por si el usuario cierra el panel en mitad de una grabación
    if (this.recording) this.cancelRecording();
  },
  methods: {
    // ---- Socket.IO en tiempo real ----
    initSocket() {
      const socket = this.$wsSocket;
      if (!socket) {
        console.warn('[WaInbox] $wsSocket no disponible');
        return;
      }

      const companyId = this.idEmpresa;
      console.log('[WaInbox] initSocket, companyId:', companyId, 'connected:', socket.connected);

      // Registrar listeners ANTES de conectar para no perder eventos
      this.setupSocketListeners(socket);

      // Función para suscribirse al room de la empresa
      const doSubscribe = () => {
        console.log('[WaInbox] Emitiendo subscribe para company:', companyId);
        socket.emit('subscribe', companyId);
      };

      if (socket.connected) {
        doSubscribe();
      } else {
        // Esperar a que conecte, luego suscribirse
        socket.once('connect', () => {
          console.log('[WaInbox] Socket conectado, id:', socket.id);
          doSubscribe();
        });
        socket.connect();
      }
    },

    setupSocketListeners(socket) {
      // Limpiar listeners previos para evitar duplicados
      socket.off('message:new');
      socket.off('conversation:updated');
      socket.off('conversation:handoff');

      const myCompany = String(this.idEmpresa);

      // Mensaje nuevo (entrante o saliente)
      socket.on('message:new', (data) => {
        console.log('[WaInbox] message:new', data.jid, 'from_me:', data.from_me);
        if (String(data.companyId) !== myCompany) return;

        // Si la conversación activa es la del mensaje, agregarlo al chat
        if (this.selectedJid && data.jid === this.selectedJid) {
          // Evitar duplicados
          const isDup = this.messages.some(
            (m) => m.wa_message_id && m.wa_message_id === data.wa_message_id
          );
          if (!isDup) {
            this.messages.push(data);
            if (this.mediaTypes.includes(data.type)) {
              this.ensureMediaLoaded(data);
            }
            this.$nextTick(() => this.scrollToBottom());
          }
          // Marcar como leída en el backend y notificar al sidebar para
          // cancelar el incremento del badge (el usuario ya está viendo la conv)
          if (!data.from_me) {
            this.$wsApi
              .post(`/conversations/${this.idEmpresa}/${data.jid}/read`)
              .catch(() => {});
            this.$nuxt.$emit('wa:conv-read', data.jid);
          }
        }

        // Actualizar preview en la lista lateral aunque no sea la conv activa
        const conv = this.conversations.find((c) => c.id === data.jid);
        if (conv) {
          conv.lastMessage = data.body || `[${data.type}]`;
          conv.timestamp = data.ts;
          if (!data.from_me && data.jid !== this.selectedJid) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }
        }
      });

      // Conversación actualizada (last_message, unread, etc.)
      socket.on('conversation:updated', (data) => {
        console.log('[WaInbox] conversation:updated', data.jid);
        if (String(data.companyId) !== myCompany) return;

        const conv = this.conversations.find((c) => c.id === data.jid);
        if (conv) {
          conv.lastMessage = data.last_message;
          conv.timestamp = data.last_ts;
          if (data.unread_delta && data.jid !== this.selectedJid) {
            conv.unreadCount = (conv.unreadCount || 0) + data.unread_delta;
          }
        } else {
          // Conversación nueva que no estaba en la lista
          this.fetchConversations();
        }
      });

      // Handoff: cambio de modo en la conversación
      socket.on('conversation:handoff', (data) => {
        console.log('[WaInbox] conversation:handoff', data.jid, data.mode);
        if (String(data.companyId) !== myCompany) return;

        const conv = this.conversations.find((c) => c.id === data.jid);
        if (conv) {
          conv.mode = data.mode;
          conv.aiEnabled = data.mode !== 'human';
        }
        if (this.selectedJid === data.jid) {
          this.selectedConv.mode = data.mode;
          this.selectedConv.aiEnabled = data.mode !== 'human';
          this.selectedConv.assignedTo = data.assignedTo || null;
        }
      });
    },

    teardownSocket() {
      const socket = this.$wsSocket;
      if (!socket) return;
      socket.off('message:new');
      socket.off('conversation:updated');
      socket.off('conversation:handoff');
    },

    async fetchConversations() {
      this.loadingConversations = true;
      try {
        const { data } = await this.$wsApi.get(`/chats/${this.idEmpresa}?limit=200`);
        this.conversations = data;
      } catch (e) {
        console.error("Error cargando conversaciones:", e);
      } finally {
        this.loadingConversations = false;
      }
    },

    async fetchAgents() {
      try {
        const { data } = await this.$wsApi.get(`/ai/agents/${this.idEmpresa}`);
        this.agents = data;
      } catch (_) { /* silencioso si no hay agentes */ }
    },

    async selectConversation(conv) {
      this.selectedJid = conv.id;
      this.selectedConv = conv;
      this.loadingMessages = true;
      try {
        // Marcar como leída
        await this.$wsApi.post(`/conversations/${this.idEmpresa}/${conv.id}/read`);
        conv.unreadCount = 0;
        // Notificar al sidebar para que decremente el badge
        this.$nuxt.$emit('wa:conv-read', conv.id);

        const { data } = await this.$wsApi.get(
          `/conversations/${this.idEmpresa}/${conv.id}/messages?limit=100`
        );
        this.messages = (data.messages || []).reverse();
        this.loadMediaForMessages(this.messages);
        this.$nextTick(() => this.scrollToBottom());
      } catch (e) {
        console.error("Error cargando mensajes:", e);
      } finally {
        this.loadingMessages = false;
      }
    },

    clearSelection() {
      this.selectedJid = null;
      this.selectedConv = {};
      this.messages = [];
    },

    async sendMessage() {
      const text = this.newMessage.trim();
      if (!text) return;
      if (this.inputDisabled) return;
      this.newMessage = "";

      const userId = this.currentUserId;
      // Enviamos el jid crudo para respetar formatos como @lid y evitar
      // reconstrucciones en el backend vía toJid() que romperían el envío.
      // Mantenemos `phone` por compatibilidad con backend antiguo.
      const jid = this.selectedJid;
      const phone = jid.replace(/@.*$/, "");

      try {
        const { data: resp } = await this.$wsApi.post(`/send-direct-message/${this.idEmpresa}`, {
          jid,
          phone,
          message: text,
          sent_by_user: userId,
        });
        // Agregar mensaje local con el wa_message_id real para evitar duplicados
        // cuando llegue el evento message:new por socket
        const sent = resp.data || {};
        this.messages.push({
          wa_message_id: sent.wa_message_id || `local-${Date.now()}`,
          from_me: true,
          body: text,
          type: "text",
          via: "human",
          status: sent.status || "sent",
          ts: sent.ts || Math.floor(Date.now() / 1000),
        });
        // Si el envío dispara handoff manual (sent_by_user), reflejarlo en UI
        if (userId) {
          this.selectedConv.mode = "human";
          this.selectedConv.aiEnabled = false;
          const conv = this.conversations.find((c) => c.id === this.selectedJid);
          if (conv) {
            conv.mode = "human";
            conv.aiEnabled = false;
          }
        }
        this.$nextTick(() => this.scrollToBottom());
      } catch (e) {
        console.error("[WaInbox] sendMessage error:", e.response?.status, e.response?.data, e);
        this.$bvToast.toast(
          (e.response?.data?.message || e.message) + ` (status ${e.response?.status || '?'})`,
          { title: "Error enviando mensaje", variant: "danger" }
        );
      }
    },

    // ---- Media (Fase B.1) ----
    async ensureMediaLoaded(msg) {
      if (!msg || !msg.wa_message_id) return;
      if (!this.mediaTypes.includes(msg.type)) return;
      if (msg.mediaBlobUrl || msg.mediaError) return;
      try {
        const resp = await this.$wsApi.get(
          `/media/${this.idEmpresa}/${encodeURIComponent(msg.wa_message_id)}`,
          { responseType: 'blob', timeout: 30000 }
        );
        const url = URL.createObjectURL(resp.data);
        this.$set(msg, 'mediaBlobUrl', url);
      } catch (e) {
        console.warn('[WaInbox] loadMedia error', msg.wa_message_id, e.message);
        this.$set(msg, 'mediaError', true);
      }
    },

    loadMediaForMessages(list) {
      for (const m of list || []) {
        if (this.mediaTypes.includes(m.type)) this.ensureMediaLoaded(m);
      }
    },

    openMedia(url) {
      if (url) window.open(url, '_blank');
    },

    onMediaElementError(msg, kind, ev) {
      // Disparado cuando <audio>/<video> no logra cargar el blob (codec
      // no soportado, archivo corrupto, etc.). Marcamos el mensaje como
      // mediaError para mostrar el aviso y log a consola para debug.
      const code = ev?.target?.error?.code;
      console.warn(`[WaInbox] ${kind} element error`, msg.wa_message_id, 'code:', code);
      this.$set(msg, 'mediaError', true);
      this.$set(msg, 'mediaBlobUrl', null);
    },

    async onFileSelected(event) {
      const file = event.target.files && event.target.files[0];
      event.target.value = ''; // permitir re-seleccionar el mismo archivo
      if (!file) return;
      await this.uploadFile(file);
    },

    async uploadFile(file) {
      if (this.uploadingFile) return;
      if (this.inputDisabled) return;

      const MAX = 16 * 1024 * 1024; // 16 MB
      if (file.size > MAX) {
        this.$bvToast.toast(
          `El archivo excede 16 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
          { title: 'Archivo demasiado grande', variant: 'warning' }
        );
        return;
      }

      let type;
      if (/^image\//i.test(file.type)) type = 'image';
      else if (/^video\//i.test(file.type)) type = 'video';
      else if (/^audio\//i.test(file.type)) type = 'audio';
      else type = 'document';

      this.uploadingFile = true;
      try {
        const jid = this.selectedJid;
        const phone = jid.replace(/@.*$/, '');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('phone', phone);
        fd.append('jid', jid);
        fd.append('type', type);
        const caption = this.newMessage.trim();
        if (caption) fd.append('caption', caption);
        if (this.currentUserId) fd.append('sentByUser', String(this.currentUserId));

        await this.$wsApi.post(`/send-media/${this.idEmpresa}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
        });

        // Caption consumida
        if (caption) this.newMessage = '';

        // Reflejar handoff manual en UI si aplica
        if (this.currentUserId) {
          this.selectedConv.mode = 'human';
          this.selectedConv.aiEnabled = false;
          const conv = this.conversations.find((c) => c.id === this.selectedJid);
          if (conv) {
            conv.mode = 'human';
            conv.aiEnabled = false;
          }
        }
        // El evento message:new del socket insertará el mensaje en la lista.
      } catch (e) {
        console.error('[WaInbox] uploadFile error:', e.response?.status, e.response?.data, e);
        this.$bvToast.toast(
          (e.response?.data?.message || e.message) + ` (status ${e.response?.status || '?'})`,
          { title: 'Error enviando archivo', variant: 'danger' }
        );
      } finally {
        this.uploadingFile = false;
      }
    },

    // ---- Grabación de notas de voz (Fase B.2) ----
    pickRecordingMime() {
      // Preferimos opus para compatibilidad con WhatsApp (ogg/opus es el nativo).
      // Chrome/Firefox graban en webm/opus. Safari en mp4/aac.
      const candidates = [
        'audio/ogg;codecs=opus',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];
      if (typeof MediaRecorder === 'undefined') return '';
      for (const mime of candidates) {
        try {
          if (MediaRecorder.isTypeSupported(mime)) return mime;
        } catch (_) {}
      }
      return '';
    },

    extFromMime(mime) {
      const m = (mime || '').toLowerCase();
      if (m.includes('ogg')) return 'ogg';
      if (m.includes('mp4') || m.includes('aac')) return 'm4a';
      if (m.includes('webm')) return 'webm';
      return 'bin';
    },

    formatRecTime(secs) {
      const s = Math.floor(secs || 0);
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    },

    async startRecording() {
      if (this.recording || this.uploadingFile) return;
      if (this.inputDisabled) return;
      if (!navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
        this.$bvToast.toast(
          'Tu navegador no soporta grabación de audio.',
          { title: 'No disponible', variant: 'warning' }
        );
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this._recStream = stream;
        const mimeType = this.pickRecordingMime();
        this._mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        this._recChunks = [];
        this._recCancelled = false;

        this._mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) this._recChunks.push(e.data);
        };
        this._mediaRecorder.onstop = () => {
          // Cerrar pista del micrófono
          if (this._recStream) {
            this._recStream.getTracks().forEach((t) => t.stop());
            this._recStream = null;
          }
          clearInterval(this._recTimer);
          this._recTimer = null;
          const wasCancelled = this._recCancelled;
          const seconds = Math.max(1, Math.round(this.recordingTime));
          const mime = this._mediaRecorder.mimeType || 'audio/webm';
          const chunks = this._recChunks;
          this._recChunks = [];
          this.recording = false;
          this.recordingTime = 0;
          if (wasCancelled || !chunks.length) return;
          const blob = new Blob(chunks, { type: mime });
          this.sendVoiceNote(blob, seconds);
        };

        this._mediaRecorder.start();
        this.recording = true;
        this.recordingTime = 0;
        this._recStartAt = Date.now();
        this._recTimer = setInterval(() => {
          this.recordingTime = (Date.now() - this._recStartAt) / 1000;
          if (this.recordingTime >= this._recMaxSeconds) this.stopRecording();
        }, 200);
      } catch (e) {
        console.error('[WaInbox] startRecording error:', e);
        this.$bvToast.toast(
          'No se pudo acceder al micrófono. Concede permisos en el navegador y vuelve a intentar.',
          { title: 'Micrófono bloqueado', variant: 'danger' }
        );
      }
    },

    stopRecording() {
      if (!this._mediaRecorder || this._mediaRecorder.state === 'inactive') return;
      this._recCancelled = false;
      try { this._mediaRecorder.stop(); } catch (_) {}
    },

    cancelRecording() {
      if (!this._mediaRecorder || this._mediaRecorder.state === 'inactive') {
        // Por si el timer arrancó pero el recorder nunca arrancó
        if (this._recStream) {
          this._recStream.getTracks().forEach((t) => t.stop());
          this._recStream = null;
        }
        clearInterval(this._recTimer);
        this._recTimer = null;
        this.recording = false;
        this.recordingTime = 0;
        return;
      }
      this._recCancelled = true;
      try { this._mediaRecorder.stop(); } catch (_) {}
    },

    async sendVoiceNote(blob, seconds) {
      if (this.uploadingFile) return;
      if (this.inputDisabled) return;

      const MAX = 16 * 1024 * 1024;
      if (blob.size > MAX) {
        this.$bvToast.toast(
          `La nota de voz excede 16 MB (${(blob.size / 1024 / 1024).toFixed(1)} MB).`,
          { title: 'Demasiado larga', variant: 'warning' }
        );
        return;
      }

      this.uploadingFile = true;
      try {
        const jid = this.selectedJid;
        const phone = jid.replace(/@.*$/, '');
        const mime = blob.type || 'audio/webm';
        const ext = this.extFromMime(mime);
        const fd = new FormData();
        fd.append('file', blob, `voice-${Date.now()}.${ext}`);
        fd.append('phone', phone);
        fd.append('jid', jid);
        fd.append('type', 'audio');
        fd.append('ptt', 'true');
        fd.append('seconds', String(seconds));
        if (this.currentUserId) fd.append('sentByUser', String(this.currentUserId));

        await this.$wsApi.post(`/send-media/${this.idEmpresa}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
        });

        if (this.currentUserId) {
          this.selectedConv.mode = 'human';
          this.selectedConv.aiEnabled = false;
          const conv = this.conversations.find((c) => c.id === this.selectedJid);
          if (conv) {
            conv.mode = 'human';
            conv.aiEnabled = false;
          }
        }
      } catch (e) {
        console.error('[WaInbox] sendVoiceNote error:', e.response?.status, e.response?.data, e);
        this.$bvToast.toast(
          (e.response?.data?.message || e.message) + ` (status ${e.response?.status || '?'})`,
          { title: 'Error enviando nota de voz', variant: 'danger' }
        );
      } finally {
        this.uploadingFile = false;
      }
    },

    async takeConversation() {
      const userId = this.currentUserId;
      if (!userId) {
        this.$bvToast.toast(
          "No se pudo identificar al usuario. Vuelve a iniciar sesión.",
          { title: "Error", variant: "danger" }
        );
        return;
      }
      try {
        await this.$wsApi.post(`/conversations/${this.idEmpresa}/${this.selectedJid}/assign`, {
          userId,
        });
        this.selectedConv.mode = "human";
        this.selectedConv.aiEnabled = false;
        const conv = this.conversations.find((c) => c.id === this.selectedJid);
        if (conv) {
          conv.mode = "human";
          conv.aiEnabled = false;
        }
        this.$bvToast.toast("Has tomado la conversación", { variant: "info" });
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error",
          variant: "danger",
        });
      }
    },

    async releaseConversation() {
      try {
        await this.$wsApi.post(`/conversations/${this.idEmpresa}/${this.selectedJid}/release`);
        this.selectedConv.mode = "hybrid";
        this.selectedConv.aiEnabled = true;
        const conv = this.conversations.find((c) => c.id === this.selectedJid);
        if (conv) {
          conv.mode = "hybrid";
          conv.aiEnabled = true;
        }
        this.$bvToast.toast("Conversación devuelta a la IA", { variant: "success" });
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error",
          variant: "danger",
        });
      }
    },

    async assignAgent(agentId) {
      try {
        await this.$wsApi.post(`/conversations/${this.idEmpresa}/${this.selectedJid}/agent`, {
          agentId,
        });
        const agent = this.agents.find((a) => a.id === agentId);
        this.selectedConv.aiAgentId = agentId;
        this.selectedConv.agentName = agent ? agent.name : null;
        this.$bvToast.toast(
          agentId ? `Agente "${agent.name}" asignado` : "Agente desvinculado (usará default)",
          { variant: "info" }
        );
        await this.fetchConversations();
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error",
          variant: "danger",
        });
      }
    },

    filterConversations() { /* reactivo via computed */ },

    scrollToBottom() {
      const el = this.$refs.messagesContainer;
      if (el) el.scrollTop = el.scrollHeight;
    },

    formatPhone(jid) {
      if (!jid) return "";
      return "+" + jid.replace(/@.*/, "");
    },

    formatTime(ts) {
      if (!ts) return "";
      const d = new Date(ts * 1000);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
      }
      return d.toLocaleDateString("es", { day: "2-digit", month: "short" });
    },

    formatMessageTime(ts) {
      if (!ts) return "";
      return new Date(ts * 1000).toLocaleTimeString("es", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    statusIcon(status) {
      const map = { sent: "check", delivered: "check-all", read: "check-all", failed: "x-circle", pending: "clock" };
      return map[status] || "check";
    },

    statusVariant(status) {
      return status === "read" ? "primary" : status === "failed" ? "danger" : "secondary";
    },
  },
};
</script>

<style lang="scss" scoped>
.wa-inbox {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  height: calc(100vh - 140px);
  min-height: 500px;
  background: #fff;
}

.wa-inbox-row {
  height: 100%;
}

.wa-sidebar-panel {
  border-right: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.wa-sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.wa-conversations-list {
  flex: 1;
  overflow-y: auto;
}

.wa-conv-item {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(23, 162, 184, 0.05);
  }

  &.active {
    background: rgba(23, 162, 184, 0.12);
    border-left: 3px solid #17a2b8;
  }
}

.wa-conv-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.wa-conv-preview {
  max-width: 180px;
}

.wa-conv-time {
  font-size: 0.7rem;
  white-space: nowrap;
}

.wa-chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.wa-chat-header {
  padding: 10px 16px;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.wa-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #e5ddd5;
}

.wa-message {
  margin-bottom: 8px;
  display: flex;

  &.wa-message-out {
    justify-content: flex-end;

    .wa-bubble {
      background: #dcf8c6;
      border-radius: 8px 0 8px 8px;
    }
  }

  &.wa-message-in {
    justify-content: flex-start;

    .wa-bubble {
      background: #fff;
      border-radius: 0 8px 8px 8px;
    }
  }
}

.wa-bubble {
  max-width: 65%;
  padding: 6px 10px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.wa-via {
  display: block;
  font-weight: 600;
  color: #17a2b8;
  font-size: 0.7rem;
  margin-bottom: 2px;
}

.wa-body {
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.wa-media-image {
  display: block;
  max-width: 260px;
  max-height: 260px;
  border-radius: 6px;
  cursor: zoom-in;
  object-fit: cover;
}

.wa-media-sticker {
  max-width: 140px;
  max-height: 140px;
  background: transparent;
  cursor: default;
}

.wa-media-audio {
  display: block;
  /* Ancho explícito para que el control HTML5 no colapse cuando la
     burbuja padre no fija ancho. Sin esto Chrome muestra solo el botón
     play y el menú de 3 puntos. */
  width: 260px;
  max-width: 100%;
  min-height: 40px;
}

.wa-media-video {
  display: block;
  /* width explícito + min-height para que el <video> no colapse a 0×0
     mientras la metadata aún no carga. */
  width: 300px;
  max-width: 100%;
  height: auto;
  min-height: 180px;
  max-height: 320px;
  background: #000;
  border-radius: 6px;
  object-fit: contain;
}

.wa-media-doc {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  color: #0c5460;
  text-decoration: none;
  font-size: 0.85rem;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    color: #17a2b8;
  }
}

.wa-media-loading,
.wa-media-error {
  font-size: 0.8rem;
  color: #666;
  padding: 4px 0;
}

.wa-media-error {
  color: #b02a37;
}

.wa-recording-indicator {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(220, 53, 69, 0.08);
  border: 1px dashed #dc3545;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #842029;
}

.recording-pulse {
  animation: wa-rec-pulse 1s ease-in-out infinite;
}

@keyframes wa-rec-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

.wa-meta {
  text-align: right;
  margin-top: 2px;
  font-size: 0.7rem;
  color: #999;
}

.wa-input-bar {
  padding: 10px 12px;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.wa-input-locked {
  padding: 10px 14px;
  background: #e9f5f9;
  border: 1px dashed #17a2b8;
  border-radius: 6px;
  color: #0c5460;
  font-size: 0.85rem;
}

.wa-empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f0f0f0;
}

.wa-back-btn {
  color: #17a2b8;
  line-height: 1;

  &:hover,
  &:focus {
    color: #117a8b;
    text-decoration: none;
  }
}

.wa-chat-title {
  word-break: break-word;
}

/* --- Responsive: mobile one-pane view (WhatsApp-style) --- */
@media (max-width: 767.98px) {
  /* En móvil fijamos el inbox al viewport real debajo del mobile-header
     sticky (≈50px). Así evitamos que el tamaño del .main-wrapper padre
     (min-height:100vh) o cualquier padding intermedio empujen el input
     bar fuera del fold. */
  .wa-inbox {
    position: fixed;
    top: 50px;          // altura aprox del mobile-header sticky
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    min-height: 0;
    border-radius: 0;
    border: 0;
    z-index: 1020;      // debajo del mobile-header (1030) y del overlay (1035)
  }

  .wa-inbox-row {
    height: 100%;
    min-height: 0;
    margin: 0;
  }

  .wa-sidebar-panel,
  .wa-chat-panel {
    min-height: 0;
    padding: 0;
    /* La altura viene del row padre (100% del inbox fixed) */
    height: 100%;
  }

  .wa-chat-header {
    flex: 0 0 auto;
  }

  .wa-messages {
    flex: 1 1 auto;
    min-height: 0;
    /* Scroll interno suave para el chat, sin arrastrar el body */
    -webkit-overflow-scrolling: touch;
  }

  .wa-input-bar {
    flex: 0 0 auto;
    /* Pequeño safe-area para iPhones con barra home */
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0));
  }

  .wa-conversations-list {
    -webkit-overflow-scrolling: touch;
  }

  /* Sin conversación seleccionada: solo lista */
  .wa-inbox:not(.wa-chat-open) {
    .wa-sidebar-panel {
      border-right: 0;
    }
    .wa-chat-panel {
      display: none;
    }
  }

  /* Conversación abierta: solo chat */
  .wa-inbox.wa-chat-open {
    .wa-sidebar-panel {
      display: none;
    }
    .wa-chat-panel {
      display: flex;
    }
  }

  .wa-chat-header {
    padding: 8px 10px;

    strong.wa-chat-title {
      font-size: 0.95rem;
    }
    .btn-sm {
      font-size: 0.75rem;
      padding: 0.2rem 0.4rem;
    }
    .badge {
      font-size: 0.65rem;
    }
    .wa-chat-header-row {
      gap: 6px;
    }
    .wa-chat-header-title {
      flex: 1 1 100%;
      min-width: 0;
    }
  }

  .wa-messages {
    padding: 10px;
  }

  .wa-bubble {
    max-width: 85%;
  }

  .wa-media-image {
    max-width: 100%;
    max-height: 320px;
  }

  .wa-media-video {
    max-width: 100%;
    max-height: 320px;
  }

  .wa-media-audio {
    max-width: 100%;
  }

  .wa-conv-preview {
    max-width: none;
  }

  .wa-input-bar {
    padding: 8px;
  }
}
</style>
