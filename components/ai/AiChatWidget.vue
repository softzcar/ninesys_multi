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
              <p class="mb-0 mt-2">Puedo ayudarte con información sobre:</p>
              <ul class="mb-0 mt-1">
                <li>Órdenes y clientes</li>
                <li>Estado de producción</li>
                <li>Inventario y materiales</li>
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

    <!-- Modal de Confirmación de Orden -->
    <b-modal
      v-model="showOrderModal"
      title="Confirmar Nueva Orden"
      size="lg"
      centered
      @ok="confirmarOrden"
      @cancel="cancelarOrden"
      ok-title="Crear Orden"
      cancel-title="Cancelar"
      ok-variant="success"
      :ok-disabled="isCreatingOrder"
    >
      <div v-if="orderPreview">
        <!-- Cliente -->
        <div class="mb-3">
          <strong>Cliente:</strong>
          <p class="mb-0">{{ orderPreview.cliente_seleccionado?.nombre }}</p>
          <small class="text-muted">{{ orderPreview.cliente_seleccionado?.telefono }}</small>
        </div>

        <!-- Fecha de Entrega -->
        <div class="mb-3">
          <strong>Fecha de Entrega Estimada:</strong>
          <span class="ml-2">{{ orderPreview.fecha_entrega_estimada }}</span>
        </div>

        <!-- Productos -->
        <div v-for="(producto, idx) in orderPreview.productos" :key="idx" class="border rounded p-3 mb-3">
          <h6>{{ producto.nombre_buscado }} (x{{ producto.cantidad }})</h6>
          
          <!-- Selector de Producto (si hay múltiples opciones) -->
          <div v-if="producto.opciones && producto.opciones.length > 1" class="mb-2">
            <label class="small">Seleccionar producto:</label>
            <b-form-select v-model="selectedProducts[idx].producto_id" size="sm" @change="onProductoChange(idx)">
              <option v-for="opt in producto.opciones" :key="opt.id" :value="opt.id">
                {{ opt.nombre }}
              </option>
            </b-form-select>
          </div>

          <!-- Selector de Precio -->
          <div class="mb-2">
            <label class="small"><strong>Precio:</strong></label>
            <b-form-select v-model="selectedProducts[idx].precio" size="sm">
              <option v-for="precio in getPrecios(idx)" :key="precio.id" :value="precio.precio">
                {{ precio.descripcion }}: ${{ precio.precio }}
              </option>
            </b-form-select>
          </div>

          <!-- Selector de Talla -->
          <div class="mb-2">
            <label class="small">Talla:</label>
            <b-form-select v-model="selectedProducts[idx].talla_id" size="sm">
              <option :value="null">Sin especificar</option>
              <option v-for="t in orderPreview.opciones?.tallas" :key="t.id" :value="t.id">
                {{ t.nombre }}
              </option>
            </b-form-select>
          </div>

          <!-- Selector de Tela -->
          <div class="mb-2">
            <label class="small">Tela:</label>
            <b-form-select v-model="selectedProducts[idx].tela_id" size="sm">
              <option :value="null">Sin especificar</option>
              <option v-for="t in orderPreview.opciones?.telas" :key="t.id" :value="t.id">
                {{ t.nombre }}
              </option>
            </b-form-select>
          </div>

          <!-- Selector de Corte -->
          <div class="mb-2">
            <label class="small">Corte:</label>
            <b-form-select v-model="selectedProducts[idx].corte" size="sm">
              <option v-for="c in orderPreview.opciones?.cortes" :key="c.id" :value="c.id">
                {{ c.nombre }}
              </option>
            </b-form-select>
          </div>

          <!-- Subtotal -->
          <div class="text-right">
            <strong>Subtotal: ${{ (selectedProducts[idx]?.precio || 0) * producto.cantidad }}</strong>
          </div>
        </div>

        <!-- Total -->
        <div class="text-right border-top pt-2">
          <h5>Total: ${{ calcularTotal() }}</h5>
        </div>
      </div>

      <div v-else class="text-center py-4">
        <b-spinner></b-spinner>
        <p>Cargando datos...</p>
      </div>
    </b-modal>
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
      messages: [],
      // Modal de confirmación de orden
      showOrderModal: false,
      orderPreview: null,
      orderRequest: null,
      selectedProducts: [],
      isCreatingOrder: false,
      // Estado para flujo conversacional de órdenes
      orderContext: {
        active: false,
        cliente: null,
        productos: [],
        ultimoContextoBD: null  // Guardar último contexto para reutilizar
      }
    }
  },

  computed: {
    isLoggedIn() {
      // Verificar si el usuario está logueado usando el store de Vuex
      return this.$store?.state?.login?.access === true || 
             (this.$store?.state?.login?.idEmpresa && this.$store.state.login.idEmpresa > 0)
    },
    userName() {
      // Obtener nombre del empleado logueado desde Vuex
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
      
      // Limpiar input inmediatamente
      this.userInput = ''
      
      // Forzar actualización del DOM y limpiar el input nativo
      this.$nextTick(() => {
        if (this.$refs.chatInput && this.$refs.chatInput.$el) {
          this.$refs.chatInput.$el.value = ''
        }
      })

      // Add user message
      this.messages.push({
        sender: 'user',
        text: query,
        time: this.getCurrentTime()
      })

      this.scrollToBottom()
      this.isLoading = true

      // ============================================================
      // FLUJO INTELIGENTE: DETECTAR INTENCIÓN DE ORDEN
      // ============================================================
      
      // Detectar si el mensaje parece ser sobre crear una orden
      // Versión robusta: detecta typos, listas de productos, y patrones
      const palabrasClave = ['orden', 'ordenes', 'roden', 'orde', 'ordne', 'pedido', 'pedidos', 'crear', 'crea', 'cree', 'nueva', 'nuevo', 'hacer', 'hace', 'haz', 'generar', 'genera']
      const tienePalabraClave = palabrasClave.some(p => query.toLowerCase().includes(p))
      const tieneFormatoLista = /\d+\s*(franela|gorra|camisa|pantalon|chemise|short|sudadera)/i.test(query)
      const tieneCliente = /para\s+[\w\s]+:/i.test(query)
      const esIntencionOrden = tienePalabraClave || tieneFormatoLista || tieneCliente
      
      if (this.orderContext.active || esIntencionOrden) {
        // Si hay orden activa O si parece querer crear una orden, usar endpoint con contexto
        if (esIntencionOrden && !this.orderContext.active) {
          // Activar contexto de orden para las siguientes interacciones
          this.orderContext.active = true
        }
        await this.enviarMensajeOrden(query)
        this.isLoading = false
        this.userInput = ''  // Asegurar que está limpio
        this.scrollToBottom()
        this.$nextTick(() => {
          if (this.$refs.chatInput) {
            this.$refs.chatInput.focus()
          }
        })
        return
      }

      try {
        // Get empresa ID from store (default to 163 for testing)
        const empresaId = this.$store?.state?.login?.idEmpresa || 163
        
        // Get API URL from nuxt config
        const apiUrl = this.$config?.API || 'https://apidev.nineteengreen.com'

        // Construir historial de conversación para Gemini
        // Solo incluir los últimos 10 mensajes para no exceder el límite de tokens
        const history = this.messages
          .slice(-10)
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            text: msg.text
          }))

        const response = await this.$axios.post(`${apiUrl}/ai/chat`, 
          { query, history },
          { 
            headers: { 
              'Authorization': empresaId.toString(),
              'Content-Type': 'application/json'
            }
          }
        )

        const data = response.data

        if (data.success) {
          // Detectar si la respuesta es un JSON de creación de orden
          const responseText = data.response || ''
          if (this.isCreateOrderResponse(responseText)) {
            this.handleCreateOrderResponse(responseText)
          } else {
            this.messages.push({
              sender: 'bot',
              text: data.response,
              time: this.getCurrentTime()
            })
          }
        } else {
          this.messages.push({
            sender: 'bot',
            text: '❌ ' + (data.error || data.response || 'Error al procesar la consulta'),
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
        this.userInput = ''  // Asegurar que el input esté limpio
        this.scrollToBottom()
        // Mantener el foco en el input para seguir escribiendo
        this.$nextTick(() => {
          if (this.$refs.chatInput) {
            this.$refs.chatInput.focus()
          }
        })
      }
    },

    getCurrentTime() {
      return new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    formatMessage(text) {
      // Si text es un objeto (respuesta de create_order), extraer el campo de texto
      if (typeof text === 'object' && text !== null) {
        // Intentar extraer texto del objeto
        text = text.prompt || text.message || text.text || text.response || JSON.stringify(text)
      }
      
      // Asegurar que sea string
      if (typeof text !== 'string') {
        text = String(text)
      }
      
      // Convert markdown-like formatting to HTML
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/• /g, '&bull; ')
    },

    // ============================================================
    // FLUJO CONVERSACIONAL DE ÓRDENES CON CONTEXTO DE BD
    // ============================================================

    parsearRespuestaIA(response) {
      // Extraer texto legible de respuestas JSON de Gemini
      if (typeof response === 'object' && response !== null) {
        // Intentar extraer campos de texto comunes
        return response.question || 
               response.message || 
               response.text || 
               response.response || 
               response.prompt ||
               JSON.stringify(response)
      }
      return response
    },

    async obtenerContextoBD(query) {
      // Extrae información del mensaje para buscar en BD
      const empresaId = this.$store?.state?.login?.idEmpresa || 163
      const apiUrl = this.$config?.API || 'https://apidev.nineteengreen.com'
      
      try {
        // Extraer posibles nombres de clientes y productos del query
        const palabras = query.toLowerCase().split(/\s+/)
        
        // Buscar palabras que puedan ser nombres (más de 2 letras, no son números)
        const posiblesNombres = palabras.filter(p => p.length > 2 && !/^\d+$/.test(p))
        
        // Detectar menciones de productos comunes
        const tieneProducto = /franela|camisa|pantalón|gorra|chaqueta|sudadera|short/i.test(query)
        
        const payload = {
          buscar_clientes: posiblesNombres.join(' '),
          buscar_productos: tieneProducto ? query : '',
          incluir_tallas: true,
          incluir_telas: true
        }
        
        const response = await this.$axios.post(
          `${apiUrl}/ordenes/contexto-ia`,
          payload,
          {
            headers: {
              'Authorization': empresaId.toString(),
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (response.data.success) {
          return response.data.contexto
        }
      } catch (error) {
        console.error('Error obteniendo contexto BD:', error)
      }
      
      // Contexto vacío si hay error
      return { clientes: [], productos: [], tallas: [], telas: [] }
    },

    async enviarMensajeOrden(query) {
      // Flujo conversacional inteligente con contexto de BD
      const empresaId = this.$store?.state?.login?.idEmpresa || 163
      const apiUrl = this.$config?.API || 'https://apidev.nineteengreen.com'
      
      // Obtener contexto de BD
      let contextoBD = await this.obtenerContextoBD(query)
      
      // Si el contexto está vacío pero hay uno guardado, reutilizarlo
      const tieneContexto = contextoBD.clientes.length > 0 || 
                            contextoBD.productos.length > 0 || 
                            contextoBD.tallas.length > 0 || 
                            contextoBD.telas.length > 0
      
      if (!tieneContexto && this.orderContext.ultimoContextoBD) {
        contextoBD = this.orderContext.ultimoContextoBD
      } else if (tieneContexto) {
        // Guardar el contexto actual para reutilizar después
        this.orderContext.ultimoContextoBD = contextoBD
      }
      
      // Enriquecer queries numéricos para evitar confusión
      let queryEnriquecido = query
      if (/^\d+$/.test(query.trim())) {
        queryEnriquecido = `Selecciono la opción número ${query.trim()}`
      }
      
      // Construir historial
      const history = this.messages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
      }))
      
      try {
        const response = await this.$axios.post(
          `${apiUrl}/ai/chat-orden`,
          {
            query: queryEnriquecido,
            history,
            contexto_bd: contextoBD,
            orden_en_progreso: this.orderContext.active ? {
              cliente: this.orderContext.cliente,
              productos: this.orderContext.productos
            } : null
          },
          {
            headers: {
              'Authorization': empresaId.toString(),
              'Content-Type': 'application/json'
            }
          }
        )
        
        const data = response.data
        
        if (data.success) {
          // Verificar si hay acción create_order
          if (data.is_action && data.action === 'create_order' && data.ready) {
            // Orden lista para crear
            await this.handleCreateOrderResponse(data.response)
          } else if (data.is_action && data.action === 'create_order') {
            // Orden en progreso, mostrar pregunta
            const textoRespuesta = this.parsearRespuestaIA(data.response)
            this.messages.push({
              sender: 'bot',
              text: textoRespuesta,
              time: this.getCurrentTime()
            })
          } else {
            // Respuesta normal
            const textoRespuesta = this.parsearRespuestaIA(data.response)
            this.messages.push({
              sender: 'bot',
              text: textoRespuesta,
              time: this.getCurrentTime()
            })
          }
        } else {
          this.messages.push({
            sender: 'bot',
            text: '❌ ' + (data.error || data.response || 'Error al procesar'),
            time: this.getCurrentTime()
          })
        }
      } catch (error) {
        console.error('Error en orden conversacional:', error)
        this.messages.push({
          sender: 'bot',
          text: '❌ Error de conexión. Intenta de nuevo.',
          time: this.getCurrentTime()
        })
      }
    },

    // ============================================================
    // Métodos para creación de órdenes desde chat
    // ============================================================
    
    isCreateOrderResponse(text) {
      // Detectar si la respuesta es un JSON con action: create_order
      try {
        if (typeof text !== 'string') return false
        const trimmed = text.trim()
        if (!trimmed.startsWith('{')) return false
        
        const parsed = JSON.parse(trimmed)
        return parsed.action === 'create_order'
      } catch {
        return false
      }
    },

    async handleCreateOrderResponse(responseData) {
      try {
        // Si es string JSON, parsearlo, si no, usar directamente
        const orderData = typeof responseData === 'string' 
          ? JSON.parse(responseData) 
          : responseData
        
        // Mostrar mensaje de procesamiento
        this.messages.push({
          sender: 'bot',
          text: '📋 Creando orden...',
          time: this.getCurrentTime()
        })
        
        const empresaId = this.$store?.state?.login?.idEmpresa || 163
        const userId = this.$store?.state?.login?.dataUser?.id_empleado || this.$store?.state?.login?.idUsuario
        const apiUrl = this.$config?.API || 'https://apidev.nineteengreen.com'
        
        // Validar que el usuario esté logueado
        if (!userId) {
          this.messages[this.messages.length - 1].text = 
            '❌ Error: Debes estar logueado para crear órdenes.'
          this.scrollToBottom()
          return
        }
        
        // Crear la orden DIRECTAMENTE (sin modal)
        const createResponse = await this.$axios.post(
          `${apiUrl}/ordenes/nueva/simple`,
          {
            cliente_nombre: orderData.data.cliente?.nombre || orderData.data.cliente_nombre,
            cliente_id: orderData.data.cliente?.id,
            productos: orderData.data.productos,
            observaciones: orderData.data.observaciones || '',
            responsable_id: userId
          },
          {
            headers: {
              'Authorization': empresaId.toString(),
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (createResponse.data.success) {
          // Resetear contexto de orden
          this.orderContext.active = false
          this.orderContext.cliente = null
          this.orderContext.productos = []
          this.orderContext.ultimoContextoBD = null
          
          // Mensaje de éxito
          this.messages[this.messages.length - 1].text = 
            `✅ **¡Orden #${createResponse.data.orden_id} creada exitosamente!**\n\n` +
            `👤 Cliente: ${createResponse.data.cliente?.nombre || 'N/A'}\n` +
            `📦 Productos: ${createResponse.data.productos_count || orderData.data.productos.length} items\n` +
            `💰 Total: $${createResponse.data.total || '0.00'}\n` +
            `📅 Entrega estimada: ${createResponse.data.fecha_entrega || 'Por confirmar'}`
        } else {
          this.messages[this.messages.length - 1].text = 
            '❌ Error al crear la orden: ' + (createResponse.data.message || 'Error desconocido')
        }
        
        this.scrollToBottom()
      } catch (error) {
        console.error('Error creando orden:', error)
        this.messages[this.messages.length - 1] = {
          sender: 'bot',
          text: '❌ Error al crear la orden: ' + (error.response?.data?.message || error.message),
          time: this.getCurrentTime()
        }
        this.scrollToBottom()
      }
    },

    initializeProductSelections() {
      this.selectedProducts = []
      
      if (!this.orderPreview?.productos) return
      
      this.orderPreview.productos.forEach((prod, idx) => {
        const firstOption = prod.opciones?.[0]
        const firstPrecio = firstOption?.precios?.[0]
        
        this.selectedProducts.push({
          producto_id: firstOption?.id || null,
          producto_nombre: firstOption?.nombre || prod.nombre_buscado,
          cantidad: prod.cantidad,
          precio: firstPrecio?.precio || 0,
          talla_id: prod.talla_encontrada?.id || null,
          talla_nombre: prod.talla_encontrada?.nombre || null,
          tela_id: prod.tela_encontrada?.id || null,
          tela_nombre: prod.tela_encontrada?.nombre || null,
          corte: ''
        })
      })
    },

    getPrecios(idx) {
      if (!this.orderPreview?.productos?.[idx]) return []
      
      const producto = this.orderPreview.productos[idx]
      const selectedProductId = this.selectedProducts[idx]?.producto_id
      
      const opcion = producto.opciones?.find(o => o.id === selectedProductId) || producto.opciones?.[0]
      return opcion?.precios || []
    },

    onProductoChange(idx) {
      // Cuando cambia el producto seleccionado, actualizar el precio al primero disponible
      const precios = this.getPrecios(idx)
      if (precios.length > 0) {
        this.selectedProducts[idx].precio = precios[0].precio
      }
    },

    calcularTotal() {
      let total = 0
      this.selectedProducts.forEach((sp, idx) => {
        const cantidad = this.orderPreview?.productos?.[idx]?.cantidad || 1
        total += (sp.precio || 0) * cantidad
      })
      return total.toFixed(2)
    },

    async confirmarOrden(bvModalEvent) {
      bvModalEvent.preventDefault()
      this.isCreatingOrder = true
      
      try {
        const empresaId = this.$store?.state?.login?.idEmpresa || 163
        const userId = this.$store?.state?.login?.dataUser?.id_empleado || this.$store?.state?.login?.idUsuario
        const apiUrl = this.$config?.API || 'https://apidev.nineteengreen.com'
        
        // Preparar productos con las selecciones del usuario
        const productosConSelecciones = this.selectedProducts.map((sp, idx) => {
          const prodOriginal = this.orderPreview.productos[idx]
          const opcion = prodOriginal.opciones?.find(o => o.id === sp.producto_id) || prodOriginal.opciones?.[0]
          const talla = this.orderPreview.opciones?.tallas?.find(t => t.id === sp.talla_id)
          const tela = this.orderPreview.opciones?.telas?.find(t => t.id === sp.tela_id)
          
          return {
            producto_id: sp.producto_id,
            producto_nombre: opcion?.nombre || prodOriginal.nombre_buscado,
            cantidad: prodOriginal.cantidad,
            precio: sp.precio,
            talla_id: sp.talla_id,
            talla_nombre: talla?.nombre || null,
            tela_id: sp.tela_id,
            tela_nombre: tela?.nombre || null,
            corte: sp.corte || ''
          }
        })
        
        const response = await this.$axios.post(
          `${apiUrl}/ordenes/nueva/simple`,
          {
            cliente_nombre: this.orderPreview.cliente_seleccionado?.nombre,
            cliente_id: this.orderPreview.cliente_seleccionado?.id,
            productos: productosConSelecciones,
            observaciones: this.orderRequest?.observaciones || '',
            responsable_id: userId
          },
          {
            headers: {
              'Authorization': empresaId.toString(),
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (response.data.success) {
          this.messages.push({
            sender: 'bot',
            text: `✅ **¡Orden #${response.data.orden_id} creada exitosamente!**\n` +
                  `• Cliente: ${response.data.cliente?.nombre}\n` +
                  `• Total: $${response.data.total}\n` +
                  `• Entrega: ${response.data.fecha_entrega}`,
            time: this.getCurrentTime()
          })
          this.showOrderModal = false
          // Resetear contexto de orden
          this.orderContext.active = false
          this.orderContext.cliente = null
          this.orderContext.productos = []
          this.orderContext.ultimoContextoBD = null
        } else {
          this.messages.push({
            sender: 'bot',
            text: '❌ Error al crear la orden: ' + (response.data.message || 'Error desconocido'),
            time: this.getCurrentTime()
          })
        }
      } catch (error) {
        console.error('Error creando orden:', error)
        this.messages.push({
          sender: 'bot',
          text: '❌ Error al crear la orden: ' + (error.response?.data?.message || error.message),
          time: this.getCurrentTime()
        })
      } finally {
        this.isCreatingOrder = false
        this.scrollToBottom()
      }
    },

    cancelarOrden() {
      this.showOrderModal = false
      this.orderPreview = null
      this.orderRequest = null
      this.selectedProducts = []
      
      // Resetear contexto de orden
      this.orderContext.active = false
      this.orderContext.cliente = null
      this.orderContext.productos = []
      this.orderContext.ultimoContextoBD = null
      
      this.messages.push({
        sender: 'bot',
        text: '⚠️ Creación de orden cancelada.',
        time: this.getCurrentTime()
      })
      this.scrollToBottom()
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
