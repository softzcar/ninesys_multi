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
        <b-form-checkbox v-model="form.respond_in_groups" switch>
          Responder en grupos de WhatsApp
          <small class="text-muted d-block">
            Si está activo, la IA también responderá en conversaciones grupales.
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
    hasChanges() {
      if (!this.originalForm) return false;
      const fields = [
        "provider",
        "model",
        "system_prompt",
        "temperature",
        "max_tokens",
        "respond_in_groups",
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
  },
};
</script>
