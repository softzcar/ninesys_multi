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
function crearBarraProgresoQuill(editorRoot) {
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
    editorRoot.parentNode.insertBefore(wrapper, editorRoot);

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
                            const activeApiUrl = (typeof window !== 'undefined' && window.$nuxt && window.$nuxt.$config.API) || API_URL;
                            const formData = new FormData();
                            formData.append('image', file);

                            const barra = crearBarraProgresoQuill(this.quill.root);
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
                                    const range = this.quill.getSelection();
                                    const fullUrl = `${activeApiUrl}${response.data.url}`;
                                    this.quill.insertEmbed(range.index, 'image', fullUrl);
                                    this.quill.setSelection(range.index + 1);
                                }
                            } catch (error) {
                                console.error('Error uploading image:', error);
                                alert('Error al subir la imagen');
                            } finally {
                                barra.destruir();
                            }
                        }
                    };
                }
            }
        },
        blotFormatter: {} // Habilitar BlotFormatter
    }
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