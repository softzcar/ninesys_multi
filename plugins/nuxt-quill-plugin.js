import Vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'
import Quill from 'quill'
import BlotFormatter from 'quill-blot-formatter'
import axios from 'axios'

Vue.use(VueQuillEditor)

// Registrar el módulo BlotFormatter
Quill.register('modules/blotFormatter', BlotFormatter)

// Configuración personalizada de Quill
const API_URL = 'https://api.ninesys19.com';

// Barra de progreso para la subida de imágenes desde el editor -- mismo
// patrón ya usado en el resto de app_multi (b-progress + onUploadProgress
// de axios, proyecto del límite de 100MB en diseno/GaleriaCategoria.vue y
// hermanos). Este handler vive fuera de cualquier componente Vue (es un
// handler de toolbar de Quill, sin template propio), así que se inserta
// directo en el DOM del editor en vez de depender de un <b-progress>.
//
// ⚠️ IMPORTANTE: el wrapper se inserta ANTES de quill.container (el nodo que
// vue-quill-editor recibió como ref="editor" y que Quill convierte en
// .ql-container), nunca antes de quill.root (.ql-editor) ni dentro de
// quill.container. vue-quill-editor lee el HTML del editor con
// `this.$refs.editor.children[0].innerHTML` en cada 'text-change' (ver
// node_modules/vue-quill-editor/src/editor.vue) -- asume que ese primer
// hijo SIEMPRE es .ql-editor. Insertar este wrapper como hermano ANTERIOR a
// quill.root (como se hacía antes) lo convierte en children[0], así que
// cualquier cambio de contenido mientras la barra está visible (ej. el
// insertEmbed() de la imagen recién subida) hacía que se leyera el HTML de
// la barra de progreso en vez del contenido real, pisando form.obs con el
// texto "Subiendo imagen... 100%" (hallazgo real 2026-09-17). Insertando
// fuera de quill.container este problema no puede ocurrir.
function crearBarraProgresoQuill(quill) {
    const wrapper = document.createElement('div');
    wrapper.className = 'quill-upload-progress-wrapper';
    wrapper.style.padding = '4px 8px';
    wrapper.style.borderBottom = '1px solid #ccc';
    wrapper.innerHTML = `
        <small class="text-muted">Subiendo imagen... <span class="quill-upload-progress-pct">0</span>%</small>
        <div class="progress" style="height:6px;">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width:0%"></div>
        </div>
    `;
    quill.container.parentNode.insertBefore(wrapper, quill.container);

    return {
        actualizar(pct) {
            const bar = wrapper.querySelector('.progress-bar');
            const label = wrapper.querySelector('.quill-upload-progress-pct');
            if (bar) bar.style.width = pct + '%';
            if (label) label.textContent = pct;
        },
        destruir() {
            wrapper.remove();
        },
    };
}

// Sube un archivo de imagen al servidor y lo inserta en el editor como embed
// (URL real servida desde /images-orders-details, nunca base64) -- función
// compartida entre el botón de la barra de herramientas y la intercepción de
// pegado/arrastre de más abajo, para que ambos caminos suban el archivo de
// la misma forma en vez de duplicar la lógica.
async function subirImagenYEmbeber(quill, file) {
    const activeApiUrl = (typeof window !== 'undefined' && window.$nuxt && window.$nuxt.$config.API) || API_URL;
    const formData = new FormData();
    formData.append('image', file);

    const barra = crearBarraProgresoQuill(quill);
    try {
        const response = await axios.post(`${activeApiUrl}/upload-order-detail-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (evt) => {
                if (evt.total) {
                    barra.actualizar(Math.round((evt.loaded * 100) / evt.total));
                }
            }
        });

        if (response.data && response.data.url) {
            const range = quill.getSelection(true) || { index: quill.getLength() };
            const fullUrl = `${activeApiUrl}${response.data.url}`;
            quill.insertEmbed(range.index, 'image', fullUrl);
            quill.setSelection(range.index + 1);
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error al subir la imagen');
    } finally {
        barra.destruir();
    }
}

const options = {
    theme: 'snow', // Puedes cambiar a 'bubble' si prefieres
    modules: {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline', 'strikethrough'],
                [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                [{ 'align': [] }],
                ['clean'] // Botón para limpiar el editor
            ],
            handlers: {
                image: function () {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files[0];
                        if (file) {
                            await subirImagenYEmbeber(this.quill, file);
                        }
                    };
                }
            }
        },
        blotFormatter: {} // Habilitar BlotFormatter
    }
}

// Intercepta el pegado (Ctrl+V) y el arrastre de imágenes directamente sobre
// el editor. Sin esto, Quill usa su comportamiento por defecto: embeber la
// imagen como base64 en el propio HTML en vez de subirla al servidor -- ese
// base64 nunca pasa por /upload-order-detail-image, así que la imagen
// "desaparece" cuando el HTML se guarda y se vuelve a cargar (hallazgo real
// 2026-09-17, reportado en ordenes/nueva.vue vía "Cargar Orden no Asignada":
// las imágenes pegadas no se subían y no se veían luego). Debe llamarse una
// vez el editor está listo (evento @ready de vue-quill-editor).
export function interceptarPegadoYArrastreDeImagenes(quill) {
    // Fase de captura: se ejecuta ANTES que el listener interno de Quill
    // (que escucha 'paste' en fase de burbuja), así preventDefault() acá
    // hace que Quill detecte e.defaultPrevented y omita su inserción base64
    // por defecto.
    quill.root.addEventListener('paste', (e) => {
        const items = (e.clipboardData && e.clipboardData.items) || [];
        const item = Array.from(items).find((it) => it.type && it.type.indexOf('image') === 0);
        const file = item ? item.getAsFile() : null;
        if (file) {
            e.preventDefault();
            e.stopPropagation();
            subirImagenYEmbeber(quill, file);
        }
    }, true);

    quill.root.addEventListener('drop', (e) => {
        const files = (e.dataTransfer && e.dataTransfer.files) || [];
        const file = Array.from(files).find((f) => f.type && f.type.indexOf('image') === 0);
        if (file) {
            e.preventDefault();
            e.stopPropagation();
            subirImagenYEmbeber(quill, file);
        }
    }, true);
}

// Limpieza de imágenes huérfanas: cuando el usuario quita una imagen ya
// subida del contenido del editor (antes de guardar), el archivo queda vivo
// en el servidor sin que nada la referencie -- se compara el HTML anterior
// contra el nuevo y se pide borrar en el servidor lo que ya no aparece.
// Fire-and-forget: un fallo acá no debe bloquear el guardado del contenido
// real, solo se registra en consola.
function extraerNombresImagenesOrden(html) {
    if (!html) return [];
    const regex = /images-orders-details\/([a-f0-9]{16}\.[A-Za-z0-9]{1,10})/g;
    const nombres = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
        nombres.push(match[1]);
    }
    return nombres;
}

export async function limpiarImagenesQuillHuerfanas(htmlAnterior, htmlNuevo, axiosInstance, apiBase) {
    const antes = new Set(extraerNombresImagenesOrden(htmlAnterior));
    const despues = new Set(extraerNombresImagenesOrden(htmlNuevo));
    const eliminadas = [...antes].filter((n) => !despues.has(n));

    eliminadas.forEach((filename) => {
        const data = new URLSearchParams();
        data.set('filename', filename);
        axiosInstance.post(`${apiBase}/delete-order-detail-image`, data).catch((err) => {
            console.error('No se pudo limpiar la imagen huérfana', filename, err);
        });
    });
}

// Exportar las opciones para usarlas en otros componentes
export default options