<template>
    <div>
        <button @click="change()">CHANGE</button>
        <!-- <pre>
      {{ t }}
    </pre> -->
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex"
import axios from "axios"

export default {
    data() {
        return {
            nuevo: { title: "New Title" },
            posts: [],
        }
    },
    computed: {
        ...mapState("test", ["t"]),
    },

    mounted() {
        // this.change()
    },

    methods: {
        ...mapMutations("test", ["setT"]),
        async change() {
            await this.$axios.get(this.$config.API).then((res) => {
                this.$store.commit("test/setT", res.data)
            })
        },
    },
}
</script>
