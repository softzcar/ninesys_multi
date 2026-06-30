<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <div class="d-none d-lg-block">
                <menus-MenuLoader />
            </div>
            <empleados-DashboardEmpleado :showCharts="false" />
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    computed: {
        ...mapState("login", ["access"]),
    },
};
</script>
