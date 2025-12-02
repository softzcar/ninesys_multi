import Vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'
import Quill from 'quill'
import BlotFormatter from 'quill-blot-formatter'
import axios from 'axios'

Vue.use(VueQuillEditor)

// Registrar el módulo BlotFormatter
Quill.register('modules/blotFormatter', BlotFormatter)

// Configuración personalizada de Quill
const API_URL = 'https://apidev.nineteengreen.com';

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
                            const formData = new FormData();
                            formData.append('image', file);

                            try {
                                const response = await axios.post(`${API_URL}/upload-order-detail-image`, formData, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data'
                                    }
                                });

                                if (response.data && response.data.url) {
                                    const range = this.quill.getSelection();
                                    const fullUrl = `${API_URL}${response.data.url}`;
                                    this.quill.insertEmbed(range.index, 'image', fullUrl);
                                    this.quill.setSelection(range.index + 1);
                                }
                            } catch (error) {
                                console.error('Error uploading image:', error);
                                alert('Error al subir la imagen');
                            }
                        }
                    };
                }
            }
        },
        blotFormatter: {} // Habilitar BlotFormatter
    }
}

// Exportar las opciones para usarlas en otros componentes
export default options