<template>
  <div>
    HOLA !!!
    <pre style="color: red">
      {{ registros }}
    </pre>
    <!-- <pre>
      {{ registros }}
    </pre> -->
    <ul v-for="(item, index) in registros" :key="index" class="lista-registros">
      <li>
        <span class="registro">
          {{ item.registro }}
        </span>

        <span class="hora">
          {{ formatMoment(item.moment) }}
        </span>
        <!-- <span class="delete">
          <el-button
            @click="deleteMe(item.registro)"
            type="danger"
            icon="el-icon-delete"
          ></el-button>
        </span> -->
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  methods: {
    formatMoment(timestamp) {
      let split = timestamp.split(' ')

      let fechaDividida = split[0].split('-')
      const fecha = `${fechaDividida[2]}/${fechaDividida[1]}/${fechaDividida[0]}`

      let hora = split[1]
      const timeString = split[1]
      // Append any date. Use your birthday.
      const timeString12hr = new Date(
        '1970-01-01T' + timeString + 'Z'
      ).toLocaleTimeString(
        {},
        { timeZone: 'UTC', hour12: true, hour: 'numeric', minute: 'numeric' }
      )

      return timeString12hr
    },

    deleteMe(item) {
      this.$alert(
        'Delete me Bitcch! ' + item + ' -> ' + this.registros.id_asistencia
      )
    },
  },

  props: ['registros'],
}
</script>

<style scoped>
.lista-registros {
  border: solid grey 1px;
  padding: 0.4rem;
  text-align: right;
}
.lista-registros li {
  list-style: none;
}
.lista-registros li .registro {
  text-transform: uppercase;
  font-weight: 700;
}
.lista-registros li .hora {
  margin-left: 12px;
}
.delete {
  color: red;
  margin-left: 8px;
}
</style>
