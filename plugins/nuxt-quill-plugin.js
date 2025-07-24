import Vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'

Vue.use(VueQuillEditor)

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
        ]
    }
}

// Exportar las opciones para usarlas en otros componentes
export default options