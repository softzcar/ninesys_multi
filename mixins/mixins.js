export default {
    data() {
        return {
            currentDate: new Date(),
            json: {
                acess: false,
            },
        }
    },
    methods: {
        checkResponse(jsonRes) {
            const jsonData = jsonRes.data
            console.log("jsonData.response.status", jsonData.response.status)
            if (jsonData.response.status === "error") {
                this.$fire({
                    title: "Error",
                    html: `<p>Ocurrió un error al ejecutar su solicitud</p><p>${jsonData.response.message || "Error desconocido"
                        }</p>`,
                    type: "error",
                })
                return false
            } else {
                return true
            }
        },

        async sendMsgCustom(idOrden, tipo, idDep = 0, message = '') {
            this.overlay = true;
            const data = new URLSearchParams();
            data.set("id_orden", idOrden);
            data.set("tipo", tipo);
            data.set("message", message);
            data.set("id_departamento", idDep);

            console.log('mensaje a aenviar', message);
            

            await this.$axios
                .post(`${this.$config.API}/ws/build-message`, data)
                .then((res) => {
                    if (res.data.result_msg.error) {
                        this.$fire({
                            title: "No se pudo enviar el mensaje",
                            html: `<p>${res.data.result_msg.error}</p>`,
                            type: "error",
                        });
                    } else {
                        this.$fire({
                            title: "El mensaje ha sido enviado",
                            html: `<p></p>`,
                            type: "success",
                        });
                    }
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>No se pudo enviar el mensaje</p><p>${err}</p>`,
                        type: "warning",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },

        async sendMsgCustomIneterno(idOrden, idEmpleadoDestino, idEmpleadoRemitente, idDep, message) {
            this.overlay = true;
            const data = new URLSearchParams();
            data.set("id_orden", idOrden);
            data.set("id_destino", idEmpleadoDestino);
            data.set("id_remitente", idEmpleadoRemitente);
            data.set("id_departamento", idDep);
            data.set("message", message);

            await this.$axios
                .post(`${this.$config.API}/ws/build-message/interno`, data)
                .then((res) => {
                    if (res.data.result_msg.error) {
                        this.$fire({
                            title: "No se pudo enviar el mensaje",
                            html: `<p>${res.data.result_msg.error}</p>`,
                            type: "error",
                        });
                    } else {
                        this.$fire({
                            title: "El mensaje ha sido enviado",
                            html: `<p></p>`,
                            type: "success",
                        });
                    }
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>No se pudo enviar el mensaje</p><p>${err}</p>`,
                        type: "warning",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },

        async sendMessage(idOrden, message) {
            // this.overlay = true

            const data = new URLSearchParams()
            data.set("id_orden", idOrden)
            data.set("mensaje", message)

            await this.$axios
                .post(`${this.$config.API}/send-message`, data)
                .then((res) => {
                    // this.overlay = false
                })
        },
        async sendMessageClient(idOrden, tipo = "paso", monto = 0) {
            // this.overlay = true

            const data = new URLSearchParams()
            data.set(
                "departamento",
                this.$store.state.login.dataUser.departamento
            )
            data.set("id_orden", idOrden)
            data.set("tipo", tipo)
            data.set("monto", monto)
            data.set("id_departamento_empelado", this.$store.state.login.currentDepartamentId)

            await this.$axios
                .post(`${this.$config.API}/send-message-produccion`, data)
                .then((res) => {
                    // this.overlay = false
                })
        },

        evalTF(param) {
            if (param === 1 || param === "1") {
                return true
            } else if (
                param === 0 ||
                param === "0" ||
                param === null ||
                param === undefined
            ) {
                return false
            } else {
                return false
            }
        },
        totalProductos(items, nombreCampo) {
            return items.reduce((total, item) => {
                return total + (parseInt(item[nombreCampo], 10) || 0)
            }, 0)
        },

        emailCheck(email) {
            // Expresión regular para validar el formato del email según RFC 5322
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            return regex.test(email)
        },

        whatsAppMe(phone, showIcon, msg = "") {
            // Expresión regular para validar el formato de un número de teléfono (sin ceros iniciales y con 7 a 15 dígitos)

            console.log("telefono", phone)
            phone = this.formatPhoneNumber(phone)

            if (!phone) {
                return `<img alt="${phone}" width="20" src="https://cdn-icons-png.flaticon.com/512/4423/4423488.png" style="opacity: 0.25;" />`
            }

            const phoneRegex = /^[1-9][0-9]{6,14}$/
            var buttonWS = ""
            var linkText = ""
            if (msg != "") msg = `?text=${encodeURIComponent(msg)}`

            // Si el parámetro está vacío o es null
            if (!phone) {
                return `<span class="ws-span">Sin teléfono</span>`
            }

            // Si el número no es válido o comienza con cero
            if (!phoneRegex.test(phone)) {
                return `<span class="ws-span">${phone}</span>`
            }

            if (showIcon) {
                linkText = `<img alt="${phone}" width="20" src="https://cdn-icons-png.flaticon.com/128/4423/4423697.png" />`
            } else {
                linkText = `+${phone}`
            }

            // Enlace sencillo para WhatsApp
            buttonWS = `<a aria-label="Enviar WhatsApp" href="https://wa.me/${phone + msg
                }" target="_blank" class="text-center">${linkText}</a>`

            return buttonWS
        },

        formatPhoneNumber(phone) {
            // Convertir a string si el parámetro es un número
            phone = String(phone)

            // Eliminar caracteres no numéricos
            let cleaned = phone.replace(/[^\d]/g, "")

            // Validar si el número comienza con '04' y reemplazarlo por '584'
            if (cleaned.startsWith("04")) {
                cleaned = "584" + cleaned.substring(2)
            }

            // Verificar que el número sea válido (debe tener entre 10 y 15 dígitos)
            if (cleaned.length < 10 || cleaned.length > 15) {
                return null // Retorna null si no es un número válido
            }

            // Retornar el número formateado para WhatsApp
            return cleaned
        },

        /* formatPhoneNumber(phoneSrc) {
            let phone = phoneSrc
            if (phone === null) {
                return false
            } else {
                phone = String(phoneSrc)
            }

            // Eliminar caracteres no numéricos
            let cleaned = phone.replace(/[^\d]/g, "")

            // Reemplazar el '0' inicial por '58' si es necesario
            if (cleaned.startsWith("0")) {
                cleaned = "58" + cleaned.substring(1)
            }

            // Validar que el número tenga al menos 10 dígitos
            if (cleaned.length < 10) {
                // return { formatted: null, message: 'Número de teléfono inválido' };
                return null
            }

            // return { formatted: cleaned, message: '' };
            return cleaned
        }, */
        disableFutureDates(date) {
            return date > this.currentDate
        },

        smoothScroll(targetId) {
            const targetElement = document.getElementById(targetId)
            console.log("smooth", targetId)
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: "smooth",
                })
            }
        },
        SSEConnect(url) {
            this.source = new EventSource(`${this.$config.API}/${url}`)

            this.source.addEventListener("message", (event) => {
                const eventData = JSON.parse(event.data)
                const eventType = event.type

                if (eventType === "chat") {
                    this.events.push(eventData)
                }

                if (eventType === "message") {
                    this.events = eventData
                }
            })

            this.source.addEventListener("error", (error) => {
                console.error("Error in SSE connection:", error)
                this.source.close() // Cerrar la conexión actual

                // Intentar reconectar después de un cierto período de tiempo
                /*  setTimeout(() => {
          this.connectToServer()
        }, 1500) // Puedes ajustar el tiempo de espera según tus necesidades */
            })
        },

        floatMe(val) {
            return parseFloat(val).toFixed(2)
        },

        getTotal_old(campo, curr) {
            let accumulatedDollars = 0
            let result
            if (this.dataReport[campo] === undefined) {
                return 0
            } else {
                this.dataReport[campo].forEach((item) => {
                    if (item.dolares !== null) {
                        accumulatedDollars += parseFloat(item.dolares)
                    }
                })

                if (curr === "num") {
                    result = accumulatedDollars.toFixed(2)
                } else {
                    result = curr + " " + accumulatedDollars.toFixed(2)
                }

                return result
            }
        },

        createFromMysql(mysql_string) {
            var t,
                result = null

            if (typeof mysql_string === "string") {
                t = mysql_string.split(/[- :]/)

                //when t[3], t[4] and t[5] are missing they defaults to zero
                result = new Date(
                    t[0],
                    t[1] - 1,
                    t[2],
                    t[3] || 0,
                    t[4] || 0,
                    t[5] || 0
                )
            }

            return result
        },

        formatNumber(num) {
            let myNum

            if (num === null) {
                myNum = 0
            } else {
                myNum = parseFloat(num)
            }

            return myNum.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        },

        formatTimestamp(date) {
            let separate = date.split(" ")
            let fecha = this.formatDate(separate[0])
            let d = this.createFromMysql(date)
            let hora = d.toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            })

            return `${fecha} - ${hora}`
        },

        formatFechaGuiones(fechaString) {
            // Divide la cadena en año, mes y día
            const [dia, mes, anio] = fechaString.split("-")

            // Crea una nueva cadena con el formato dd/mm/yyyy
            const fechaFormateada = `${dia}/${mes}/${anio}`

            return fechaFormateada
        },

        formatTimestampDate(timestamp) {
            if (timestamp != null) {
                const fecha = new Date(timestamp)
                const dia = fecha.getDate().toString().padStart(2, "0")
                const mes = (fecha.getMonth() + 1).toString().padStart(2, "0") // Se suma 1 porque los meses comienzan en 0 (enero)
                const año = fecha.getFullYear()

                return `${dia}/${mes}/${año}`
            } else {
                return ''
            }

        },

        formatDate(date) {
            // Verificar sila fewhca tiene formato antiguo
            if (date != null) {
                let check = date.split("-")
                if (check.length === 1) {
                    return date
                }

                let f
                if (!date) {
                    let tmp = new Date()
                    f =
                        tmp.getDate() +
                        "/" +
                        (tmp.getMonth() + 1) +
                        "/" +
                        tmp.getFullYear()
                } else {
                    let tmp = date.split("-")
                    f = `${tmp[2]}/${tmp[1]}/${tmp[0]}`
                }
                return f
            } else {
                return false
            }

        },

        token() {
            const length = 8
            var a =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
                    ""
                )
            var b = []
            for (var i = 0; i < length; i++) {
                var j = (Math.random() * (a.length - 1)).toFixed(0)
                b[i] = a[j]
            }
            return b.join("")
        },

        nowDate() {
            let today = new Date()
            let dd = today.getDate()

            let mm = today.getMonth() + 1
            let yyyy = today.getFullYear()
            if (dd < 10) {
                dd = "0" + dd
            }

            if (mm < 10) {
                mm = "0" + mm
            }

            return `${yyyy}-${mm}-${dd}`
        },

        moneyFormatter(amount) {
            const formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            })
            const moneyString = formatter.format(amount)
            return moneyString
        },

        /* async printOrder(id) {
            let mostrar = ""

            if (
                this.$store.state.login.dataUser.departamento ===
                    "Administración" ||
                this.$store.state.login.dataUser.departamento ===
                    "Comercialización"
            ) {
                mostrar = "table-cell"
            } else {
                mostrar = "none"
            }

            let divContents = document.getElementById(id).innerHTML
            let winConfig =
                "height=620, width=400, menubar=no, location=no, resizable=no, scrollbars=no, status=no"
            let a = window.open("", "Orden", winConfig)
            a.document.write("<html>")
            a.document.write(
                `<style>.hideMe { display: ${mostrar} } .report * { font-family: Arial, Helvetica, sans-serif; } .report { padding: 2rem; } .observaciones { padding: 1.85rem; } .printMe { width: 100%; text-align: right; } .spacer { width: 100%; margin-bottom: 2rem; } .table-main, .table-products { width: 100%; } .table-main tr td, .table-products tr th td { padding: 0.25rem; } .table-products th { font-weight: bold; padding: 0.25rem; border-top: solid 1px rgb(119, 112, 112); border-bottom: solid 1px #000; } .table-products tr td { padding: 0.25rem 0.4rem; } @media print { .table-header * { border: solid 1px #fff; } .printMe { visibility: hidden; } } .table-products { border-bottom: solid 1px #000; } @page { size: letter; } @media screen { } @media print { .noPrint { display: none; } } html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video { margin: 0; padding: 0; border: 0; font-size: 100%; font: inherit; vertical-align: baseline; color: #000; font-family: Arial, Helvetica, sans-serif; } article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section { display: block; } body { line-height: 1; } h1, h2, h3, h4, h5, h6 { font-weight: bold; } strong { font-weight: bold; } ol, ul { list-style: none; } blockquote, q { quotes: none; } blockquote:before, blockquote:after, q:before, q:after { content: ''; content: none; } table { border-collapse: collapse; border-spacing: 0; }</style>`
            )
            a.document.write("<body>")
            a.document.write(divContents)
            a.document.write("</body></style>")
            a.document.close()

            await new Promise((resolve) => {
                a.moveBy(-40, -40)
                a.print()
                setTimeout(() => resolve("resultado"), 3000)
            }).finally(() => {
                a.window.close()
            })

            return true
        }, */

        async printOrder(id) {
            let mostrar = ""

            if (
                this.$store.state.login.dataUser.departamento ===
                "Administración" ||
                this.$store.state.login.dataUser.departamento ===
                "Comercialización"
            ) {
                mostrar = "table-cell"
            } else {
                mostrar = "none"
            }

            let divContents = document.getElementById(id).innerHTML
            let winConfig =
                "height=620, width=400, menubar=no, location=no, resizable=no, scrollbars=no, status=no"
            let a = window.open("", "Orden", winConfig)
            a.document.write("<html>")
            a.document.write(
                `<style>
                    .hideMe { display: ${mostrar} } 
                    .report * { font-family: Arial, Helvetica, sans-serif; } 
                    .report { padding: 2rem; } 
                    .observaciones { padding: 1.85rem; } 
                    .printMe { width: 100%; text-align: right; } 
                    .spacer { width: 100%; margin-bottom: 2rem; } 
                    .table-main, .table-products { width: 100%; } 
                    .table-main tr td, .table-products tr th td { padding: 0.25rem; } 
                    .table-products th { font-weight: bold; padding: 0.25rem; border-top: solid 1px rgb(119, 112, 112); border-bottom: solid 1px #000; } 
                    .table-products tr td { padding: 0.25rem 0.4rem; } 
                    @media print { 
                        .table-header * { border: solid 1px #fff; } 
                        .printMe { visibility: hidden; } 
                        .izquierda, .derecha { width: 100% !important; display: block; } 
                        .izquierda { text-align: left !important; } 
                        .derecha { text-align: right !important; } 
                    } 
                    .table-products { border-bottom: solid 1px #000; } 
                    @page { size: letter; } 
                    @media screen { } 
                    @media print { .noPrint { display: none; } } 
                    html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video { margin: 0; padding: 0; border: 0; font-size: 100%; font: inherit; vertical-align: baseline; color: #000; font-family: Arial, Helvetica, sans-serif; } 
                    article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section { display: block; } 
                    body { line-height: 1; } 
                    h1, h2, h3, h4, h5, h6 { font-weight: bold; } 
                    strong { font-weight: bold; } 
                    ol, ul { list-style: none; } 
                    blockquote, q { quotes: none; } 
                    blockquote:before, blockquote:after, q:before, q:after { content: ''; content: none; } 
                    table { border-collapse: collapse; border-spacing: 0; }
                </style>`
            )
            a.document.write("<body>")
            a.document.write(divContents)
            a.document.write("</body></html>")
            a.document.close()

            await new Promise((resolve) => {
                a.moveBy(-40, -40)
                a.print()
                setTimeout(() => resolve("resultado"), 3000)
            }).finally(() => {
                a.window.close()
            })

            return true
        },

        filterEmpDesign(id_dis) {
            id_dis = parseInt(id_dis)
            // IDs de la categoría diseño en la bade de datos de Woocomerce
            let disArray = [91, 92, 93]

            // Verificar si el valor de id_dis está en el array
            if (disArray.indexOf(id_dis) !== -1) {
                return true
            } else {
                return false
            }
        },

        filterDesign(id_dis) {
            id_dis = parseInt(id_dis)
            // IDs de la categoría diseño en la bade de datos de Woocomerce
            let disArray = [91, 92, 93]

            // Verificar si el valor de id_dis está en el array
            if (disArray.indexOf(id_dis) !== -1) {
                return false
            } else {
                return true
            }
        },

        validatDesign(id_dis) {
            id_dis = parseInt(id_dis)
            // IDs de la categoría diseño en la bade de datos de Woocomerce
            let disArray = [91, 92, 93]
            /* let disArray = [
                91, 92, 93,
            ] */

            // Verificar si el valor de id_dis está en el array
            if (disArray.indexOf(id_dis) !== -1) {
                return true
            } else {
                return false
            }
        },

        prepareDep(dep) {
            let depFormatted
            switch (dep) {
                case "Administración":
                    depFormatted = "administracion"
                    break

                case "Comercialización":
                    depFormatted = "comercializacion"
                    break

                case "Jefe de diseño":
                    depFormatted = "jefe_diseno"
                    break

                case "Jefe de diseño":
                    depFormatted = "jefe_diseno"
                    break

                case "Diseño":
                    depFormatted = "diseno"
                    break

                case "Corte":
                    depFormatted = "corte"
                    break

                case "Impresión":
                    depFormatted = "impresion"
                    break

                case "Estampado":
                    depFormatted = "estampado"
                    break

                case "Confección":
                    depFormatted = "costura"
                    break

                case "Revisión":
                    depFormatted = "revision"
                    break

                default:
                    depFormatted = undefined
                    break
            }

            return depFormatted
        },

        async ozhttp(obj) {
            // console.dir(obj.data)
            let myHeaders = new Headers()

            switch (obj.method) {
                case "get":
                    break

                case "post":
                    myHeaders.append(
                        "Content-Type",
                        "application/x-www-form-urlencoded"
                    )
                    break

                case "put":
                    myHeaders.append(
                        "Content-Type",
                        "application/x-www-form-urlencoded"
                    )
                    break

                case "delete":
                    console.log("el método es delete")
                    break

                default:
                    console.log(
                        `El metodo ${obj.method} noes una opción válida`
                    )
                    break
            }
            let myInit = {}
            if (obj.method === "get") {
                myInit = {
                    method: obj.method,
                    headers: myHeaders,
                    mode: "cors",
                    cache: "default",
                }
            } else {
                myInit = {
                    method: obj.method,
                    headers: myHeaders,
                    mode: "cors",
                    cache: "default",
                    body: obj.data,
                }
            }
            // await fetch(`${this.$config.LOCAL_IP_WOO}${obj.url}`, myInit)
            await fetch(`${this.$config.API}${obj.url}`, myInit)
                .then((res) => res.json())
                .then((res) => {
                    if (obj.url === "/login") {
                        if (!res.data.access) {
                            this.$fire({
                                type: "info",
                                title: "Error de acceso",
                                html: "Los datos que proporcionó nos on válidos",
                            })
                        }
                    }
                    this.json = res
                })
                .catch((error) => {
                    this.$fire({
                        type: "error",
                        title: "ERROR",
                        html: `${obj.url} <br />Error en la conexión: ${error}`,
                    })
                })
        },
    },
}
