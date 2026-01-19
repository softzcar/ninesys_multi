<template>
    <div class="d-inline">
        <!-- Botón para abrir el modal -->
        <b-button @click="openModal" variant="outline-secondary" size="sm" class="ml-1">
            <b-icon icon="clock-history" aria-hidden="true"></b-icon>
        </b-button>

        <!-- Modal de historial -->
        <b-modal :id="modalId" :title="`Historial de Cambios - Movimiento #${idMovimiento}`" size="md" hide-footer
            @show="onModalShow">
            <b-overlay :show="loading" spinner-small>
                <!-- Mensaje si no hay historial -->
                <b-alert v-if="!loading && historial.length === 0" show variant="info">
                    No hay cambios registrados para este movimiento.
                </b-alert>

                <!-- Timeline de cambios -->
                <div v-else class="timeline-container">
                    <div v-for="(cambio, index) in historial" :key="cambio._id" class="timeline-item"
                        :class="{ 'not-last': index < historial.length - 1 }">
                        <!-- Indicador de timeline -->
                        <div class="timeline-marker">
                            <b-icon icon="circle-fill" font-scale="0.5"></b-icon>
                        </div>

                        <!-- Contenido del cambio -->
                        <div class="timeline-content">
                            <div class="change-header">
                                <strong>{{ formatDate(cambio.fecha_modificacion) }}</strong>
                                <small class="text-muted ml-2">
                                    por {{ cambio.usuario_nombre || 'Usuario desconocido' }}
                                </small>
                            </div>

                            <div class="change-values mt-2">
                                <span class="value-old">{{ cambio.valor_anterior }}</span>
                                <b-icon icon="arrow-right" class="mx-2"></b-icon>
                                <span class="value-new">{{ cambio.valor_nuevo }}</span>
                            </div>

                            <div v-if="cambio.observaciones" class="change-notes mt-2">
                                <small class="text-muted">
                                    <b-icon icon="chat-left-text" class="mr-1"></b-icon>
                                    {{ cambio.observaciones }}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    name: "HistorialCambiosModal",

    props: {
        idMovimiento: {
            type: [Number, String],
            required: true,
        },
    },

    data() {
        return {
            modalId: `historial-modal-${this.idMovimiento}`,
            loading: false,
            historial: [],
        };
    },

    methods: {
        openModal() {
            this.$bvModal.show(this.modalId);
        },

        async onModalShow() {
            await this.fetchHistorial();
        },

        async fetchHistorial() {
            this.loading = true;
            try {
                const response = await this.$axios.get(
                    `${this.$config.API}/inventario/consumo/${this.idMovimiento}/historial`
                );

                if (response.data.success) {
                    this.historial = response.data.data || [];
                } else {
                    this.$bvToast.toast("Error al cargar el historial", {
                        title: "Error",
                        variant: "danger",
                        solid: true,
                    });
                }
            } catch (error) {
                console.error("Error fetching historial:", error);
                this.$bvToast.toast("Error de conexión al cargar el historial", {
                    title: "Error",
                    variant: "danger",
                    solid: true,
                });
            } finally {
                this.loading = false;
            }
        },

        formatDate(dateString) {
            if (!dateString) return "-";
            const options = {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            };
            return new Date(dateString).toLocaleString("es-ES", options);
        },
    },
};
</script>

<style scoped>
.timeline-container {
    padding: 1rem 0;
}

.timeline-item {
    display: flex;
    position: relative;
    padding-left: 2rem;
    padding-bottom: 1.5rem;
}

.timeline-item.not-last::before {
    content: "";
    position: absolute;
    left: 0.4rem;
    top: 1.2rem;
    bottom: 0;
    width: 2px;
    background-color: #dee2e6;
}

.timeline-marker {
    position: absolute;
    left: 0;
    top: 0.3rem;
    color: #007bff;
}

.timeline-content {
    flex: 1;
    background-color: #f8f9fa;
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    border-left: 3px solid #007bff;
}

.change-header {
    font-size: 0.9rem;
}

.change-values {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
}

.value-old {
    color: #dc3545;
    font-weight: 500;
    text-decoration: line-through;
}

.value-new {
    color: #28a745;
    font-weight: 600;
}

.change-notes {
    padding: 0.5rem;
    background-color: #fff;
    border-radius: 0.25rem;
    border: 1px solid #dee2e6;
}
</style>
