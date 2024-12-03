<template>
    <div>
        <b-table
            responsive
            small
            striped
            hover
            :items="dataTable.items"
            :fields="dataTable.fields"
        >
            <template #cell(id)="data">
                <linkSearch :id="data.item.id" />
            </template>

            <template #cell(empleado)="data">
                {{ data.item }}
                <diseno-reasignacionSelect
                    :options="optionSelect"
                    :empleado="data.item.username"
                    :idorden="data.item._id"
                    :idempelado="data.item.empleado"
                ></diseno-reasignacionSelect>
            </template>
        </b-table>
        <!-- <pre>
      {{ this.$store.state.disenos.disenos.items }}
    </pre> -->
    </div>
</template>

<script>
export default {
    data() {
        return {
            disenos: [],
            fields: ["tipo", "id_orden", "empleado", "acciones"],
            loading: true,
            optionSelect: [],
            empSelected: [],
        }
    },

    computed: {
        dataTable() {
            return this.$store.state.disenos.disenos
        },
    },

    methods: {
        empleadosSelect() {
            return options
        },

        /* 	async getDisenos() {
			await this.$axios(`${this.$config.API}/disenos/asignados`)
				.then(res => res.json())
				.then(res => {
					this.disenos = res;
					this.loading = false;
				})
				.catch(err => {
					console.log(err);
				})
				.finally(() => {
					this.laoding = false;
					return true;
				});
		}, */
    },

    mounted() {
        this.$store.dispatch("disenos/getDisenos").then(() => {
            let tmpOptions = this.$store.state.disenos.empleados
                .filter(
                    (el) =>
                        el.departamento === "Diseño" ||
                        el.departamento === "Jefe de diseño"
                )
                .map((el) => {
                    return {
                        value: el._id,
                        text: el.username,
                    }
                })
            this.optionSelect = tmpOptions.concat({
                value: 0,
                text: "Sin asignar",
            })
        })

        /* this.getDisenos();
		this.getEmpleados().then(() => {
			let tmpOptions = this.empleados.filter(el => el.departamento === "Diseño").map(el => {
				return {
					value: el._id,
					text: el.username,
				};
			});
			this.optionSelect = tmpOptions.concat({ value: 0, text: "Sin asignar" }); */
        /* this.optionSelect = this.empleados.map((el) => {
        return {
          value: el._id,
          text: el.username,
        };
      }).filter(el => el.departamento === "Diseño")
		});*/
    },

    /* 	components: {
		NineSelect,
		NineAccess,
	}, */
}
</script>
