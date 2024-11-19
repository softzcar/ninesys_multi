import Vue from 'vue'
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'

// Required dependency of bootstrap css/scss files
import 'bootstrap/scss/bootstrap.scss'

// Global registration
Vue.component('vue-typeahead-bootstrap', VueTypeaheadBootstrap)

// or

// Local Registration
export default {
  components: {
    VueTypeaheadBootstrap,
  },
}
