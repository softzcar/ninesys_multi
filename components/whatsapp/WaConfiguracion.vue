<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <b-spinner variant="info" />
      <p class="mt-2 text-muted">Cargando configuración...</p>
    </div>

    <!-- Error de carga -->
    <b-alert v-else-if="loadError" variant="danger" show>
      {{ loadError }}
      <b-button size="sm" variant="outline-danger" class="ml-2" @click="fetchSettings">
        Reintentar
      </b-button>
    </b-alert>

    <div v-else>
      <!-- Switch global IA -->
      <b-card class="mb-4 border-0 shadow-sm">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">Asistente IA</h5>
            <p class="text-muted mb-0">
              Interruptor maestro. Si está apagado, ninguna conversación recibirá auto-respuestas.
            </p>
          </div>
          <b-form-checkbox
            v-model="form.enabled"
            switch
            size="lg"
            @change="toggleGlobal"
          >
            <b-badge :variant="form.enabled ? 'success' : 'secondary'">
              {{ form.enabled ? 'Activo' : 'Inactivo' }}
            </b-badge>
          </b-form-checkbox>
        </div>
      </b-card>

      <!-- Configuración del modelo -->
      <b-card class="mb-4 border-0 shadow-sm" header="Modelo de IA">
        <b-row>
          <b-col md="6">
            <b-form-group label="Proveedor" label-for="cfg-provider">
              <b-form-select
                id="cfg-provider"
                v-model="form.provider"
                :options="providerOptions"
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Modelo" label-for="cfg-model">
              <b-form-select
                id="cfg-model"
                v-model="form.model"
                :options="modelOptions"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="6">
            <b-form-group
              label="Temperatura"
              label-for="cfg-temp"
              :description="`Creatividad: ${form.temperature} (0 = preciso, 1 = creativo)`"
            >
              <b-form-input
                id="cfg-temp"
                v-model.number="form.temperature"
                type="range"
                min="0"
                max="1"
                step="0.05"
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group
              label="Max Tokens"
              label-for="cfg-tokens"
              description="Longitud máxima de cada respuesta de la IA."
            >
              <b-form-input
                id="cfg-tokens"
                v-model.number="form.max_tokens"
                type="number"
                min="100"
                max="4096"
              />
            </b-form-group>
          </b-col>
        </b-row>
      </b-card>

      <!-- Prompt del sistema -->
      <b-card class="mb-4 border-0 shadow-sm" header="Prompt del Sistema (global)">
        <b-form-group
          description="Define el comportamiento base de la IA cuando no hay un agente específico asignado a la conversación. Los agentes individuales tienen su propio prompt."
        >
          <b-form-textarea
            v-model="form.system_prompt"
            rows="6"
            placeholder="Eres un asistente virtual de la empresa. Tu objetivo es atender las consultas de los clientes de forma amable y eficiente..."
          />
        </b-form-group>
      </b-card>

      <!-- Base de conocimiento -->
      <b-card class="mb-4 border-0 shadow-sm" header="Base de Conocimiento (global)">
        <b-form-group
          description="Información general de la empresa que la IA debe conocer: productos, horarios, políticas, precios, etc. Formato JSON."
        >
          <b-form-textarea
            v-model="knowledgeBaseText"
            rows="6"
            :state="kbValid"
            placeholder='{ "empresa": "Mi Empresa", "horario": "Lun-Vie 8am-5pm", "productos": [...] }'
          />
          <b-form-invalid-feedback>
            El contenido debe ser un JSON válido.
          </b-form-invalid-feedback>
        </b-form-group>
      </b-card>

      <!-- Opciones adicionales -->
      <b-card class="mb-4 border-0 shadow-sm" header="Opciones adicionales">
        <b-form-checkbox v-model="form.respond_in_groups" switch class="mb-3">
          Responder en grupos de WhatsApp
          <small class="text-muted d-block">
            Si está activo, la IA también responderá en conversaciones grupales.
          </small>
        </b-form-checkbox>

        <b-form-checkbox v-model="form.always_ai" switch>
          IA siempre activa (sin pasar a modo humano)
          <small class="text-muted d-block">
            <strong>Desactivado (predeterminado):</strong> cuando se genera un presupuesto o
            se dispara un evento de atención, la conversación pasa automáticamente a un
            asesor humano y la IA deja de responder.<br>
            <strong>Activado:</strong> la IA sigue respondiendo en todas las conversaciones
            sin excepción. El sistema igual notifica al asesor asignado en cada evento, pero
            no silencia al bot ni cambia el modo de la conversación.
          </small>
        </b-form-checkbox>
      </b-card>

      <!-- Botón guardar -->
      <div class="d-flex justify-content-end mb-4">
        <b-button variant="outline-secondary" class="mr-2" @click="fetchSettings" :disabled="saving">
          Descartar cambios
        </b-button>
        <b-button variant="info" @click="saveSettings" :disabled="saving || !hasChanges">
          <b-spinner v-if="saving" small class="mr-1" />
          {{ saving ? 'Guardando...' : 'Guardar configuración' }}
        </b-button>
      </div>

      <!-- Consumo de IA y transcripciones -->
      <b-card class="mb-4 border-0 shadow-sm">
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <span><b-icon icon="bar-chart-fill" class="mr-2" />Consumo de IA y transcripciones</span>
            <div class="d-flex align-items-center">
              <b-form-select
                v-model="selectedUsageMonth"
                :options="usageMonthOptions"
                size="sm"
                style="width:140px"
                class="mr-2"
                @change="fetchSttUsage"
              />
              <b-button size="sm" variant="outline-secondary" :disabled="loadingStt" @click="fetchSttUsage">
                <b-spinner v-if="loadingStt" small />
                <b-icon v-else icon="arrow-clockwise" />
              </b-button>
            </div>
          </div>
        </template>

        <div v-if="loadingStt" class="text-center py-3">
          <b-spinner variant="secondary" small />
        </div>
        <div v-else-if="sttUsage">
          <b-row class="mb-3">
            <b-col sm="6" class="mb-3 mb-sm-0">
              <div class="border rounded p-3 h-100">
                <div class="text-muted small mb-1">
                  <b-icon icon="mic-fill" class="mr-1" />Whisper (STT)
                </div>
                <div class="h4 mb-0 font-weight-bold">
                  ${{ whisperUsd.toFixed(4) }}
                </div>
                <div class="small text-muted">{{ whisperCalls }} transcripción(es)</div>
                <b-progress
                  class="mt-2"
                  :value="whisperPercent"
                  :max="100"
                  :variant="whisperPercent >= 90 ? 'danger' : whisperPercent >= 70 ? 'warning' : 'success'"
                  height="6px"
                />
                <div class="small text-muted mt-1">
                  ${{ whisperUsd.toFixed(4) }} / ${{ sttConfig.stt_monthly_usd_limit.toFixed(2) }} límite mensual
                </div>
              </div>
            </b-col>
            <b-col sm="6">
              <div class="border rounded p-3 h-100">
                <div class="text-muted small mb-1">
                  <b-icon icon="cpu-fill" class="mr-1" />Gemini (LLM)
                </div>
                <div class="h4 mb-0 font-weight-bold">
                  ${{ geminiUsd.toFixed(4) }}
                </div>
                <div class="small text-muted">{{ geminiCalls }} llamada(s)</div>
              </div>
            </b-col>
          </b-row>
          <div class="text-right small text-muted">
            Total del mes: <strong>${{ sttUsage.total_usd.toFixed(4) }}</strong>
          </div>
        </div>
        <div v-else class="text-center text-muted py-3 small">Sin datos de consumo para este mes.</div>
      </b-card>

      <!-- Configuración de transcripciones (STT) -->
      <b-card class="mb-4 border-0 shadow-sm" header="Transcripción de notas de voz (Whisper)">
        <b-row>
          <b-col md="12" class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>Activar transcripción automática</strong>
                <p class="text-muted small mb-0">
                  Convierte notas de voz entrantes en texto para que la IA pueda responderlas.
                </p>
              </div>
              <b-form-checkbox
                v-model="sttConfig.stt_enabled"
                switch
                size="lg"
              >
                <b-badge :variant="sttConfig.stt_enabled ? 'success' : 'secondary'">
                  {{ sttConfig.stt_enabled ? 'Activa' : 'Inactiva' }}
                </b-badge>
              </b-form-checkbox>
            </div>
          </b-col>
          <b-col md="4">
            <b-form-group
              label="Límite mensual (USD)"
              label-for="stt-limit"
              description="Al alcanzar este gasto, los audios se pasan a un agente humano."
            >
              <b-form-input
                id="stt-limit"
                v-model.number="sttConfig.stt_monthly_usd_limit"
                type="number"
                min="0"
                step="0.5"
              />
            </b-form-group>
          </b-col>
          <b-col md="4">
            <b-form-group
              label="Umbral de audio largo (seg)"
              label-for="stt-seconds"
              description="Notas de voz más largas se pasan a humano sin transcribir."
            >
              <b-form-input
                id="stt-seconds"
                v-model.number="sttConfig.stt_long_audio_seconds"
                type="number"
                min="10"
                step="10"
              />
            </b-form-group>
          </b-col>
          <b-col md="4">
            <b-form-group
              label="Idioma de transcripción"
              label-for="stt-lang"
              description="Hint para Whisper. Vacío = autodetección."
            >
              <b-form-select
                id="stt-lang"
                v-model="sttConfig.stt_language"
                :options="sttLanguageOptions"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-end">
          <b-button variant="info" :disabled="savingStt" @click="saveSttConfig">
            <b-spinner v-if="savingStt" small class="mr-1" />
            {{ savingStt ? 'Guardando...' : 'Guardar configuración STT' }}
          </b-button>
        </div>
      </b-card>

      <!-- Papelera de conversaciones -->
      <b-card class="mb-4 border-0 shadow-sm">
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <span>
              <b-icon icon="trash" class="mr-2" />
              Papelera de conversaciones
              <b-badge variant="secondary" class="ml-1">{{ deletedChats.length }}</b-badge>
            </span>
            <div>
              <b-button size="sm" variant="outline-secondary" @click="fetchDeleted" :disabled="loadingDeleted" class="mr-1">
                <b-spinner v-if="loadingDeleted" small /> Recargar
              </b-button>
              <b-button
                size="sm"
                variant="outline-danger"
                :disabled="deletedChats.length === 0 || purgingAll"
                @click="confirmPurgeAll"
              >
                Purgar todo
              </b-button>
            </div>
          </div>
        </template>

        <p class="text-muted small">
          Aquí aparecen los chats que eliminaste desde la bandeja. Puedes restaurarlos
          o purgarlos de forma definitiva (borrado físico en base de datos y archivos).
          La purga es <strong>irreversible</strong>.
        </p>

        <b-table
          v-if="deletedChats.length"
          :items="deletedChats"
          :fields="deletedFields"
          small
          striped
          hover
          responsive
        >
          <template #cell(name)="row">
            <strong>{{ row.item.name || formatPhone(row.item.id) }}</strong>
            <small class="d-block text-muted">{{ row.item.id }}</small>
          </template>
          <template #cell(deletedAt)="row">
            {{ formatDate(row.item.deletedAt) }}
          </template>
          <template #cell(actions)="row">
            <b-button
              size="sm"
              variant="outline-success"
              class="mr-1"
              :disabled="busyJid === row.item.id"
              @click="restoreChat(row.item)"
            >
              Restaurar
            </b-button>
            <b-button
              size="sm"
              variant="outline-danger"
              :disabled="busyJid === row.item.id"
              @click="confirmPurge(row.item)"
            >
              Purgar
            </b-button>
          </template>
        </b-table>

        <div v-else class="text-center text-muted py-3">
          <em>No hay conversaciones en la papelera.</em>
        </div>
      </b-card>

      <!-- Modal: purga individual -->
      <b-modal
        v-model="showPurgeModal"
        title="Purgar conversación"
        ok-title="Purgar definitivamente"
        ok-variant="danger"
        cancel-title="Cancelar"
        @ok="purgeChat"
      >
        <p>
          Vas a <strong>eliminar definitivamente</strong> la conversación con
          <strong>{{ purgeTarget?.name || formatPhone(purgeTarget?.id) }}</strong>.
        </p>
        <p class="text-danger">
          Se borrarán todos los mensajes y archivos multimedia asociados del servidor.
          Esta acción no se puede deshacer.
        </p>
      </b-modal>

      <!-- Modal: purga masiva (doble confirmación) -->
      <b-modal
        v-model="showPurgeAllModal"
        title="Purgar TODA la papelera"
        ok-title="Sí, borrar todo definitivamente"
        ok-variant="danger"
        cancel-title="Cancelar"
        :ok-disabled="purgeAllConfirmText !== 'PURGAR'"
        @ok="purgeAllChats"
      >
        <p>
          Vas a <strong>eliminar definitivamente {{ deletedChats.length }} conversación(es)</strong>
          y todos sus mensajes/archivos multimedia.
        </p>
        <p class="text-danger">Esta acción no se puede deshacer.</p>
        <b-form-group label="Escribe PURGAR para confirmar:">
          <b-form-input v-model="purgeAllConfirmText" placeholder="PURGAR" />
        </b-form-group>
      </b-modal>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "WaConfiguracion",
  data() {
    return {
      loading: false,
      saving: false,
      loadError: null,
      form: {
        enabled: false,
        provider: "gemini",
        model: "gemini-2.5-flash",
        system_prompt: "",
        temperature: 0.3,
        max_tokens: 1024,
        respond_in_groups: false,
        always_ai: false,
      },
      // Snapshot para detectar cambios
      originalForm: null,
      knowledgeBaseText: "",
      originalKbText: "",
      providerOptions: [
        { value: "gemini", text: "Google Gemini" },
        { value: "anthropic", text: "Anthropic Claude" },
      ],
      modelOptions: [
        { value: "gemini-2.5-flash", text: "Gemini 2.5 Flash" },
        { value: "gemini-2.0-flash", text: "Gemini 2.0 Flash" },
        { value: "gemini-1.5-pro", text: "Gemini 1.5 Pro" },
      ],
      // STT
      sttConfig: {
        stt_enabled: true,
        stt_monthly_usd_limit: 3.00,
        stt_long_audio_seconds: 120,
        stt_language: 'es',
      },
      sttUsage: null,
      loadingStt: false,
      savingStt: false,
      selectedUsageMonth: '',
      sttLanguageOptions: [
        { value: 'es', text: 'Español (es)' },
        { value: 'en', text: 'Inglés (en)' },
        { value: 'pt', text: 'Portugués (pt)' },
        { value: 'fr', text: 'Francés (fr)' },
        { value: '', text: 'Autodetección' },
      ],
      // Papelera
      deletedChats: [],
      loadingDeleted: false,
      busyJid: null,
      showPurgeModal: false,
      showPurgeAllModal: false,
      purgingAll: false,
      purgeTarget: null,
      purgeAllConfirmText: "",
      deletedFields: [
        { key: "name", label: "Contacto" },
        { key: "deletedAt", label: "Eliminado" },
        { key: "actions", label: "Acciones", class: "text-right" },
      ],
    };
  },
  computed: {
    ...mapState("login", ["idEmpresa"]),
    kbValid() {
      if (!this.knowledgeBaseText || !this.knowledgeBaseText.trim()) return null;
      try {
        JSON.parse(this.knowledgeBaseText);
        return true;
      } catch (_) {
        return false;
      }
    },
    usageMonthOptions() {
      const opts = [];
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const val = `${y}-${m}`;
        opts.push({ value: val, text: `${y}/${m}` });
      }
      return opts;
    },
    whisperUsd() {
      if (!this.sttUsage) return 0;
      const p = this.sttUsage.providers.find((x) => x.provider === 'whisper');
      return p ? p.usd : 0;
    },
    whisperCalls() {
      if (!this.sttUsage) return 0;
      const p = this.sttUsage.providers.find((x) => x.provider === 'whisper');
      return p ? p.call_count : 0;
    },
    geminiUsd() {
      if (!this.sttUsage) return 0;
      const p = this.sttUsage.providers.find((x) => x.provider === 'gemini');
      return p ? p.usd : 0;
    },
    geminiCalls() {
      if (!this.sttUsage) return 0;
      const p = this.sttUsage.providers.find((x) => x.provider === 'gemini');
      return p ? p.call_count : 0;
    },
    whisperPercent() {
      const limit = this.sttConfig.stt_monthly_usd_limit;
      if (!limit) return 0;
      return Math.min(100, Math.round((this.whisperUsd / limit) * 100));
    },
    hasChanges() {
      if (!this.originalForm) return false;
      const fields = [
        "provider",
        "model",
        "system_prompt",
        "temperature",
        "max_tokens",
        "respond_in_groups",
        "always_ai",
      ];
      for (const f of fields) {
        if (this.form[f] !== this.originalForm[f]) return true;
      }
      if (this.knowledgeBaseText !== this.originalKbText) return true;
      return false;
    },
  },
  mounted() {
    this.fetchSettings();
    this.fetchDeleted();
    // Inicializar mes seleccionado al mes actual
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    this.selectedUsageMonth = `${now.getFullYear()}-${m}`;
    this.fetchSttConfig();
    this.fetchSttUsage();
  },
  methods: {
    async fetchSettings() {
      this.loading = true;
      this.loadError = null;
      try {
        const { data } = await this.$wsApi.get(
          `/ai/settings/${this.idEmpresa}`
        );
        this.applyData(data);
      } catch (e) {
        this.loadError =
          "Error cargando configuración: " +
          (e.response?.data?.message || e.message);
      } finally {
        this.loading = false;
      }
    },

    applyData(data) {
      this.form.enabled = !!data.enabled;
      this.form.provider = data.provider || "gemini";
      this.form.model = data.model || "gemini-2.5-flash";
      // El backend devuelve camelCase (systemPrompt) — aceptar ambos formatos
      this.form.system_prompt = data.systemPrompt || data.system_prompt || "";
      this.form.temperature =
        data.temperature != null ? Number(data.temperature) : 0.3;
      this.form.max_tokens =
        (data.maxTokens != null ? Number(data.maxTokens) : null) ??
        (data.max_tokens != null ? Number(data.max_tokens) : 1024);
      this.form.respond_in_groups = !!(data.respondInGroups ?? data.respond_in_groups);
      this.form.always_ai = !!(data.alwaysAi ?? data.always_ai);

      const kb = data.knowledgeBase ?? data.knowledge_base ?? null;
      if (kb && typeof kb === "object") {
        this.knowledgeBaseText = JSON.stringify(kb, null, 2);
      } else if (typeof kb === "string") {
        this.knowledgeBaseText = kb;
      } else {
        this.knowledgeBaseText = "";
      }

      // Guardar snapshot
      this.originalForm = { ...this.form };
      this.originalKbText = this.knowledgeBaseText;
    },

    async toggleGlobal(enabled) {
      try {
        await this.$wsApi.post(`/ai/toggle/${this.idEmpresa}`, { enabled });
        this.$bvToast.toast(
          enabled ? "IA activada globalmente" : "IA desactivada globalmente",
          {
            title: "Configuración IA",
            variant: enabled ? "success" : "warning",
          }
        );
        // Actualizar snapshot para que el toggle no cuente como "cambio pendiente"
        this.originalForm = { ...this.originalForm, enabled };
      } catch (e) {
        // Revertir el switch visualmente
        this.form.enabled = !enabled;
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error",
          variant: "danger",
        });
      }
    },

    async saveSettings() {
      // Validar KB si tiene contenido
      if (this.knowledgeBaseText && this.knowledgeBaseText.trim()) {
        try {
          JSON.parse(this.knowledgeBaseText);
        } catch (_) {
          this.$bvToast.toast(
            "La base de conocimiento no es un JSON válido.",
            { title: "Error de validación", variant: "warning" }
          );
          return;
        }
      }

      this.saving = true;
      try {
        const payload = {
          provider: this.form.provider,
          model: this.form.model,
          system_prompt: this.form.system_prompt || null,
          temperature: this.form.temperature,
          max_tokens: this.form.max_tokens,
          respond_in_groups: this.form.respond_in_groups ? 1 : 0,
          always_ai: this.form.always_ai ? 1 : 0,
          knowledge_base: this.knowledgeBaseText.trim()
            ? JSON.parse(this.knowledgeBaseText)
            : null,
        };

        const { data } = await this.$wsApi.put(
          `/ai/settings/${this.idEmpresa}`,
          payload
        );
        this.applyData(data);
        this.$bvToast.toast("Configuración guardada correctamente.", {
          title: "Configuración IA",
          variant: "success",
        });
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error guardando configuración",
          variant: "danger",
        });
      } finally {
        this.saving = false;
      }
    },

    // ---------- STT ----------
    async fetchSttConfig() {
      try {
        const { data } = await this.$wsApi.get(`/stt/config/${this.idEmpresa}`);
        this.sttConfig.stt_enabled = !!data.stt_enabled;
        this.sttConfig.stt_monthly_usd_limit = Number(data.stt_monthly_usd_limit) || 3;
        this.sttConfig.stt_long_audio_seconds = Number(data.stt_long_audio_seconds) || 120;
        this.sttConfig.stt_language = data.stt_language || 'es';
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: 'Error cargando config STT', variant: 'danger',
        });
      }
    },

    async saveSttConfig() {
      this.savingStt = true;
      try {
        const { data } = await this.$wsApi.put(`/stt/config/${this.idEmpresa}`, {
          stt_enabled: this.sttConfig.stt_enabled,
          stt_monthly_usd_limit: this.sttConfig.stt_monthly_usd_limit,
          stt_long_audio_seconds: this.sttConfig.stt_long_audio_seconds,
          stt_language: this.sttConfig.stt_language,
        });
        this.sttConfig.stt_enabled = !!data.stt_enabled;
        this.sttConfig.stt_monthly_usd_limit = Number(data.stt_monthly_usd_limit);
        this.sttConfig.stt_long_audio_seconds = Number(data.stt_long_audio_seconds);
        this.sttConfig.stt_language = data.stt_language || '';
        this.$bvToast.toast('Configuración STT guardada.', { variant: 'success', title: 'STT' });
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: 'Error guardando config STT', variant: 'danger',
        });
      } finally {
        this.savingStt = false;
      }
    },

    async fetchSttUsage() {
      this.loadingStt = true;
      try {
        const { data } = await this.$wsApi.get(
          `/stt/usage/${this.idEmpresa}?month=${this.selectedUsageMonth}`
        );
        this.sttUsage = data;
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: 'Error cargando consumo STT', variant: 'danger',
        });
      } finally {
        this.loadingStt = false;
      }
    },

    // ---------- Papelera de conversaciones ----------
    async fetchDeleted() {
      this.loadingDeleted = true;
      try {
        const { data } = await this.$wsApi.get(
          `/conversations/${this.idEmpresa}/deleted?limit=500`
        );
        this.deletedChats = data || [];
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error cargando papelera",
          variant: "danger",
        });
      } finally {
        this.loadingDeleted = false;
      }
    },

    async restoreChat(item) {
      this.busyJid = item.id;
      try {
        await this.$wsApi.post(
          `/conversations/${this.idEmpresa}/${item.id}/restore`
        );
        this.deletedChats = this.deletedChats.filter((c) => c.id !== item.id);
        this.$bvToast.toast("Conversación restaurada.", { variant: "success" });
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error restaurando",
          variant: "danger",
        });
      } finally {
        this.busyJid = null;
      }
    },

    confirmPurge(item) {
      this.purgeTarget = item;
      this.showPurgeModal = true;
    },

    async purgeChat(bvEvt) {
      if (!this.purgeTarget) return;
      if (bvEvt && typeof bvEvt.preventDefault === 'function') bvEvt.preventDefault();
      const jid = this.purgeTarget.id;
      this.busyJid = jid;
      try {
        await this.$wsApi.delete(
          `/conversations/${this.idEmpresa}/${jid}/purge`
        );
        this.deletedChats = this.deletedChats.filter((c) => c.id !== jid);
        this.showPurgeModal = false;
        this.purgeTarget = null;
        this.$bvToast.toast("Conversación purgada definitivamente.", {
          variant: "success",
        });
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error purgando",
          variant: "danger",
        });
      } finally {
        this.busyJid = null;
      }
    },

    confirmPurgeAll() {
      this.purgeAllConfirmText = "";
      this.showPurgeAllModal = true;
    },

    async purgeAllChats(bvEvt) {
      if (bvEvt && typeof bvEvt.preventDefault === 'function') bvEvt.preventDefault();
      if (this.purgeAllConfirmText !== "PURGAR") return;
      this.purgingAll = true;
      try {
        const { data } = await this.$wsApi.delete(
          `/conversations/${this.idEmpresa}/purge-all`
        );
        this.deletedChats = [];
        this.showPurgeAllModal = false;
        this.$bvToast.toast(
          `Papelera purgada: ${data.purgedCount} conversación(es), ${data.filesDeleted} archivo(s) eliminados.`,
          { title: "Purga completada", variant: "success" }
        );
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error purgando papelera",
          variant: "danger",
        });
      } finally {
        this.purgingAll = false;
      }
    },

    formatPhone(jid) {
      if (!jid) return "";
      return "+" + String(jid).replace(/@.*/, "");
    },

    formatDate(v) {
      if (!v) return "";
      const d = new Date(v);
      if (isNaN(d.getTime())) return v;
      return d.toLocaleString("es");
    },
  },
};
</script>
