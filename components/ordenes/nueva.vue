<template>
  <div>
    <!-- modal de ordenes guardadas -->
    <b-modal :id="modal" title="Ordenes guardadas" hide-footer size="lg">
      <div class="mb-4">
        <b-table
          ref="table"
          responsive
          stacked
          small
          :fields="fieldsGuardadas"
          :items="ordenesGuardadas"
          class="mb-4"
        >
          <template #cell(form)="data">
            <b-button
              variant="link"
              @click="loadFormGuardadas(data.index, data.item._id)"
            >
              {{ data.item.form.nombre }}
              {{ data.item.form.apellido }}
            </b-button>
          </template>

          <template #cell(empleado)="data">
            {{ data.item.empleado }}
          </template>

          <template #cell(_id)="data">
            <b-button
              @click="deleteOrdenGuardada(data.item._id)"
              variant="danger"
            >
              <b-icon icon="trash"></b-icon>
            </b-button>
          </template>
        </b-table>
      </div>
    </b-modal>

    <b-overlay :show="mainOverlay" rounded="sm">
      <b-container>
        <b-row>
          <b-col
            xs="12"
            sm="12"
            md="3"
            lg="3"
            xl="3"
            offset-md="9"
            offset-lg="9"
            offset-xl="9"
          >
            <form-monedas />
          </b-col>
        </b-row>
      </b-container>
      <div v-if="tasasCargadas">
        <hr />
        <b-container>
          <b-row v-if="ordenVinculada">
            <b-col>
              <b-alert show variant="warning">
                <h4 class="alert-heading">
                  Orden Vinculada {{ ordenVinculada }}
                </h4>
                <p>
                  Este orden estará vinculada con la orden número
                  {{ ordenVinculada }}.
                </p>
                <p>
                  Si desea desvincularla seleccione la opción desde la pestaña
                  <strong>Clientes</strong>
                </p>
              </b-alert>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <!-- Control buttons-->
              <div class="text-right mb-4">
                <b-button-group class="mt-2">
                  <b-button :disabled="disableButtons" @click="prev"
                    >Anterior
                  </b-button>
                  <b-button :disabled="disableButtons" @click="next">{{
                    nextText
                  }}</b-button>
                </b-button-group>
              </div>

              <!-- Guardar Orden para terminarla después -->
              <b-row>
                <b-col>
                  <b-button
                    @click="guardarOrden"
                    class="floatme"
                    variant="success"
                    >Guardar</b-button
                  >
                  <b-button @click="cargarOrden" class="floatme" variant="info"
                    >Cargar</b-button
                  >
                  <b-button @click="clearForm" class="floatme" variant="danger"
                    >Limpiar formulario</b-button
                  >
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <div>
                    <!-- Tabs with card integration -->
                    <b-card class="mt-4" no-body>
                      <b-tabs
                        v-model="tabIndex"
                        @change="preventTabClick"
                        small
                        card
                      >
                        <b-tab
                          title="Cliente"
                          title-link-class="h5"
                          :disabled="disable1"
                        >
                          <div class="wizard-content">
                            <h3 class="mb-4">Datos del cliente</h3>
                            <b-overlay
                              :show="loading.show"
                              rounded
                              opacity="0.6"
                              spinner-small
                              spinner-variant="primary"
                              class="d-inline-block"
                              @hidden="onHidden"
                            >
                              <b-row>
                                <b-col>
                                  <div class="buscador">
                                    <h5>Buscar Cliente</h5>
                                    <vue-typeahead-bootstrap
                                      @hit="loadForm"
                                      :data="
                                        $store.state.comerce.customersSelect
                                      "
                                      size="lg"
                                      v-model="query2"
                                      placeholder="Nombre o teléfono"
                                    />
                                  </div>
                                </b-col>
                              </b-row>
                              <b-row>
                                <b-col lg="12">
                                  <produccion-vincularOrden
                                    @reload="reloadVinculo"
                                  />
                                  <hr class="my-4 pb-4" />
                                </b-col>
                              </b-row>
                              <b-row>
                                <b-col lg="12">
                                  <b-form v-on:submit.prevent>
                                    <b-form-group>
                                      <label for="input-fecha"
                                        >Fecha de entega
                                        <span required>*</span></label
                                      >
                                      <b-form-datepicker
                                        id="input-fecha"
                                        v-model="form.fechaEntrega"
                                        class="mb-2 mr-sm-2 mb-sm-0"
                                        placeholder="Selecciona una fecha"
                                      ></b-form-datepicker>
                                    </b-form-group>

                                    <b-form-group>
                                      <label for="input-nombre"
                                        >Nombre <span required>*</span></label
                                      >
                                      <b-form-input
                                        id="input-nombre"
                                        ref="nombre"
                                        v-model="form.nombre"
                                        type="text"
                                        class="mb-2 mr-sm-2 mb-sm-0"
                                        placeholder="Ingrese el nombre"
                                      ></b-form-input>
                                    </b-form-group>

                                    <b-form-group>
                                      <label for="input-apellido"
                                        >Apellido <span required>*</span></label
                                      >
                                      <b-form-input
                                        id="input-apellido"
                                        v-model="form.apellido"
                                        type="text"
                                        class="mb-2 mr-sm-2 mb-sm-0"
                                        placeholder="Ingrese el apellido"
                                      ></b-form-input>
                                    </b-form-group>

                                    <b-form-group>
                                      <label for="input-telefono"
                                        >Teléfono <span required>*</span></label
                                      >
                                      <b-form-input
                                        id="input-telefono"
                                        v-model="form.telefono"
                                        type="tel"
                                        class="mb-2 mr-sm-2 mb-sm-0"
                                        placeholder="Ingrese teléfono"
                                      ></b-form-input>
                                    </b-form-group>

                                    <b-form-group>
                                      <label for="input-cedula">Cedula</label>
                                      <b-form-input
                                        id="input-cedula"
                                        v-model="form.cedula"
                                        type="text"
                                        class="mb-2 mr-sm-2 mb-sm-0"
                                        placeholder="Ingrese la Cédula"
                                      ></b-form-input>
                                    </b-form-group>

                                    <b-form-group>
                                      <label for="input-email">Email</label>
                                      <b-form-input
                                        id="input-email"
                                        v-model="form.email"
                                        type="email"
                                        class="mb-2 mr-sm-2 mb-sm-0"
                                        placeholder="Ingrese el email"
                                      ></b-form-input>
                                    </b-form-group>

                                    <b-form-group>
                                      <label for="input-address"
                                        >Dirección</label
                                      >
                                      <b-form-input
                                        id="input-address"
                                        v-model="form.direccion"
                                        type="text"
                                        class="mb-2 mr-sm-2 mb-sm-0"
                                        placeholder="Ingrese la dirección"
                                      ></b-form-input>
                                    </b-form-group>
                                  </b-form>
                                  <p info-form>
                                    <span required>*</span>
                                    Campos obligatorios
                                  </p>
                                </b-col>
                              </b-row>
                            </b-overlay>
                          </div>
                        </b-tab>
                        <b-tab
                          title="Productos"
                          title-link-class="h5"
                          :disabled="disable2"
                        >
                          <div class="wizard-content">
                            <b-row>
                              <b-col lg="12">
                                <b-list-group>
                                  <b-list-group-item
                                    >Cédula:
                                    {{ form.cedula }}</b-list-group-item
                                  >
                                  <b-list-group-item
                                    >Nombre:
                                    {{ form.nombre }}
                                    {{ form.apellido }}</b-list-group-item
                                  >
                                  <b-list-group-item
                                    >Teléfono:
                                    {{ form.telefono }}</b-list-group-item
                                  >
                                  <b-list-group-item
                                    >Email: {{ form.email }}</b-list-group-item
                                  >
                                  <b-list-group-item
                                    >Entrega:
                                    {{ form.fechaEntrega }}</b-list-group-item
                                  >
                                </b-list-group>
                                <br />
                              </b-col>
                            </b-row>

                            <b-row>
                              <b-col lg="6">
                                <b-list-group horizontal>
                                  <b-list-group-item>
                                    <h3>
                                      TOTAL A PAGAR: $
                                      {{ form.total }}
                                    </h3>
                                  </b-list-group-item>
                                  <br />
                                </b-list-group>
                                <b-row>
                                  <b-col lg="6" class="mt-4">
                                    <products-new @r="getResponseNewProduct" />
                                  </b-col>
                                </b-row>
                                <br />

                                <b-form-radio-group
                                  id="btn-radios-2"
                                  v-model="categoriaDeLaORden"
                                  :options="categoriaDeLaORdenOptions"
                                  button-variant="outline-primary"
                                  size="lg"
                                  name="radio-btn-outline"
                                  buttons
                                  class="mb-4"
                                  @input="changeCategory"
                                ></b-form-radio-group>

                                <vue-typeahead-bootstrap
                                  @hit="loadProduct"
                                  :data="
                                    $store.state.comerce.dataProductosSelect
                                  "
                                  v-model="query"
                                  placeholder="Seleccione los productos"
                                />
                              </b-col>
                            </b-row>

                            <b-row>
                              <b-col>
                                <h3 style="margin-top: 2rem">
                                  TOTAL PRODUCTOS:
                                  {{
                                    totalProductos(form.productos, "cantidad")
                                  }}
                                </h3>
                              </b-col>
                            </b-row>

                            <b-row>
                              <b-col lg="12" class="mt-4">
                                <b-table
                                  :stacked="isSmallScreen ? 'md' : false"
                                  :responsive="!isSmallScreen"
                                  borderless
                                  striped
                                  :primary-key="form.productos.item"
                                  :fields="campos"
                                  :items="form.productos"
                                  small
                                >
                                  <template #cell(nombre)="data">
                                    <a :href="`#${data.item.producto}`">{{
                                      data.item.item.producto
                                    }}</a>
                                  </template>

                                  <template #cell(item)="data">
                                    {{ data.index + 1 }}
                                  </template>

                                  <template #cell(cantidad)="data">
                                    <b-form-input
                                      v-model="
                                        form.productos[data.index].cantidad
                                      "
                                      min="0"
                                      :max="maxDesignLimit(data.item.cod)"
                                      type="number"
                                      @change="montoTotalOrden"
                                    ></b-form-input>
                                  </template>

                                  <template #cell(corte)="data">
                                    <b-form-select
                                      :disabled="
                                        checkDesignForDiseabled(data.item.cod)
                                      "
                                      v-model="form.productos[data.index].corte"
                                      :options="cortes"
                                    ></b-form-select>
                                  </template>

                                  <template #cell(precio)="data">
                                    <b-form-select
                                      v-model="
                                        form.productos[data.index].precio
                                      "
                                      @change="montoTotalOrden"
                                      :options="
                                        loadProductPrices(data.item.cod, null)
                                      "
                                    >
                                    </b-form-select>
                                  </template>

                                  <template #cell(talla)="data">
                                    <b-form-select
                                      :disabled="
                                        checkDesignForDiseabled(data.item.cod)
                                      "
                                      v-model="form.productos[data.index].talla"
                                      :options="$store.state.comerce.dataTallas"
                                      @change="
                                        recalcularSegunTalla(
                                          data.index,
                                          form.productos[data.index],
                                          data.item.cod
                                        )
                                      "
                                    ></b-form-select>
                                  </template>

                                  <template #cell(tela)="data">
                                    <b-form-select
                                      :disabled="
                                        checkDesignForDiseabled(data.item.cod)
                                      "
                                      v-model="form.productos[data.index].tela"
                                      :options="$store.state.comerce.dataTelas"
                                    ></b-form-select>
                                  </template>

                                  <template #cell(atributo)="data">
                                    <b-form-select
                                      :disabled="
                                        checkDesignForDiseabled(data.item.cod)
                                      "
                                      v-model="
                                        form.productos[data.index].atributo
                                      "
                                      :options="productAttributes"
                                    >
                                      <template #first>
                                        <b-form-select-option :value="null"
                                          >-- Seleccione
                                          --</b-form-select-option
                                        >
                                      </template></b-form-select
                                    >
                                  </template>

                                  <template #cell(acciones)="data">
                                    <div>
                                      <span class="floatme">
                                        <b-button
                                          :disabled="
                                            checkDesignForDiseabled(
                                              data.item.cod
                                            )
                                          "
                                          variant="primary"
                                          icon="ti-check"
                                          @click="
                                            duplicateItem(data.index, data.item)
                                          "
                                        >
                                          <b-icon-box-arrow-in-left></b-icon-box-arrow-in-left>
                                        </b-button>
                                      </span>
                                      <span class="floatme">
                                        <b-button
                                          variant="danger"
                                          icon="ti-check"
                                          @click="removeItem(data.index)"
                                        >
                                          <b-icon-trash></b-icon-trash>
                                        </b-button>
                                      </span>
                                    </div>
                                  </template>
                                </b-table>
                              </b-col>

                              <b-col lg="12">
                                <h3 class="mb-4 mt-4">Observaciones</h3>
                                <quill-editor
                                  v-model="form.obs"
                                  :options="quillOptions"
                                  @change="onEditorChange($event)"
                                ></quill-editor>
                              </b-col>
                            </b-row>
                          </div>
                        </b-tab>
                        <b-tab
                          title="Pago y asignación"
                          title-link-class="h5"
                          :disabled="disable3"
                        >
                          <div class="wizard-content">
                            <b-container>
                              <b-row>
                                <b-col class="mb-4">
                                  <h2>Monto pagado y asignacion de diseño</h2>
                                </b-col>
                              </b-row>
                              <b-row style="border: solid 1px lightgray">
                                <b-col class="mt-4">
                                  <b-row>
                                    <b-col
                                      xl="3"
                                      lg="3"
                                      md="3"
                                      sm="12"
                                      class="mb-4"
                                    >
                                      <h4 style="color: red">
                                        TOTAL: $
                                        {{ form.total }}
                                      </h4>
                                    </b-col>

                                    <b-col
                                      xl="3"
                                      lg="3"
                                      md="3"
                                      sm="12"
                                      class="mb-4"
                                    >
                                      <h4>
                                        ABONO: $
                                        {{ form.abono }}
                                      </h4>
                                      <!-- <b-form-input id="input-abono" min="0" v-model="form.abono" @keydown.enter.stop.prevent
                                      type="number" class="mb-2 mr-sm-2 mb-sm-0"
                                      placeholder="Ingrese el monto pagado"></b-form-input> -->
                                    </b-col>

                                    <b-col
                                      xl="3"
                                      lg="3"
                                      md="3"
                                      sm="12"
                                      class="mb-4"
                                    >
                                      <h4>
                                        DESC: $
                                        {{ form.descuento }}
                                      </h4>
                                    </b-col>
                                    <b-col
                                      xl="3"
                                      lg="3"
                                      md="3"
                                      sm="12"
                                      class="mb-4"
                                    >
                                      <h4>
                                        RESTA: $
                                        {{ calculoPago }}
                                      </h4>
                                    </b-col>
                                  </b-row>
                                </b-col>
                              </b-row>

                              <b-row>
                                <b-col xl="3" lg="3" md="3" sm="12">
                                  <b-row>
                                    <b-col>
                                      <hr />
                                      <h4>
                                        Dólares
                                        {{ totalDolares }}
                                      </h4>
                                    </b-col>
                                  </b-row>

                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-1"
                                        label="EFECTIVO"
                                        label-for="input-dolares-efectivo"
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-dolares-efectivo"
                                          type="number"
                                          step="0.10"
                                          min="0"
                                          @change="updateMontoAbono"
                                          v-model="form.montoDolaresEfectivo"
                                        ></b-form-input>
                                      </b-form-group>
                                      <hr />
                                    </b-col>
                                  </b-row>
                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-2"
                                        label="ZELLE"
                                        label-for="input-dolares-zelle"
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-dolares-zelle"
                                          type="number"
                                          step="0.10"
                                          min="0"
                                          @change="updateMontoAbono"
                                          v-model="form.montoDolaresZelle"
                                        ></b-form-input>
                                      </b-form-group>
                                      <b-form-input
                                        v-model="form.montoDolaresZelleDetalle"
                                        placeholder="Detalle de Zelle"
                                      ></b-form-input>
                                      <hr />
                                    </b-col>
                                  </b-row>

                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-3"
                                        label="BANESCO PANAMA"
                                        label-for="input-dolares-zelle"
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-dolares-zelle"
                                          type="number"
                                          step="0.10"
                                          min="0"
                                          @change="updateMontoAbono"
                                          v-model="form.montoDolaresPanama"
                                        ></b-form-input>
                                      </b-form-group>
                                      <b-form-input
                                        v-model="form.montoDolaresPanamaDetalle"
                                        placeholder="Detalle Banesco Panamá"
                                      ></b-form-input>
                                      <hr />
                                    </b-col>
                                  </b-row>
                                </b-col>
                                <b-col xl="3" lg="3" md="3" sm="12">
                                  <b-row>
                                    <b-col>
                                      <hr />
                                      <h4>
                                        Pesos
                                        {{ totalPesos }}
                                      </h4>
                                    </b-col>
                                  </b-row>

                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-4"
                                        label="EFECTIVO"
                                        label-for="input-dolares-efectivo"
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-pesos-efectivo"
                                          type="number"
                                          step="0.10"
                                          min="0"
                                          v-model="form.montoPesosEfectivo"
                                          @change="updateMontoAbono"
                                        ></b-form-input>
                                      </b-form-group>
                                      <hr />
                                    </b-col>
                                  </b-row>
                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-5"
                                        label="TRANSFERENCIA"
                                        label-for="input-dolares-zelle"
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-pesos-dolares-zelle"
                                          type="number"
                                          step="0.10"
                                          min="0"
                                          v-model="form.montoPesosTransferencia"
                                          @change="updateMontoAbono"
                                        ></b-form-input>
                                      </b-form-group>
                                      <b-form-input
                                        v-model="
                                          form.montoPesosTransferenciaDetalle
                                        "
                                        placeholder="Detalle Pesos transferencia"
                                      ></b-form-input>
                                      <hr />
                                    </b-col>
                                  </b-row>
                                </b-col>
                                <b-col xl="3" lg="3" md="3" sm="12">
                                  <b-row>
                                    <b-col>
                                      <hr />
                                      <h4>
                                        Bolívares
                                        {{ totalBolivares }}
                                      </h4>
                                    </b-col>
                                  </b-row>

                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-6"
                                        label="EFECTIVO"
                                        label-for="input-bolivares-efectivo "
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-bolivares-efectivo"
                                          type="number"
                                          step="0.10"
                                          min="0"
                                          v-model="form.montoBolivaresEfectivo"
                                          @change="updateMontoAbono"
                                        ></b-form-input>
                                      </b-form-group>
                                      <hr />
                                    </b-col>
                                  </b-row>

                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-6"
                                        label="PAGO MOVIL"
                                        label-for="input-bolivares-pagomovil "
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-bolivares-pagomovil"
                                          type="number"
                                          step="0.10"
                                          min="0"
                                          v-model="form.montoBolivaresPagomovil"
                                          @change="updateMontoAbono"
                                        ></b-form-input>
                                      </b-form-group>
                                      <b-form-input
                                        v-model="
                                          form.montoBolivaresPagomovilDetalle
                                        "
                                        placeholder="Detalle pago móvil"
                                      ></b-form-input>
                                      <hr />
                                    </b-col>
                                  </b-row>

                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-6"
                                        label="TRANSFERENCIA"
                                        label-for="input-bolivares-transferencia "
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-bolivares-transferencia"
                                          type="number"
                                          step="0.10"
                                          min="0"
                                          v-model="
                                            form.montoBolivaresTransferencia
                                          "
                                          @change="updateMontoAbono"
                                        ></b-form-input>
                                      </b-form-group>
                                      <b-form-input
                                        v-model="
                                          form.montoBolivaresTransferenciaDetalle
                                        "
                                        placeholder="Detalle Bolívares transferecia"
                                      ></b-form-input>
                                      <hr />
                                    </b-col>
                                  </b-row>

                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-6"
                                        label="PUNTO"
                                        label-for="input-bolivares-punto "
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-bolivares-punto"
                                          type="number"
                                          step="0.10"
                                          min="0"
                                          v-model="form.montoBolivaresPunto"
                                          @change="updateMontoAbono"
                                        ></b-form-input>
                                      </b-form-group>
                                    </b-col>
                                  </b-row>
                                </b-col>

                                <b-col xl="3" lg="3" md="3" sm="12">
                                  <b-row>
                                    <b-col>
                                      <hr />
                                      <h4>DESCUENTO</h4>
                                    </b-col>
                                  </b-row>

                                  <b-row align-h="start">
                                    <b-col>
                                      <b-form-group
                                        id="input-group-10"
                                        label="DESCUENTO"
                                        label-for="input-dolares-descuento"
                                        class="pl-2"
                                      >
                                        <b-form-input
                                          id="input-grpoup-10"
                                          min="0"
                                          step="0.10"
                                          v-model="form.descuento"
                                          @keydown.enter.stop.prevent
                                          type="number"
                                          class="mb-2 mr-sm-2 mb-sm-0"
                                          placeholder="Ingrese el descuento"
                                        ></b-form-input>
                                      </b-form-group>
                                      <b-form-input
                                        v-model="form.descuentoDetalle"
                                        placeholder="Detalle Descuento"
                                      ></b-form-input>
                                      <hr />
                                    </b-col>
                                  </b-row>
                                </b-col>
                              </b-row>
                            </b-container>

                            <!-- <b-row>
                                <b-col lg="12" class="mb-4">
                                  <b-row>
                                    <b-col lg="2">
                                      <label for="input-abono" style="margin-right: 1rem">ABONO</label>
                                      <b-form-input id="input-abono" v-model="form.abono" @keydown.enter.stop.prevent type="number" class="mb-2 mr-sm-2 mb-sm-0" placeholder="Ingrese el monto pagado"></b-form-input>
                                    </b-col>
                                  </b-row>
                                </b-col>
                              </b-row> -->

                            <!-- <b-row>
                            <b-col lg="12" class="mb-4" style="vertical-align: baseline">
                              <hr />
                              <div>
                                <b-form-group
                                  label="Seleccion el tipo de Diseño"
                                  v-slot="{ ariaDescribedby }"
                                >
                                  <b-form-radio
                                    v-model="form.diseno"
                                    :aria-describedby="ariaDescribedby"
                                    name="some-radios"
                                    value="gráfico"
                                    >Gráfico</b-form-radio
                                  >
                                  <b-form-radio
                                    v-model="form.diseno"
                                    :aria-describedby="ariaDescribedby"
                                    name="some-radios"
                                    value="modas"
                                    >Modas</b-form-radio
                                  >
                                  <b-form-radio
                                    v-model="form.diseno"
                                    :aria-describedby="ariaDescribedby"
                                    name="some-radios"
                                    value="no"
                                    >Sin diseño</b-form-radio
                                  >
                                </b-form-group>
                              </div>
                              <hr />
                            </b-col>
                          </b-row> -->
                          </div>
                        </b-tab>
                        <b-tab
                          title="Emitir orden"
                          title-link-class="h5"
                          :disabled="disable4"
                        >
                          <div class="wizard-content">
                            <b-row>
                              <b-col>
                                <b-alert
                                  style="padding: 2.4rem"
                                  variant="success"
                                  show
                                >
                                  <h2>
                                    Verifique todos los datos antes de emitir la
                                    Orden
                                  </h2>
                                </b-alert>
                              </b-col>
                            </b-row>

                            <b-row>
                              <b-col>
                                <div id="reporte">
                                  <b-overlay :show="overlay">
                                    <ordenes-preview
                                      :form="formPrint"
                                      :showpreview="true"
                                    />
                                  </b-overlay>
                                </div>
                              </b-col>
                            </b-row>
                          </div>
                        </b-tab>
                      </b-tabs>
                    </b-card>

                    <!-- <div class="text-right mt-4">
                      <b-button-group>
                        <b-button @click="prev">Anterior</b-button>
                        <b-button @click="next">{{ nextText }}</b-button>
                      </b-button-group>
                    </div> -->
                    <!-- Control buttons-->
                    <div class="text-right mb-4">
                      <b-button-group class="mt-2">
                        <b-button :disabled="disableButtons" @click="prev"
                          >Anterior
                        </b-button>
                        <b-button :disabled="disableButtons" @click="next">{{
                          nextText
                        }}</b-button>
                      </b-button-group>
                    </div>
                  </div>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-container>
      </div>

      <b-container v-else>
        <b-row>
          <b-col>
            <b-alert show variant="warning">
              Por favor indique las Tasas del día</b-alert
            >
          </b-col>
        </b-row>
      </b-container>

      <template #overlay>
        <div class="text-center">
          <b-icon icon="stopwatch" font-scale="3" animation="cylon"></b-icon>
          <p id="cancel-label">{{ loadingMsg }}</p>
        </div>
      </template>
    </b-overlay>
  </div>
</template>

<script>
import mixins from "~/mixins/mixins.js";
import axios from "axios";
import { mapState, mapGetters } from "vuex";
import quillOptions from "~/plugins/nuxt-quill-plugin";
import FormMonedas from "~/components/formMonedas.vue";

export default {
  data() {
    return {
      isSmallScreen: false,
      quillOptions,
      endpoint: "/ordenes/nueva/custom", // Opciones: `/ordenes/nueva/custom` - `/ordenes/nueva/sport`
      categoriaDeLaORden: "custom", // Puede ser `custom` o `sport`
      categoriaDeLaORdenOptions: [
        { text: "Fábrica", value: "custom" },
        { text: "Tienda", value: "sport" },
      ],
      opcionesDePago: [
        { value: "Dólares", text: "Dólares" },
        { value: "Pesos", text: "Pesos" },
        { value: "Tarjeta", text: "Tarjeta" },
        { value: "Bolívares", text: "Bolívares" },
        { value: "Zelle", text: "Zelle" },
        { value: "Banesco Panamá", text: "Banesco Panamá" },
      ],
      disableButtons: false,
      disable1: false,
      disable2: true,
      disable3: true,
      disable4: true,
      nextText: "Siguiente",

      ordenVinculada: 0,

      ordenesGuardadas: [],

      tabIndex: 0,
      query: "",
      query2: "",
      myTelas: [],
      myCustomers: this.$store.state.comerce.dataCustomers || [],
      mySizes: [],
      products: [],
      productsSelect: [],
      customersSelect: [],
      responseClientes: [],
      tasasLoaded: false,
      formPrint: {
        id: "",
        cedula: "", // Datos del cliente
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        direccion: "",
        fechaEntrega: "",
        productos: [], // Datos para la tabla de productos
        obs: "",
        tasaDolar: 0,
        tasaPeso: 0,
        montoDolaresEfectivo: 0,
        montoDolaresEfectivoDetalle: "",
        montoDolaresZelle: 0,
        montoDolaresZelleDetalle: "",
        montoDolaresPanama: 0,
        montoDolaresPanamaDetalle: "",
        montoPesosEfectivo: 0,
        montoPesosEfectivoDetalle: "",
        montoPesosTransferencia: 0,
        montoPesosTransferenciaDetalle: "",
        montoBolivaresEfectivo: 0,
        montoBolivaresEfectivoDetalle: "",
        montoBolivaresPunto: 0,
        montoBolivaresPuntoDetalle: "",
        montoBolivaresPagomovil: 0,
        montoBolivaresPagomovilDetalle: "",
        montoBolivaresTransferencia: 0,
        montoBolivaresTransferenciaDetalle: "",
        abono: 0, // Pago total o parcial
        descuento: 0,
        descuentoDetalle: "",
        total: 0, // Pago total o parcial
        diseno_grafico: false,
        diseno_grafico_cantidad: 0,
        diseno_modas: false,
        diseno_modas_cantidad: 0,
        comision: null,
        next: 0,
      },
      form: {
        id: "",
        cedula: "", // Datos del cliente
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        direccion: "",
        fechaEntrega: "",
        productos: [], // Datos para la tabla de productos
        metodoDePago: [],
        obs: "",
        tasaDolar: 0,
        tasaPeso: 0,
        montoDolaresEfectivo: 0,
        montoDolaresEfectivoDetalle: "",
        montoDolaresZelle: 0,
        montoDolaresZelleDetalle: "",
        montoDolaresPanama: 0,
        montoDolaresPanamaDetalle: "",
        montoPesosEfectivo: 0,
        montoPesosEfectivoDetalle: "",
        montoPesosTransferencia: 0,
        montoPesosTransferenciaDetalle: "",
        montoBolivaresEfectivo: 0,
        montoBolivaresEfectivoDetalle: "",
        montoBolivaresPunto: 0,
        montoBolivaresPuntoDetalle: "",
        montoBolivaresPagomovil: 0,
        montoBolivaresPagomovilDetalle: "",
        montoBolivaresTransferencia: 0,
        montoBolivaresTransferenciaDetalle: "",
        abono: 0, // Pago total o parcial
        descuento: 0,
        descuentoDetalle: "",
        total: 0, // Pago total o parcial
        diseno_grafico: false,
        diseno_grafico_cantidad: 0,
        diseno_modas: false,
        diseno_modas_cantidad: 0,
        sales_commision: null,
        next: 0,
        disableControl: false,
      },
      cortes: [
        {
          value: "No aplica",
          text: "No aplica",
        },
        {
          value: "Damas",
          text: "Damas",
        },
        {
          value: "Caballeros",
          text: "Caballeros",
        },
        {
          value: "Niños",
          text: "Niños",
        },
      ],
      campos: [
        { key: "item", label: "Item" },
        { key: "cod", label: "cod" },
        { key: "producto", label: "producto" },
        { key: "precio", label: "precio" },
        { key: "existencia", label: "existencia" },
        { key: "cantidad", label: "cantidad" },
        { key: "talla", label: "talla", tdClass: "min-width" },
        { key: "corte", label: "corte" },
        { key: "tela", label: "tela" },
        { key: "atributo", label: "Atributo" },
        { key: "color", label: "color" },
        { key: "acciones", label: "acciones" },
      ],
      fieldsGuardadas: [
        { key: "tipo", label: "Tipo" },
        { key: "form", label: "Cliente" },
        { key: "empleado", label: "Vendedor" },
        { key: "_id", label: "Eliminar" },
      ],
      loadingMsg: "Cargando datos...",
      mainOverlay: this.$store.state.login.loading,
      overlay: false,
      loading: {
        show: false,
        text: "",
      },
      productAttributes: [],
    };
  },

  computed: {
    ...mapState("login", ["tasas"]),
    /* tableClass() {
            return {
                "table-stacked": this.isSmallScreen,
                "table-responsive": !this.isSmallScreen,
            }
        }, */
    isSmallScreen() {
      return window.innerWidth < 768; // Cambia el valor según el tamaño de pantalla deseado
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    ...mapGetters("comerce", ["getProductsSport", "getProductsCustom"]),

    typeHeadData() {
      return this.$store.getters["comerce/getCustomersSelect"];
    },

    tasasCargadas() {
      let cargadas = false;
      const tipos = this.$store.state.login.dataEmpresa.tipos_de_monedas || [];
      const activeMonedas = tipos.filter((m) => m.activo);
      if (activeMonedas.length > 0) {
        cargadas = activeMonedas.every(
          (moneda) => this.tasas[moneda.moneda] > 0
        );
      }
      return cargadas;
    },

    miMonto() {
      return this.totalPago();
    },

    totalDolares() {
      let totalDolares = 0;
      let dolaresEfectivo = parseFloat(this.form.montoDolaresEfectivo);
      let dolaresZelle = parseFloat(this.form.montoDolaresZelle);
      let dolaresPanama = parseFloat(this.form.montoDolaresPanama);

      if (!dolaresEfectivo) {
        dolaresEfectivo = 0.0;
      }
      if (!dolaresPanama) {
        dolaresPanama = 0.0;
      }
      if (!dolaresZelle) {
        dolaresZelle = 0.0;
      }

      totalDolares = dolaresEfectivo + dolaresPanama + dolaresZelle;
      this.updateMontoAbono();
      return totalDolares.toFixed(2);
    },

    totalPesos() {
      let totalPesos = 0;
      let pesosEfectivo = parseFloat(this.form.montoPesosEfectivo);
      let pesosTransferencia = parseFloat(this.form.montoPesosTransferencia);

      if (!pesosEfectivo) {
        pesosEfectivo = 0.0;
      }
      if (!pesosTransferencia) {
        pesosTransferencia = 0.0;
      }

      totalPesos = pesosEfectivo + pesosTransferencia;
      return totalPesos.toFixed(2);
    },

    totalBolivares() {
      let totalBolivares = 0;
      let bolivaresEfectivo = parseFloat(this.form.montoBolivaresEfectivo);
      let bolivaresPagomovil = parseFloat(this.form.montoBolivaresPagomovil);
      let bolivaresPunto = parseFloat(this.form.montoBolivaresPunto);
      let bolivaresTransferencia = parseFloat(
        this.form.montoBolivaresTransferencia
      );

      if (!bolivaresEfectivo) {
        bolivaresEfectivo = 0.0;
      }

      if (!bolivaresPagomovil) {
        bolivaresPagomovil = 0.0;
      }

      if (!bolivaresPunto) {
        bolivaresPunto = 0.0;
      }

      if (!bolivaresTransferencia) {
        bolivaresTransferencia = 0.0;
      }

      totalBolivares =
        bolivaresEfectivo +
        bolivaresPagomovil +
        bolivaresTransferencia +
        bolivaresPunto;
      return totalBolivares.toFixed(2);
    },

    // ANTERIOR DESADE AQUI
    calculoPago() {
      let saldo;
      if (isNaN(this.form.abono)) {
        this.form.abono = 0;
      }

      if (isNaN(this.form.total)) {
        this.form.total = 0;
      }

      if (isNaN(this.form.descuento)) {
        this.form.descuento = 0;
      }

      saldo =
        parseFloat(this.form.total) -
        parseFloat(this.form.abono) -
        parseFloat(this.form.descuento).toFixed(2);

      return saldo;
    },
  },

  watch: {
    query2(val) {
      if (!val.trim() || val.trim() === "") {
        this.clearStep1();
      }
    },
    /*     query2(val) {
      if (!val.trim() || val.trim() === '') {
        this.clearStep1()
        this.form.sales_commision = null
      } else {
        const myID = val.split(' | ')
        console.log('Filtremos le ID del cliente', myID[0])
        const comision = this.myCustomers
          .filter((el) => el.id === myID[0])
          .map((el) => {
            return el
          })
        console.warn('vector de la comision', comision)


          // DE MOMENTO SOLO ESTAMOS USANDO sales_commision PARA GUARDAR `sales_commision`
          // por este motivo no estamos validando nombre de el campo y valor, motivo: Todo lo más rápido

        let x
        if (comision.length > 0 && comision[0].key === 'sales_commission') {
          console.log('comission_key', comision[0].key)
          const booleanValue = Boolean(comision[0].value)
          x = booleanValue
        } else {
          x = true
        }
        this.form.sales_commision = x
        console.log('comison de vendedores', x)
      }
    }, */

    tabIndex(val) {
      if (val === 3) {
        this.nextText = "Finalizar";
      } else {
        this.nextText = "Siguiente";
      }
    },
  },

  methods: {
    ...mapState("login", ["tasas"]),
    checkPrices() {
      let checking = this.form.productos.filter((el) => el.precio === 0);

      if (checking.length) {
        return false;
      } else {
        return true;
      }
    },

    updateTotal(item) {
      console.log("updateTotal", item);
    },

    checkScreenSize() {
      this.isSmallScreen = window.innerWidth < 768; // Cambia el valor según tu necesidad
    },

    handleResize() {
      this.checkScreenSize();
    },

    loadFormGuardadas(idArray, idTable) {
      this.form = this.ordenesGuardadas[idArray].form;
      console.log("cargar orden:", this.ordenesGuardadas[idArray].form);
      this.clearSearch();
      this.$bvModal.hide(this.modal);
      /*  this.deleteOrdenGuardada(idTable).then(() => {
         this.$bvModal.hide(this.modal)
       }) */
    },

    async getOrdenesGuardadas() {
      await this.$axios
        .get(`${this.$config.API}/ordenes/guardadas`)
        .then((res) => {
          console.log("response getOrdenesGuardadas", res.data.items);
          // this.ordenesGuardadas = res.data.items
          this.ordenesGuardadas = res.data.items.map((item) => {
            const parsedForm = JSON.parse(item.form);
            return { ...item, form: parsedForm };
          });
          // this.ordenesGuardadas = res.data.items
          console.log("this.ordenesGuardadas", this.ordenesGuardadas);
        });
    },

    async postOrden() {
      const data = new URLSearchParams();
      data.set("form", JSON.stringify(this.form));
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("tipo", "Orden");
      this.overlay = true;

      await this.$axios
        .post(`${this.$config.API}/orden/guardar`, data)
        .then((res) => {
          this.getOrdenesGuardadas();
          // this.clearForm()
        })
        .catch((err) => {
          /*this.$fire({
            title: 'Error',
            html: `<p>Algo salió mal guardando la orden</p><p>${err}</p>`,
            type: 'warning',
          })*/
        })
        .finally(() => {
          this.overlay = false;
          this.$bvModal.hide(this.modal);
        });
    },
    async deleteOrdenGuardada(id) {
      const data = new URLSearchParams();
      data.set("id", id);
      this.overlay = true;

      await this.$axios
        .post(`${this.$config.API}/ordenes/guardadas/eliminar`, data)
        .then((res) => {
          this.getOrdenesGuardadas();
          this.clearForm();
        })
        .catch((err) => {
          /*this.$fire({
            title: 'Error',
            html: `<p>Algo salió mal guardando la orden</p><p>${err}</p>`,
            type: 'warning',
          })*/
        })
        .finally(() => {
          this.overlay = false;
          // this.$bvModal.hide(this.modal)
        });
    },

    guardarOrden() {
      if (this.form.id === "") {
        this.$fire({
          title: "Datos",
          html: `<p>debe seleccionar un cliente</p>`,
          type: "warning",
        });
      } else {
        this.$confirm(
          "",
          `¿Desea guardar la orden que está creando?`,
          "question"
        )
          .then(() => {
            this.postOrden();
          })
          .catch(() => {
            return false;
          });
      }
    },
    cargarOrden() {
      this.$bvModal.show(this.modal);
    },
    changeCategory() {
      // Definir el endpoint para crear la orden
      if (this.categoriaDeLaORden === "custom") {
        this.endpoint = `/ordenes/nueva/custom`;
        const productsSelect = this.getProductsCustom.map((prod) => {
          return `${prod.cod} | ${prod.name}`;
        });
        this.$store.commit("comerce/setDataProductosSelect", productsSelect);
      } else if (this.categoriaDeLaORden === "sport") {
        this.endpoint = `/ordenes/nueva/sport`;
        const productsSelect = this.getProductsSport.map((prod) => {
          return `${prod.cod} | ${prod.name}`;
        });
        this.$store.commit("comerce/setDataProductosSelect", productsSelect);
      }

      this.form.productos = [];
    },

    maxDesignLimit(cod) {
      let limit;
      if (this.validatDesign(cod)) {
        limit = 1000; // CAntida máxima de diseÑos por item de la orden
      } else {
        limit = 1000;
      }
      return limit;
    },

    checkDesignForDiseabled(cod) {
      let ok;
      if (this.validatDesign(cod)) {
        ok = true;
      } else {
        ok = false;
      }
      console.log(`validar codigo es`, ok, cod);
      return ok;
    },

    checkTallasTelas() {
      let checking = this.form.productos.filter(
        (el) => el.diseno === false && (el.talla === null || el.tela === null)
      );

      console.log("checking.length", checking.length);

      if (checking.length) {
        return false;
      } else {
        return true;
      }
    },

    actualizarAbono() {
      // Creamos un array con los nombres de los campos que queremos sumar
      const campos = [
        "montoDolaresEfectivo",
        "montoDolaresZelle",
        "montoDolaresPanama",
        "montoPesosEfectivo",
        "montoPesosTransferencia",
        "montoBolivaresEfectivo",
        "montoBolivaresPunto",
        "montoBolivaresPagomovil",
        "montoBolivaresTransferencia",
      ];

      // Calculamos la suma de los campos
      const monto = campos.reduce((acumulador, campo) => {
        return parseFloat(acumulador) + parseFloat(this.form[campo]);
      }, 0);

      this.form.abono = monto;
    },

    updateMontoAbono() {
      let newVal;
      let montoBolivares;
      let montoDolares;
      let montoPesos;

      // LIMPIAR VALORES ERRONEOS
      if (this.form.montoBolivaresEfectivo === "")
        this.form.montoBolivaresEfectivo = 0;
      if (this.form.montoBolivaresPagomovil === "")
        this.form.montoBolivaresPagomovil = 0;
      if (this.form.montoBolivaresPunto === "")
        this.form.montoBolivaresPunto = 0;
      if (this.form.montoBolivaresTransferencia === "")
        this.form.montoBolivaresTransferencia = 0;
      if (this.form.montoDolaresEfectivo === "")
        this.form.montoDolaresEfectivo = 0;
      if (this.form.montoDolaresPanama === "") this.form.montoDolaresPanama = 0;
      if (this.form.montoDolaresZelle === "") this.form.montoDolaresZelle = 0;
      if (this.form.montoPesosEfectivo === "") this.form.montoPesosEfectivo = 0;
      if (this.form.montoPesosTransferencia === "")
        this.form.montoPesosTransferencia = 0;

      // RESET MONTO ABONO
      this.form.abono = 0;

      // CALCULO DOLARES
      montoDolares =
        parseFloat(this.form.montoDolaresEfectivo) +
        parseFloat(this.form.montoDolaresPanama) +
        parseFloat(this.form.montoDolaresZelle);

      // CALCULO EN PESOS
      montoPesos =
        (parseFloat(this.form.montoPesosEfectivo) +
          parseFloat(this.form.montoPesosTransferencia)) /
        parseFloat(this.tasas.peso_colombiano);

      // CALCULO EN BOLIVARES
      montoBolivares =
        (parseFloat(this.form.montoBolivaresEfectivo) +
          parseFloat(this.form.montoBolivaresPagomovil) +
          parseFloat(this.form.montoBolivaresPunto) +
          parseFloat(this.form.montoBolivaresTransferencia)) /
        parseFloat(this.tasas.bolivar);

      // crear
      // SUMATOORIA DE TODAS LAS MONEDAS
      console.log("dolares", montoDolares);
      console.log("pesos", montoPesos);
      console.log("bolivares", montoBolivares);
      newVal = (montoDolares + montoPesos + montoBolivares).toFixed(2);
      this.form.abono = newVal;
      console.log("this.form.abono = ", newVal);
      return newVal;
    },

    totalPago() {
      let result = 0;
      const totalMonto =
        this.totalBolivares + this.totalPesos + this.totalBolivares;
      result = totalMonto;
      return result;
    },

    // ANTERIOR DESDE AQUI
    preventTabClick(tab) {
      console.log("Tab click", tab);
      this.preventDefault();
    },

    clearSearch() {
      this.query2 = "";
    },

    recalcularSegunTalla(index, item, idProd) {
      // verificar si la talla es XL
      let miTalla = item.talla.split("XL");
      let montoXL = 0;
      let finlaPrice = 0;

      if (miTalla.length === 2) {
        // Verificar precio seleccionado
        if (item.precio <= 0) {
          this.$fire({
            title: "Precio",
            html: `<p>Debe seleccionar el precio antes de seleccionar una talla Extra Grande</p>`,
            type: "info",
          }).then(() => {
            this.form.productos[index].talla = null;
          });
        } else {
          if (!miTalla[1]) {
            montoXL = 1; // Un dolar adiconal por la talla XL
          } else {
            montoXL = parseInt(miTalla[1]);
          }
          // this.form.productos[index].xl = montoXL
          finlaPrice = (
            parseFloat(this.form.productos[index].precio) + montoXL
          ).toFixed(0);

          // Añadir precio a $store.state.comerce.dataProductos
          const addVal = {
            cod: idProd,
            price: finlaPrice,
            description: `Precio ${item.talla}`,
          };

          this.$store.commit("comerce/addDataProductos", addVal);

          this.loadProductPrices(idProd, addVal);
        }
      } else {
        finlaPrice = this.form.productos[index].precio;
      }

      this.form.productos[index].precio = finlaPrice;
      this.montoTotalOrden();
    },

    reloadVinculo(val) {
      console.log("Orden a vincular:", val);
      this.ordenVinculada = val;
    },

    prev() {
      if (this.tabIndex === 1) {
        this.disable1 = false;
        this.tabIndex--;
        this.disable2 = true;
      }

      if (this.tabIndex === 2) {
        this.disable2 = false;
        this.tabIndex--;
        this.disable3 = true;
      }

      if (this.tabIndex === 3) {
        this.disable3 = false;
        this.tabIndex--;
        this.disable4 = true;
      }
    },

    next() {
      if (this.tabIndex === 0) {
        this.validateStep1();
      }

      if (this.tabIndex === 1) {
        this.validateStep2();
      }

      if (this.tabIndex === 2) {
        this.validateStep3();
      }

      if (this.tabIndex === 3) {
        this.validateStep4();
      }
    },

    validateStep1() {
      if (this.step1()) {
        this.disable1 = true;
        this.disable2 = false;
        this.loadDataCustomers();

        setTimeout(() => {
          this.tabIndex = 1;
        }, 100);
      } else {
        this.disable2 = true;
        this.disable3 = true;
        this.disable4 = true;
      }
    },

    validateStep2() {
      if (this.step2()) {
        this.disable2 = true;
        this.disable3 = false;
        setTimeout(() => {
          this.tabIndex = 2;
        }, 100);
      } else {
        this.disable3 = true;
        this.disable4 = true;
      }
    },

    validateStep3() {
      if (this.step3()) {
        this.disable3 = true;
        this.disable4 = false;
        setTimeout(() => {
          this.tabIndex = 3;
        }, 100);
      }
    },

    validateStep4() {
      if (this.step4()) {
        // this.disable3 = false
      }
    },

    step1() {
      let ok = true;
      let msg = "";
      let phoneExist = this.phoneExist(this.form.email);

      console.log(`phoneExist`, phoneExist);

      if (!this.form.telefono.trim()) {
        ok = false;
        msg = msg + "<p>El teléfono es un campo obligatorio</p>";
      }

      if (!this.form.nombre.trim()) {
        ok = false;
        msg = msg + "<p>El nombre es un campo obligatorio</p>";
      }

      if (!this.form.apellido.trim()) {
        ok = false;
        msg = msg + "<p>El apellido es un campo obligatorio</p>";
      }

      if (!this.form.fechaEntrega.trim()) {
        ok = false;
        msg = msg + "<p>La fecha de entrega es un campo obligatorio</p>";
      }

      if (!this.validarEmail(this.form.email) && this.form.email.trim() != "") {
        ok = false;
        msg = "El email que introdujo no es válido: " + this.form.email;
      } else if (phoneExist.exist) {
        ok = false;
        msg = msg + phoneExist.msg;
      }

      if (!ok) {
        this.$fire({
          type: "info",
          title: "Datos requeridos",
          html: msg,
        });
        // Volver a mostrar Placeholder si el campo es espacio en blanco
        if (!this.form.cedula.trim()) this.form.cedula = "";
        if (!this.form.nombre.trim()) this.form.nombre = "";

        // ok = FontFaceSetLoadEvent
        ok = false;
      } else {
        // update customer
        this.updateCustomer()
          .then(() => {
            ok = false;
          })
          .then(() => (ok = true));
      }
      console.log("ok paso 1", ok);
      return ok;
    },

    step2() {
      let ok = true;
      let ceroPrice = null;

      let checkCantidad = this.form.productos.filter((item) => {
        return item.cantidad === 0 || item.cantidad === "0";
        /*  return (
          item.cantidad === 0 &&
          item.cod != 20203 &&
          item.cod != 20237 &&
          item.cod != 20264 &&
          item.cod != 20266
        ) */
      });
      console.log("cantidades de productos", checkCantidad);

      if (this.form.productos.length) {
        console.log("(checkCantidad.length", checkCantidad.length);
        if (checkCantidad.length > 0) {
          ceroPrice = true;
        } else {
          ceroPrice = false;
        }
      } else {
        ceroPrice = true;
      }

      let checkingTallaTela = this.checkTallasTelas();

      if (!this.form.productos.length || ceroPrice || !checkingTallaTela) {
        let errors = "";
        ok = false;

        if (!this.checkPrices()) {
          errors =
            errors + `<p>Debe asignar el precio de todos los productos</p>`;
        }

        if (!checkingTallaTela)
          errors = errors + `<p>Debe seleccionar a Talla y la Tela</p>`;

        if (!this.form.productos.length)
          errors = errors + `<p>Debe seleccionar al menos un producto</p>`;

        if (ceroPrice)
          errors =
            errors + `<p>Los productos no pueden tener cantidad cero</p>`;

        this.$fire({
          type: "info",
          title: "Datos requeridos",
          html: errors,
        });
      }
      this.checkDesigner();
      return ok;
    },

    step3() {
      let ok = true;
      // Veerificar el monto pagado
      let abono = parseFloat(this.form.abono);
      let descuento = parseFloat(this.form.descuento);
      let total = parseFloat(this.form.total);

      if (abono + descuento > total) {
        ok = false;
        this.$fire({
          title: "Monto",
          html: "El monto pagadoe excede el total de la orden",
          type: "error",
        });
      } else {
        // Crear copia del formulario
        this.formPrint = this.form;
      }

      // if (this.form.metodoDePago.length === 0) {
      if (parseFloat(this.form.abono) === 0) {
        ok = true;
        this.$fire({
          title: "Método de pago",
          html: "La orden se emitirá totalmente a crédito",
          type: "warning",
        });
      }
      return ok;
    },

    step4() {
      this.$confirm("¿Desea emitir la orden?", "Finalizar", "success").then(
        () => {
          this.overlay = true;
          this.disableButtons = true;
          this.finishOrder(); /* .then(() => {
                    this.$confirm(
                        "¿Desea imprimir una copia de la orden orden?",
                        "Imprimir",
                        "info"
                    )
                        .then(() => {
                            this.printOrder("reporte").then(() => {
                                this.clearForm({
                                    form: true,
                                    formPrint: true,
                                })
                            })
                        })
                        .catch(() => {
                            this.overlay = false
                            this.disableButtons = false
                            this.clearForm({
                                form: true,
                                formPrint: true,
                            })
                        })
                        .then(() => {
                            this.overlay = false
                            this.disableButtons = false
                        })
                }) */
        }
      );

      return true;
    },

    loadForm() {
      const dataLength = this.query2.trim().length;
      // console.log('query2 length', dataLength)
      if (!dataLength) {
        this.clearStep1();
      } else {
        let myID = this.query2.split(" | ");
        console.log("myID", myID[0]);
        const customer = this.$store.state.comerce.dataCustomers.find(
          (el) => el.id == myID[0]
        );

        if (customer.sales_commision === "false") {
          this.form.sales_commision = false;
        } else {
          this.form.sales_commision = true;
        }

        // Script antes de cambiar el método de buscar clientes
        /* if (customer.sales_commision.length) {
          let comVal = ''
          if (customer.sales_commision[0].key === 'sales_commission') {
            console.log('vamos a convertir', customer.sales_commision[0].value)
            if (customer.sales_commision[0].value === 'false') {
              comVal = false
            } else {
              comVal = true
            }
            console.log('lo convedrtimos?', comVal)
          } else {
            comVal = true
          }
          this.form.sales_commision = comVal
        } else {
          this.form.sales_commision = true
        } */
        console.warn("comision vendedor", this.form.sales_commision);
        console.log("customer XXX", customer.sales_commision);

        if (customer) {
          console.log("myCustomer", customer);
          this.enableControl = true;

          this.form.id = customer.id;
          this.form.nombre = customer.first_name;
          this.form.cedula = customer.cedula;
          this.form.apellido = customer.last_name;
          this.form.telefono = this.formatPhoneNumber(customer.phone);
          this.form.direccion = customer.address;

          /**los email que empiezan con 'none_'
           * son asignados por el sistema
           * en caso de no haber proporcionado un email
           * al momento de enviar el fromulario */
          let exp = customer.email.split("none_");
          if (exp[0] === "none_") {
            this.form.email = "";
          } else {
            this.form.email = customer.email;
          }
        } else {
          this.clearStep1();
        }
        if (this.form.id != "") {
        } else if (this.form.telefono === "" || !this.form.telefono) {
          this.form.id = "";
          this.form.nombre = "";
          this.form.apellido = "";
          this.form.telefono = "";
          this.form.email = "";
          this.form.direccion = "";
        } else {
          this.form.id = "";
          this.form.nombre = "";
          this.form.apellido = "";
          this.form.telefono = "";
          this.form.email = "";
          this.form.direccion = "";
        }
      }
    },

    filterCustomer(key) {
      const cedulaLength = this.form.cedula.trim().length;
      if (!cedulaLength) {
        this.clearStep1();
      } else {
        if (
          key.keyCode === 13 ||
          this.form.cedula != "" ||
          this.form.nombre === ""
        ) {
          const customer = this.myCustomers.find(
            (el) => el.cedula === this.form.cedula.trim()
          );

          if (customer) {
            this.enableControl = true;

            this.form.id = customer.id;
            this.form.nombre = customer.first_name;
            this.form.apellido = customer.last_name;
            this.form.telefono = this.formatPhoneNumber(customer.phone);
            this.form.direccion = customer.address;

            /**los email que empiezan con 'none_'
             * son asignados por el sistema
             * en caso de no haber proporcionado un email
             * al momento de enviar el fromulario */
            let exp = customer.email.split("none_");
            if (exp[0] === "none_") {
              this.form.email = "";
            } else {
              this.form.email = customer.email;
            }
          } else {
            this.clearStep1();
          }
        } else if (this.form.cedula === "" || !this.form.cedula) {
          this.form.id = "";
          this.form.nombre = "";
          this.form.apellido = "";
          this.form.telefono = "";
          this.form.email = "";
          this.form.direccion = "";
        } else {
          this.form.id = "";
          this.form.nombre = "";
          this.form.apellido = "";
          this.form.telefono = "";
          this.form.email = "";
          this.form.direccion = "";
        }
      }
    },

    async getCustomers() {
      await this.$axios(`${this.$config.API}/customers`)
        .then((res) => {
          this.customers = res;
          this.loading.show = false;
        })
        .catch((err) => {
          console.log(err);
          this.$fire({
            title: "Error cargando la información de clientes",
            html: `<p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.laoding = false;
          return true;
        });
    },

    validarEmail(email) {
      // Expresión regular para validar una dirección de correo electrónico
      const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

      if (!regexEmail.test(email)) {
        return false; // No coincide con el patrón básico
      }

      // Verificar la posición de "@" y "."
      const atIndex = email.indexOf("@");
      const dotIndex = email.lastIndexOf(".");

      if (
        atIndex < 1 ||
        dotIndex < atIndex + 2 ||
        dotIndex + 2 >= email.length
      ) {
        return false; // No cumple con las ubicaciones de "@" y "."
      }

      return true; // Cumple con todas las validaciones
    },

    async updateCustomer() {
      this.loading.show = true;
      let method = "";
      let url = "";

      console.log(`telefono length`, this.form.telefono.length);
      // Validar campos vacios

      let id = this.form.id;
      let nombre = this.form.nombre.length ? this.form.nombre : "none";
      let apellido = this.form.apellido.length ? this.form.apellido : "none";
      let cedula = this.form.cedula.length ? this.form.cedula : "none";
      let telefono = this.form.telefono.length ? this.form.telefono : "none";
      let email = this.form.email.length
        ? this.form.email
        : this.generateEmail();
      let direccion = this.form.direccion.length ? this.form.direccion : "none";

      // Verificamos si el el usuarioe xiste para llamar el endpoint correcto
      if (!this.form.id) {
        method = "POST";
        url = `${this.$config.API}/customers/${nombre}/${apellido}/${cedula}/${telefono}/${email}/${direccion}`;
      } else {
        method = "PUT";
        console.log("url PUT", url);
        url = `${this.$config.API}/customers/${id}/${nombre}/${apellido}/${cedula}/${telefono}/${email}/${direccion}`;
      }

      let ok = false;
      await this.$axios(url, { method: method })
        .then((res) => {
          console.log("respuesta de actualizar - crear cliente", res);
          // this.form.id = res.id
          // this.form.id = 99
          ok = true;
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            type: "error",
            html: "<p>No se pudo conectar con el servidor, revise su conexiona inernet, los datos del cliente no han sido guardados</p>",
          });
          // alert(`El Cliente no se ha podido crear ${err}`)
          console.log(err);
        })
        .finally(() => {
          this.$axios
            .get(`${this.$config.API}/customers`)
            .then((responseClientes) => {
              // Cargar Clientes
              this.$store.commit(
                "comerce/setDataCustomers",
                responseClientes.data.data
              );

              let customersSelect = responseClientes.data.data.map((client) => {
                return `${client.id} | ${client.first_name} ${client.last_name} - ${client.phone}`;
              });

              this.$store.commit(
                "comerce/setDataCustomersSelect",
                customersSelect
              );

              if (!this.form.id) {
                const currCustomer = responseClientes.data.data.find(
                  (el) => el.cedula === this.form.cedula
                );
                this.form.id = currCustomer.id;
              }
            });
          this.loading.show = false;
          console.log(`Terminada al carga de Cliente`);
          return true;
        });
      return ok;
    },

    generateEmail() {
      const letras = "abcdefghijklmnopqrstuvwxyz";
      const numeros = "0123456789";

      // Genera una letra aleatoria como primer carácter
      const primeraLetra = letras.charAt(
        Math.floor(Math.random() * letras.length)
      );

      // Genera una cadena aleatoria de 8 caracteres
      let cadenaAleatoria = "";
      for (let i = 0; i < 8; i++) {
        const caracteres = letras + numeros;
        const caracterAleatorio = caracteres.charAt(
          Math.floor(Math.random() * caracteres.length)
        );
        cadenaAleatoria += caracterAleatorio;
      }

      // Concatena la cadena aleatoria con "@email.com"
      const email = `${primeraLetra}${cadenaAleatoria}@email.com`;

      return email;
    },

    phoneExist(telefono) {
      let result = { exist: false, msg: "" };

      if (this.form.telefono.trim().length) {
        let clienteData = this.myCustomers.filter(
          (item) => item.phone === this.form.telefono.trim()
        );
        console.log("clientData", clienteData);
        // Verificar exzistencia delcliente
        if (!clienteData.length) {
          result.exist = false;
        } else {
          // Buscar telefono en las registros
          let emailData = this.myCustomers.find(
            (item) => item.phone === this.form.telefono.trim()
          );

          /*  if (
            (clienteData.cedula != emailData.cedula &&
              this.form.cedula != emailData.cedula) ||
            emailData.cedula != undefined
          ) {
            result.exist = true;
            result.msg = `El telefono ${this.form.telefono} ya esta registrado al usuario ${emailData.first_name}`;
          } */

          console.log("Hemos encontrado el cliente ", clienteData);
          console.log("Hemos encontrado el telefono ", emailData);
        }
      } else {
        result.msg = "<p>No ha ingresado un telefono</p>";
      }

      return result;
    },

    clearForm(obj) {
      let clean = {
        id: "",
        cedula: "", // Datos del cliente
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        direccion: "",
        fechaEntrega: "",
        productos: [], // Datos para la tabla de productos
        obs: "", // LIMPIAR OBSERVACIONES
        abono: 0, // Pago total o parcial
        total: 0, // Pago total o parcial
        diseno_grafico: false,
        diseno_modas: false,
        montoDolaresEfectivo: 0,
        montoDolaresEfectivoDetalle: "",
        montoDolaresZelle: 0,
        montoDolaresZelleDetalle: "",
        montoDolaresPanama: 0,
        montoDolaresPanamaDetalle: "",
        montoPesosEfectivo: 0,
        montoPesosEfectivoDetalle: "",
        montoPesosTransferencia: 0,
        montoPesosTransferenciaDetalle: "",
        montoBolivaresEfectivo: 0,
        montoBolivaresEfectivoDetalle: "",
        montoBolivaresPunto: 0,
        montoBolivaresPuntoDetalle: "",
        montoBolivaresPagomovil: 0,
        montoBolivaresPagomovilDetalle: "",
        montoBolivaresTransferencia: 0,
        montoBolivaresTransferenciaDetalle: "",
        descuento: 0,
        descuentoDetalle: "",
      };
      if (obj.form) {
        this.form = clean;
        console.log(`Limpiado form`);
      }
      if (obj.formPrint) {
        this.formPrint = clean;
        console.log(`Limpiado formPrint`);
      }
      this.query2 = "";
      this.ordenVinculada = 0;
      this.disable1 = false;
      this.disable2 = true;
      this.disable3 = true;
      this.disable4 = true;
      this.tabIndex = 0;
    },

    async finishOrder() {
      this.overlay = true;
      // VERIFICAR SI HAY PAGO PARA EL VENDEDOR

      // METODO CON AXIOS

      // CORREGIR ERRORES AL PASAR DATOS AL BACKEND
      if (
        this.form.sales_commision === undefined ||
        this.form.sales_commision === null
      ) {
        this.form.sales_commision = true;
      }
      if (this.form.diseno_modas_cantidad === undefined) {
        this.form.diseno_modas_cantidad = 0;
      }

      // CREAR OBJETO DE DATOS PARA EL ENVIO
      const data = new URLSearchParams();
      data.set("id", this.form.id);
      data.set("vinculada", this.ordenVinculada);
      data.set("nombre", this.form.nombre);
      data.set("apellido", this.form.apellido);
      data.set("cedula", this.form.cedula);
      data.set("email", this.form.email);
      data.set("telefono", this.form.telefono);
      data.set("direccion", this.form.direccion);
      data.set("fechaEntrega", this.form.fechaEntrega);
      data.set("fechaInicio", this.nowDate());
      // data.set('obs', this.form.obs)
      data.set("obs", this.form.obs.replace('"', '"'));
      data.set("abono", this.form.abono);
      data.set("descuento", this.form.descuento);
      data.set("sales_commission", this.form.sales_commision);
      data.set("descuentoDetalle", this.form.descuentoDetalle);
      data.set("total", this.form.total);
      data.set("diseno_grafico", this.form.diseno_grafico);
      data.set("diseno_grafico_cantidad", this.form.diseno_grafico_cantidad);
      data.set("diseno_modas", this.form.diseno_modas);
      data.set("diseno_modas_cantidad", this.form.diseno_modas_cantidad);
      data.set("responsable", this.$store.state.login.dataUser.id_empleado);
      data.set("productos", JSON.stringify(this.form.productos));
      data.set(
        "productos_lotes_detalles",
        JSON.stringify(
          this.form.productos.filter((prod) => this.filterDesign(prod.cod))
        )
      );
      data.set("montoDolaresEfectivo", this.form.montoDolaresEfectivo);
      data.set(
        "montoDolaresEfectivoDetalle",
        this.form.montoDolaresEfectivoDetalle
      );
      data.set("montoDolaresZelle", this.form.montoDolaresZelle);
      data.set("montoDolaresZelleDetalle", this.form.montoDolaresZelleDetalle);
      data.set("montoDolaresPanama", this.form.montoDolaresPanama);
      data.set(
        "montoDolaresPanamaDetalle",
        this.form.montoDolaresPanamaDetalle
      );
      data.set("montoPesosEfectivo", this.form.montoPesosEfectivo);
      data.set(
        "montoPesosEfectivoDetalle",
        this.form.montoPesosEfectivoDetalle
      );
      data.set("montoPesosTransferencia", this.form.montoPesosTransferencia);
      data.set(
        "montoPesosTransferenciaDetalle",
        this.form.montoPesosTransferenciaDetalle
      );
      data.set("montoBolivaresEfectivo", this.form.montoBolivaresEfectivo);
      data.set(
        "montoBolivaresEfectivoDetalle",
        this.form.montoBolivaresEfectivoDetalle
      );
      data.set("montoBolivaresPunto", this.form.montoBolivaresPunto);
      data.set(
        "montoBolivaresPuntoDetalle",
        this.form.montoBolivaresPuntoDetalle
      );
      data.set("montoBolivaresPagomovil", this.form.montoBolivaresPagomovil);
      data.set(
        "montoBolivaresPagomovilDetalle",
        this.form.montoBolivaresPagomovilDetalle
      );
      data.set(
        "montoBolivaresTransferencia",
        this.form.montoBolivaresTransferencia
      );
      data.set(
        "montoBolivaresTransferenciaDetalle",
        this.form.montoBolivaresTransferenciaDetalle
      );
      data.set("tasa_dolar", this.tasas.bolivar);
      data.set("tasa_peso", this.tasas.peso_colombiano);

      console.log("data para crear nueva orden", data);

      // ENVIAR DATOS AL SERVIDOR PARA CREAR UNA NUEVA ORDEN
      await this.$axios
        .post(`${this.$config.API}${this.endpoint}`, data)
        .then((res) => {
          console.log("res.data de crear orden", res.data);
          if (res.data.response.status === "error") {
            this.disableButtons = false;
            this.$fire({
              title: "Error",
              html: `<p>Ocurrió un error al crear la orden</p> <p>${res.data.response.message}</p>`,
              type: "error",
            });
          } else {
            console.log(`La orden ${data.orden_nro} ha sido creada`);
            console.dir(data);
            this.clearForm({
              form: true,
            });

            this.$confirm(
              "¿Desea imprimir una copia de la orden orden?",
              "Imprimir",
              "info"
            )
              .then(() => {
                this.printOrder("reporte").then(() => {
                  this.clearForm({
                    form: true,
                    formPrint: true,
                  });
                });
              })
              .catch(() => {
                this.overlay = false;
                this.disableButtons = false;
                this.clearForm({
                  form: true,
                  formPrint: true,
                });
              })
              .then(() => {
                this.overlay = false;
                this.disableButtons = false;
              });

            /* this.$confirm("¿Desea imprimir la orden?").then(() => {
                            this.printOrder("reporte").then(() => {
                                this.clearForm({
                                    formPrint: true,
                                })
                            })
                        }) */
          }
        })
        .catch((error) => {
          this.$fire({
            title: "Error",
            html: `<p>Ocurrió un error al crear la orden</p> <p>${error}</p>`,
            type: "error",
          });
          this.disableButtons = false;
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    clearStep1() {
      this.form.id = "";
      this.form.nombre = "";
      this.form.apellido = "";
      this.form.telefono = "";
      this.form.email = "";
      this.form.direccion = "";
    },

    async getProducts() {
      await this.$axios.get(`${this.$config.API}/products`).then((res) => {
        this.products = res.data;

        // Cargar Productos
        this.$store.commit("comerce/setDataProductos", res.data);

        this.formarProductSelect();
        /* let productsSelect = res.data.map((prod) => {
          return `${prod.cod} | ${prod.name}`
        })

        this.$store.commit('comerce/setDataProductosSelect', productsSelect) */
      });
    },

    formarProductSelect() {
      let dataSource = null;
      if (this.categoriaDeLaORden === "custom") {
        dataSource = this.getProductsCustom;
      } else if (this.categoriaDeLaORden === "sport") {
        dataSource = this.getProductsSport;
      }

      const productsSelect = dataSource.map((prod) => {
        return `${prod.cod} | ${prod.name}`;
      });

      this.$store.commit("comerce/setDataProductosSelect", productsSelect);
    },

    async getProducts_fetch() {
      await this.$axios(`${this.$config.API}/products`)
        .then((res) => {
          this.products = res;
          this.productsSelect = res.map((prod) => {
            return `${prod.id} | ${prod.name}`;
          });
          this.$store.commit("comerce/setDataProductos", this.productsSelect);
          this.loading.show = false;
        })
        .catch((err) => {
          console.log(err);
          this.alerta({
            type: "error",
            titile: "Error cargando productos",
            html: `<P>E</p>`,
          });
        })
        .finally(() => {
          return true;
        });
    },

    loadCustomer() {
      console.log(
        "loadCustomer: cargar datos del cliete ene le formulario aqui",
        this.query2
      );
      return false;
    },

    getCategory(categories) {
      let cats;
      if (categories.length) {
        // cats = categories.filter((el) => el.id != 35)
        cats = categories;
      } else {
        cats[0].id = null;
      }
      console.log("Cargar >>> `cats`", cats);
      if (cats.length) {
        return cats[0].id;
      }
    },

    checkDesign(categories) {
      let cats = categories.filter((el) => el.name === "Diseños");
      if (cats.length) {
        return true;
      } else {
        return false;
      }
    },

    loadProductPrices(idProduct, newItem) {
      const tmpProd = this.$store.state.comerce.dataProductos.find(
        (el) => el.cod === idProduct
      );
      let options = tmpProd.prices.map((el) => {
        return {
          value: el.price,
          text: `$${el.price} ${el.description}`,
        };
      });

      if (newItem != null) {
        console.log("insertar el precio XL(n) en ", newItem);
        options.unshift(newItem);
      }

      this.montoTotalOrden();
      console.log("options precios producto", options);
      return options;
    },

    loadProduct(val) {
      let exploited = val.split("|");
      let count = 0;
      let dataProd = this.$store.state.comerce.dataProductos
        .map((product) => {
          return {
            item: count++,
            cod: product.cod,
            producto: product.name,
            existencia: product.stock_quantity,
            cantidad: 0,
            tela: null,
            atributo: null,
            corte: "No aplica",
            talla: null,
            colores: [],
            xl: 0,
            categoria: this.getCategory(product.categories),
            diseno: this.checkDesign(product.categories),
            precio: product.regular_price,
            // precioWoo: product.regular_price,
          };
        })
        .find((product) => product.cod == exploited[0]);

      this.query = "";

      // PRECARAGAR DATOS PARA DISEÑOS
      console.log("YO SOY DATAPROD", dataProd);
      if (this.validatDesign(dataProd.cod)) {
        dataProd.cantidad = 0;
      }

      this.form.productos.push(dataProd);
      this.form.productos.sort(this.dynamicSort("producto"));

      return dataProd;
    },

    updateProdId(id) {
      let affect = id - 1;
      this.form.productos[affect].item = id + 88;
      // this.form.productos[last].item = id
    },

    duplicateItem(index, item) {
      let last = this.form.productos.length - 1;
      let copy = {
        item: last,
        cod: item.cod,
        producto: item.producto,
        existencia: item.existencia,
        cantidad: item.cantidad,
        talla: item.talla,
        tela: item.tela,
        atributo: item.atributo,
        colores: [],
        corte: item.corte,
        precio: item.precio,
        categoria: item.categoria,
        diseno: item.diseno,
        // precioWoo: item.precioWoo,
        xl: 0,
      };

      this.form.productos.push(copy);

      let mySort = this.form.productos.sort(function (a, b) {
        if (a.producto > b.producto) {
          return 1;
        }
        if (a.producto < b.producto) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });

      this.form.productos = mySort;
      // recalcular monto total
      this.montoTotalOrden();
    },

    removeItem(index) {
      this.form.productos.splice(index, 1);
      this.montoTotalOrden();
    },

    getResponseNewProduct(res) {
      this.loading.show = true;
      this.getProducts().then(() => {
        this.loading.show = false;
      });
    },

    dynamicSort(property) {
      var sortOrder = 1;
      if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a, b) {
        /* next line works with strings and numbers,
         * and you may want to customize it to your needs
         */
        var result =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
        return result * sortOrder;
      };
    },

    getObs(html) {
      console.log(`getObs recibió: ${html}`);
      this.form.obs = html;
    },

    onEditorChange({ editor, html, text }) {
      console.log("editor change!", editor, html, text);
      this.form.obs = html;
    },

    onHidden() {
      return false;
    },

    checkDesigner() {
      const designs = this.form.productos
        .filter((el) => this.validatDesign(el.cod))
        .map((el) => {
          let tipo;
          if (el.cod === 20237 || el.cod === 20266) {
            tipo = "modas";
            this.form.diseno_modas = true;
            this.form.diseno_modas_cantidad = parseInt(el.cantidad);
          }

          if (this.validatDesign(el.cod)) {
            tipo = "gráfico";
            this.form.diseno_grafico = true;
            this.form.diseno_grafico_cantidad = parseInt(el.cantidad);
          }
          return {
            cod: el.cod,
            tipo: tipo,
            cantidad: parseInt(el.cantidad),
          };
        });
      console.log("checkDesogner", designs);
      let exist;

      if (designs.length) {
        exist = true;
      } else {
        exist = false;
      }

      return exist;
    },

    montoTotalOrden() {
      if (this.form.productos.length > 0) {
        this.form.total = 0;
        this.form.total = this.form.productos
          .map((item) => {
            console.log(`item pago:`, item);

            return parseFloat(item.precio) * parseInt(item.cantidad);
          })
          .reduce((acc, curr) => (acc = acc + curr));
      }
    },

    montoTotalOrden2() {
      if (this.form.productos.length > 0) {
        this.form.total = 0;
        this.form.total = this.form.productos
          .map((item) => {
            return parseFloat(item.precio) * parseInt(item.cantidad);
          })
          .reduce((acc, curr) => (acc = acc + curr));
      }
    },

    async loadDataCustomers() {
      await this.$axios
        .get(`${this.$config.API}/customers`)
        .then((responseClientes) => {
          // Cargar Clientes
          this.$store.commit(
            "comerce/setDataCustomers",
            responseClientes.data.data
          );

          this.responseClientes = responseClientes.data.data;

          let customersSelect = responseClientes.data.data.map((client) => {
            return `${client.id} | ${client.first_name} ${client.last_name} - ${client.phone}`;
          });

          this.customersSelect = customersSelect;

          this.$store.commit("comerce/setDataCustomersSelect", customersSelect);
        })
        .catch((err) => {
          this.$fire({
            type: "error",
            title: "Error obteniendo datos del cliente",
            html: err,
          });
        })
        .finally(() => {
          console.log("Recargado los clientes y mapeados");
        });
    },
    async loadDataTallas() {
      await this.$axios
        .get(`${this.$config.API}/sizes`)
        .then((responseTallas) => {
          // Cargar Tallas
          let mySizes = responseTallas.data.data.map((item) => {
            return {
              value: item._id,
              text: item.name,
            };
          });
          this.$store.commit("comerce/setDataTallas", mySizes);

          console.log("ordenes guardadas", this.ordenesGuardadas);
        })
        .catch((err) => {
          this.$fire({
            type: "error",
            title: "Error obteniendo datos de las tallas",
            html: err,
          });
        })
        .finally(() => {
          console.log("Tallas recargadas y mapeadas");
        });
    },
    async loadDataTelas() {
      await this.$axios
        .get(`${this.$config.API}/telas`)
        .then((responseTelas) => {
          // Cargar Telas
          let myTelas = responseTelas.data.data.map((item) => {
            return {
              value: item.tela,
              text: item.tela,
            };
          });

          this.$store.commit("comerce/setDataTelas", myTelas);
        })
        .catch((err) => {
          this.$fire({
            type: "error",
            title: "Error obteniendo datos de las telas",
            html: err,
          });
        })
        .finally(() => {
          console.log("Telas recargadas y mapeadas");
        });
    },

    async loadProductAttributes() {
      await this.$axios
        .get(`${this.$config.API}/products-attributes`)
        .then((response) => {
          this.productAttributes = response.data.data.map((item) => {
            return {
              value: item._id,
              text: item.name,
            };
          });
        })
        .catch((err) => {
          this.$fire({
            type: "error",
            title: "Error obteniendo datos de los atributos",
            html: err,
          });
          // Re-lanzamos el error para que el bloque try/catch en mounted() lo capture
          // y el flujo de carga se detenga correctamente.
          throw err;
        });
    },

    async loadDataProductos() {
      await this.$axios
        .get(`${this.$config.API}/products`)
        .then((responseProductos) => {
          // Cargar Productos
          let productsSelect = responseProductos.data.map((prod) => {
            return `${prod.cod} | ${prod.name}`;
          });
          this.$store.commit(
            "comerce/setDataProductos",
            responseProductos.data
          );
          this.$store.commit("comerce/setDataProductosSelect", productsSelect);
        })
        .catch((err) => {
          this.$fire({
            type: "error",
            title: "Error obteniendo datos delos productos",
            html: err,
          });
        })
        .finally(() => {
          console.log("Productos recargados y mapeados");
        });
    },
    async loadDataCategories() {
      await this.$axios
        .get(`${this.$config.API}/categories`)
        .then((responseCategories) => {
          // Cargar categorias
          let myCategories = responseCategories.data;
          this.$store.commit("comerce/setDataCategories", myCategories);
        })
        .catch((err) => {
          this.$fire({
            type: "error",
            title: "Error obteniendo datos de las catagorías",
            html: err,
          });
        })
        .finally(() => {
          console.log("Categorias recargadas y mapeadas");
        });
    },

    async loadDataComercializacion() {
      await this.$axios
        .all([
          this.$axios(`${this.$config.API}/customers`),
          this.$axios(`${this.$config.API}/sizes`),
          this.$axios(`${this.$config.API}/telas`),
          this.$axios(`${this.$config.API}/products`),
          this.$axios(`${this.$config.API}/categories`),
          this.$axios(`${this.$config.API}/ordenes/guardadas`),
        ])
        .then(
          this.$axios.spread(
            (
              responseClientes,
              responseProductos,
              responseCategories,
              responseTelas,
              responseTallas
              // responseGuardadas
            ) => {
              // Cargar categorias
              let myCategories = responseCategories.data;
              this.$store.commit("comerce/setDataCategories", myCategories);

              // Cargar Telas
              let myTelas = responseTelas.data.data.map((item) => {
                return {
                  value: item.tela,
                  text: item.tela,
                };
              });

              this.$store.commit("comerce/setDataTelas", myTelas);

              // Cargar Clientes
              this.$store.commit(
                "comerce/setDataCustomers",
                responseClientes.data.data
              );

              this.responseClientes = responseClientes.data.data;

              let customersSelect = responseClientes.data.data.map((client) => {
                return `${client.id} | ${client.first_name} ${client.last_name} - ${client.phone}`;
              });

              this.$store.commit(
                "comerce/setDataCustomersSelect",
                customersSelect
              );

              // Cargar Tallas
              let mySizes = responseTallas.data.data.map((item) => {
                return {
                  value: item._id,
                  text: item.name,
                };
              });
              this.$store.commit("comerce/setDataTallas", mySizes);

              console.log("ordenes guardadas", this.ordenesGuardadas);

              // Cargar Productos
              let productsSelect = responseProductos.data.map((prod) => {
                return `${prod.cod} | ${prod.name}`;
              });
              this.$store.commit(
                "comerce/setDataProductos",
                responseProductos.data
              );
              this.$store.commit(
                "comerce/setDataProductosSelect",
                productsSelect
              );
            }
          )
        )
        .then(() => {
          this.mainOverlay = false;
        })
        .catch((err) => {
          console.log(`Error: ${err}`);
          this.$fire({
            type: "error",
            title: "Error obteniendo datos, por favor recargue el módulo ",
            html: err,
          });
          this.loadingMsg =
            "No se cargaron todos los datos, por favor recargue este módulo";
          this.mainOverlay = false;
        });
    },
  },

  components: { FormMonedas },
  created() {
    // this.loadDataComercializacion()
  },

  async mounted() {
    this.clearForm({
      form: true,
      formPrint: true,
    });

    this.mainOverlay = true;
    this.loadingMsg = "Cargando datos...";

    this.checkScreenSize();
    window.addEventListener("resize", this.handleResize);

    try {
      // Promise.all ejecuta todas las cargas de datos en paralelo para mayor eficiencia
      await Promise.all([
        this.loadDataCustomers(),
        this.loadDataTallas(),
        this.loadDataTelas(),
        this.loadDataProductos(),
        this.loadProductAttributes(), // Esta es la llamada que actualmente falla
        this.getOrdenesGuardadas(),
      ]);
      // Si todo tiene éxito, ocultamos el overlay
      this.mainOverlay = false;
    } catch (error) {
      console.error("Fallo en la carga de datos iniciales:", error);
      // Si algo falla, el overlay se queda visible con un mensaje de error
      this.loadingMsg =
        "Ocurrió un error al cargar los datos. Por favor, recargue la página.";
    }
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  mixins: [mixins],
};
</script>

<style scoped>
.table-stacked {
  display: block;
  width: 100%;
}

.table-responsive {
  display: table;
  width: 100%;
}

.label-step {
  font-size: 1.2rem !important;
}

.wizard-content {
  width: auto;
  min-height: 200px;
  padding: 1rem;
}

.buscador {
  width: 100% !important;
  margin: 1rem 0 4rem 0;
}
</style>
