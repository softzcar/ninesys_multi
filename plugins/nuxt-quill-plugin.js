import Vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'
import Quill from 'quill'
import BlotFormatter from 'quill-blot-formatter'

Vue.use(VueQuillEditor)

// Registrar el módulo BlotFormatter
Quill.register('modules/blotFormatter', BlotFormatter)

// Configuración personalizada de Quill
const options = {
    theme: 'snow', // Puedes cambiar a 'bubble' si prefieres
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strikethrough'],
            [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            [{ 'align': [] }],
            ['clean'] // Botón para limpiar el editor
        ],
        blotFormatter: {} // Habilitar BlotFormatter
    }
}

// Exportar las opciones para usarlas en otros componentes
export default options