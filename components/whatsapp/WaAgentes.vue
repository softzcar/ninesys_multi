<template>
  <div>
    <!-- Toolbar -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted mb-0">
        Gestiona los agentes de IA que atienden tus conversaciones de WhatsApp.
        Cada agente tiene su propia personalidad, prompt y base de conocimiento.
      </p>
      <b-button variant="info" @click="openCreate">
        <b-icon icon="plus-circle" class="mr-1" /> Nuevo Agente
      </b-button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <b-spinner variant="info" />
      <p class="mt-2 text-muted">Cargando agentes...</p>
    </div>

    <!-- Tabla de agentes -->
    <b-table
      v-else
      :items="agents"
      :fields="fields"
      striped
      hover
      responsive
      show-empty
      empty-text="No hay agentes creados. Crea el primero."
    >
      <template #cell(enabled)="data">
        <b-badge :variant="data.item.enabled ? 'success' : 'secondary'">
          {{ data.item.enabled ? 'Activo' : 'Inactivo' }}
        </b-badge>
      </template>

      <template #cell(isDefault)="data">
        <b-badge v-if="data.item.isDefault" variant="info">Default</b-badge>
        <span v-else class="text-muted">-</span>
      </template>

      <template #cell(temperature)="data">
        {{ data.item.temperature }}
      </template>

      <template #cell(systemPrompt)="data">
        <span :title="data.item.systemPrompt">
          {{ truncate(data.item.systemPrompt, 60) }}
        </span>
      </template>

      <template #cell(actions)="data">
        <b-button size="sm" variant="outline-info" class="mr-1" @click="openEdit(data.item)">
          <b-icon icon="pencil" />
        </b-button>
        <b-button
          size="sm"
          variant="outline-danger"
          :disabled="data.item.isDefault && agents.length === 1"
          @click="confirmDelete(data.item)"
        >
          <b-icon icon="trash" />
        </b-button>
      </template>
    </b-table>

    <!-- Modal Crear/Editar -->
    <b-modal
      id="modal-agent"
      :title="isEditing ? 'Editar Agente' : 'Nuevo Agente'"
      size="lg"
      @ok="saveAgent"
      ok-title="Guardar"
      cancel-title="Cancelar"
      :ok-disabled="!form.name || !form.slug"
      no-close-on-backdrop
    >
      <b-form>
        <b-row>
          <b-col md="6">
            <b-form-group label="Nombre" label-for="agent-name">
              <b-form-input
                id="agent-name"
                v-model="form.name"
                placeholder="Ej: Ventas, Cobranza, Soporte"
                required
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Slug (identificador)" label-for="agent-slug" description="Solo letras minúsculas, números, guiones y guiones bajos.">
              <b-form-input
                id="agent-slug"
                v-model="form.slug"
                placeholder="Ej: ventas, cobranza"
                :state="slugValid"
                :disabled="isEditing"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group label="Prompt del Sistema" label-for="agent-prompt" description="Define la personalidad y comportamiento del agente.">
          <b-form-textarea
            id="agent-prompt"
            v-model="form.systemPrompt"
            rows="5"
            placeholder="Eres un asesor comercial de la empresa. Tu objetivo es..."
          />
        </b-form-group>

        <b-form-group label="Base de Conocimiento (JSON)" label-for="agent-kb" :description="kbDescription" :state="kbValid">
          <b-form-textarea
            id="agent-kb"
            v-model="form.knowledgeBase"
            rows="6"
            placeholder='{ "productos": [...], "politicas": [...] }'
            :state="kbValid"
          />
        </b-form-group>

        <b-row>
          <b-col md="4">
            <b-form-group label="Modelo" label-for="agent-model">
              <b-form-select id="agent-model" v-model="form.model" :options="modelOptions" />
            </b-form-group>
          </b-col>
          <b-col md="4">
            <b-form-group label="Temperatura" label-for="agent-temp" :description="`Creatividad: ${form.temperature}`">
              <b-form-input
                id="agent-temp"
                v-model.number="form.temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
              />
            </b-form-group>
          </b-col>
          <b-col md="4">
            <b-form-group label="Max Tokens" label-for="agent-tokens">
              <b-form-input
                id="agent-tokens"
                v-model.number="form.maxTokens"
                type="number"
                min="100"
                max="4096"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6">
            <b-form-checkbox v-model="form.enabled" switch>
              Agente activo
            </b-form-checkbox>
          </b-col>
          <b-col md="6">
            <b-form-checkbox v-model="form.isDefault" switch>
              Agente por defecto
            </b-form-checkbox>
          </b-col>
        </b-row>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "WaAgentes",
  data() {
    return {
      loading: false,
      agents: [],
      isEditing: false,
      editingId: null,
      form: this.emptyForm(),
      fields: [
        { key: "name", label: "Nombre", sortable: true },
        { key: "slug", label: "Slug" },
        { key: "systemPrompt", label: "Prompt" },
        { key: "model", label: "Modelo" },
        { key: "temperature", label: "Temp." },
        { key: "enabled", label: "Estado" },
        { key: "isDefault", label: "Default" },
        { key: "actions", label: "Acciones", class: "text-center" },
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
    slugValid() {
      if (!this.form.slug) return null;
      return /^[a-z0-9_-]+$/.test(this.form.slug);
    },
    kbValid() {
      if (!this.form.knowledgeBase || !this.form.knowledgeBase.trim()) return null;
      try {
        JSON.parse(this.form.knowledgeBase);
        return true;
      } catch (_) {
        return false;
      }
    },
    kbDescription() {
      if (this.kbValid === false) return 'JSON no válido. Verifica la sintaxis.';
      return 'Opcional. Información específica que el agente debe conocer (productos, precios, políticas, etc.)';
    },
  },
  mounted() {
    this.fetchAgents();
  },
  methods: {
    emptyForm() {
      return {
        name: "",
        slug: "",
        systemPrompt: "",
        knowledgeBase: "",
        model: "gemini-2.5-flash",
        temperature: 0.3,
        maxTokens: 1024,
        enabled: true,
        isDefault: false,
      };
    },

    async fetchAgents() {
      this.loading = true;
      try {
        const { data } = await this.$wsApi.get(`/ai/agents/${this.idEmpresa}`);
        this.agents = data;
      } catch (e) {
        this.$bvToast.toast("Error al cargar los agentes: " + (e.response?.data?.message || e.message), {
          title: "Error",
          variant: "danger",
        });
      } finally {
        this.loading = false;
      }
    },

    openCreate() {
      this.isEditing = false;
      this.editingId = null;
      this.form = this.emptyForm();
      this.$bvModal.show("modal-agent");
    },

    openEdit(agent) {
      this.isEditing = true;
      this.editingId = agent.id;
      this.form = {
        name: agent.name,
        slug: agent.slug,
        systemPrompt: agent.systemPrompt || "",
        knowledgeBase: agent.knowledgeBase
          ? (typeof agent.knowledgeBase === 'string'
            ? JSON.stringify(JSON.parse(agent.knowledgeBase), null, 2)
            : JSON.stringify(agent.knowledgeBase, null, 2))
          : "",
        model: agent.model,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        enabled: agent.enabled,
        isDefault: agent.isDefault,
      };
      this.$bvModal.show("modal-agent");
    },

    async saveAgent(bvModalEvent) {
      bvModalEvent.preventDefault();
      const payload = { ...this.form };

      // Parsear knowledgeBase si viene como string
      if (payload.knowledgeBase) {
        try {
          payload.knowledgeBase = JSON.parse(payload.knowledgeBase);
        } catch (_) {
          this.$bvToast.toast("La base de conocimiento no es un JSON válido", {
            title: "Error de validación",
            variant: "warning",
          });
          return;
        }
      } else {
        payload.knowledgeBase = null;
      }

      try {
        if (this.isEditing) {
          await this.$wsApi.put(`/ai/agents/${this.idEmpresa}/${this.editingId}`, payload);
          this.$bvToast.toast(`Agente "${payload.name}" actualizado`, {
            title: "Agente actualizado",
            variant: "success",
          });
        } else {
          await this.$wsApi.post(`/ai/agents/${this.idEmpresa}`, payload);
          this.$bvToast.toast(`Agente "${payload.name}" creado`, {
            title: "Agente creado",
            variant: "success",
          });
        }
        this.$bvModal.hide("modal-agent");
        await this.fetchAgents();
      } catch (e) {
        const msg = e.response?.data?.message || e.message;
        this.$bvToast.toast(msg, { title: "Error", variant: "danger" });
      }
    },

    async confirmDelete(agent) {
      const ok = await this.$bvModal.msgBoxConfirm(
        `¿Estás seguro de eliminar el agente "${agent.name}"? Las conversaciones asignadas a este agente volverán al agente por defecto.`,
        {
          title: "Confirmar eliminación",
          okVariant: "danger",
          okTitle: "Eliminar",
          cancelTitle: "Cancelar",
        }
      );
      if (!ok) return;
      try {
        await this.$wsApi.delete(`/ai/agents/${this.idEmpresa}/${agent.id}`);
        this.$bvToast.toast(`Agente "${agent.name}" eliminado`, {
          title: "Eliminado",
          variant: "success",
        });
        await this.fetchAgents();
      } catch (e) {
        this.$bvToast.toast(e.response?.data?.message || e.message, {
          title: "Error",
          variant: "danger",
        });
      }
    },

    truncate(text, length) {
      if (!text) return "-";
      return text.length > length ? text.substring(0, length) + "..." : text;
    },
  },
};
</script>
