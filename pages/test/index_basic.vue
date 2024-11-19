<template>
  <div>
    <pre>
		meddages:::	{{ messages }}
		</pre
    >
    <p v-for="(message, idx) in messages" :key="idx">{{ message }}</p>
  </div>
</template>

<script>
// We store the reference to the SSE client out here
// so we can access it from other methods
let sseClient

export default {
  name: 'sse-test',
  data() {
    return {
      messages: [],
    }
  },
  mounted() {
    var source = new EventSource(this.$config.LIVE)

    source.addEventListener('message', function (event) {
      var data = JSON.parse(event.data)
      console.log(data.name)
      console.log(data.age)
      console.log(data.city)
    })
  },
  methods: {
    handleBan(banMessage) {
      // Note that we can access properties of message, since our parser is set to JSON
      // and the hypothetical object has a `reason` property.
      this.messages.push(`You've been banned! Reason: ${banMessage.reason}`)
    },
    handleChat(message) {
      // Note that we can access properties of message, since our parser is set to JSON
      // and the hypothetical object has these properties.
      // this.messages.push(`${message.user} said: ${message.text}`);
      this.messages.push(message)
    },
    handleMessage(message, lastEventId) {
      console.warn('Received a message w/o an event!', message, lastEventId)
      this.messages.push('message')
    },
  },
  beforeDestroy() {
    // Make sure to close the connection with the events server
    // when the component is destroyed, or we'll have ghost connections!
    sseClient.disconnect()

    // Alternatively, we could have added the `sse: { cleanup: true }` option to our component,
    // and the SSEManager would have automatically disconnected during beforeDestroy.
  },
}
</script>
