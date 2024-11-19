<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <!-- <div v-if="access"> -->
      <b-container>
        <b-row>
          <b-col>
            <buscar-resultado />
          </b-col>
        </b-row>
      </b-container>
      <!-- </div>

      <div v-else>
        <accessDenied />
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
	computed: {
		...mapState('login', ['dataUser', 'access']),
	},
}
</script>
