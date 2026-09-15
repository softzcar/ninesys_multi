# Implementación de seguridad de Ninesys — estado actual

> Documento actualizado el 2026-09-15 con el estado real de cada hallazgo, cruzado contra la memoria del proyecto y el plan de blindaje del ecosistema. La versión anterior de este documento (auditoría del 2026-08-13/2026-09-09) quedó desactualizada: describía como abiertos varios hallazgos que ya están cerrados en Desarrollo desde entonces. Se conserva la tabla original de hallazgos con una columna nueva de estado real, y se agrega el checklist de patrones de inyección SQL al final, también actualizado.

## 🔴 Lo único realmente urgente hoy: Producción sigue con código viejo en 2 puntos

Todo lo demás de este documento está **cerrado en Desarrollo, pendiente de un único despliegue combinado a Producción** (decisión explícita del usuario: no desplegar por partes). Pero dos hallazgos siguen **activos y explotables en Producción en este momento**, porque el commit desplegado ahí (`43b55e4`, 2026-09-01) es anterior al lote que los cerró:

- **C4 -- `msg_ninesys` en Producción sigue sin autenticación en 3 rutas de envío de WhatsApp** (`POST /send-message-basic`, `/send-message`, `/send-direct-message`). Cualquiera en Internet puede mandar WhatsApp suplantando a cualquier empresa real del sistema.
- **C5/C7 -- la contraseña de servicio hardcodeada (`admin`/`Ninesys@2024`) y el `JWT_SECRET` filtrado siguen literales en el código de Producción**, sin rotar ahí (en Desarrollo sí están rotados).

**El usuario decidió explícitamente diferir el cierre de esto al despliegue completo del ecosistema, no a un parche aislado** ("No, desplegaremos la implementación de la seguridad del sistema completa, lo desplegamos cuando despleguemos lo demás") -- no re-proponer un despliegue de emergencia salvo que el usuario lo pida de nuevo. El checklist de preparación para ese despliegue (Fase H) ya está armado -- ver `joyful-dreaming-axolotl.md`.

## Tabla de hallazgos originales -- estado real

| **#** | **Hallazgo** | **Severidad** | **Estado (verificado 2026-09-15)** |
| --- | --- | --- | --- |
| C1 | Borrado anónimo de la base de datos de una empresa (`DROP DATABASE` vía `/setup/user` sin auth) | 🔴 Crítica | ✅ Cerrado en Desarrollo (token interno agregado, 2026-09-09) -- pendiente desplegar a Producción |
| C2 | La API no tiene autenticación real (`Authorization` = número de empresa crudo) -- 416 endpoints | 🔴 Crítica | ✅ Cerrado en Desarrollo (sesión JWT real de empleado) -- pendiente Producción |
| C3 | `GET /empleados`/`POST /login` devuelven la clave en texto plano | 🔴 Crítica | ✅ Cerrado en Desarrollo (contraseñas hasheadas + fuga cerrada en `/empleados-todos` y `/refresh-session/{id}`) -- pendiente Producción |
| C4 | Envío de WhatsApp suplantando a cualquier empresa (`msg_ninesys` sin auth) | 🔴 Crítica | ✅ Cerrado en Desarrollo / **🔴 ABIERTO Y EXPLOTABLE EN PRODUCCIÓN HOY** (ver arriba) -- diferido a propósito por el usuario |
| C5 | Credencial de servicio de WhatsApp (`admin`/`Ninesys@2024`) hardcodeada, publicada en el bundle JS | 🔴 Crítica | ✅ Cerrado en Desarrollo (rotada, quitada del bundle) / **🔴 ABIERTA EN PRODUCCIÓN** (mismo código viejo) |
| C6 | CDN sin autenticación (subir/listar/borrar imágenes de cualquier empresa) + path traversal | 🔴 Crítica | ✅ Cerrado en Desarrollo (2026-09-10, `jwt_verify.php`) -- reforzado 2026-09-15 (webshell y exposición de logs también cerrados, ver Fase C) -- pendiente Producción |
| C7 | `JWT_SECRET` de `msg_ninesys` filtrado en el historial de git, sin rotar | 🔴 Crítica | ✅ Rotado en Desarrollo / **🔴 SIGUE SIENDO EL VALOR FILTRADO EN PRODUCCIÓN** |
| C8 | SSH de root con contraseña habilitado en Producción | 🔴 Crítica | ✅ **CERRADO DIRECTAMENTE EN PRODUCCIÓN** (2026-09-10, `PasswordAuthentication no` aplicado en vivo, verificado con conexiones nuevas) |
| C9 | Cloudflare evitable (`api.ninesys19.com` no pasaba por él, IP de origen alcanzable directo) | 🔴 Crítica | ✅ **CERRADO DIRECTAMENTE EN PRODUCCIÓN** para TCP 80/443 (2026-09-09, firewall restringido a rangos de Cloudflare) -- UDP 443 sigue sin filtrar, bajo impacto, no investigado |
| A1 | ~30 endpoints devuelven el SQL ejecutado en la respuesta | 🟠 Alta | ✅ Cerrado en Desarrollo -- el alcance real fue mayor al estimado (~128 respuestas, no ~30) -- pendiente Producción |
| A2 | Inyección SQL viva en creación de orden (monto sin parametrizar) | 🟠 Alta | ✅ Cerrado en Desarrollo (9 bloques de métodos de pago legado) -- primer hallazgo de un patrón sistémico mucho mayor, ver nota del barrido completo más abajo -- pendiente Producción |
| A3 | Motor de SQL por IA con lista negra insuficiente y sin auth | 🟠 Alta | ✅ Cerrado en Desarrollo (lista negra ampliada + rol Postgres de solo lectura dedicado para la IA) -- pendiente Producción |
| A4 | Subida de archivos sin whitelist de extensión (riesgo de webshell) | 🟠 Alta | ✅ Cerrado en Desarrollo (`ninesys-cdn`: confirmado explotable en vivo -- un `.php` subido se ejecutaba -- y corregido, 2026-09-15) -- pendiente Producción. Investigado también en `19print_app`: descartado ahí, la extensión ya la controla el servidor |
| A5 | 7 de 9 endpoints `/internal/*` no validan el token de servicio | 🟠 Alta | ✅ Cerrado en Desarrollo (el conteo real fue 6 de 8, mismo hallazgo -- mecanismo generalizado a todos) -- pendiente Producción |
| A6 | Autorización solo en el navegador; `localStorage` editable da rol admin | 🟠 Alta | ✅ Cerrado en Desarrollo -- guardas reales server-side (`requiereAdmin()`, `perteneceAModulo()`, `perteneceADepartamento()`), extendido este mismo mes a prácticamente TODOS los endpoints de `ninesys-api` (~400) además de `msg_ninesys`, `ninesys-cdn` y `19print_app` -- pendiente Producción |
| A7 | XSS almacenado: ~23 componentes con `v-html` sobre datos de usuario | 🟠 Alta | ✅ Cerrado en Desarrollo (DOMPurify, verificado con payloads reales) -- reforzado con otro XSS real encontrado y cerrado en `msg_ninesys` (panel de WhatsApp, Fase B) -- pendiente Producción |
| A8 | Paneles de administración expuestos a Internet (8090, 7080, 8888, FTP 21) | 🟠 Alta | ✅ **CERRADO DIRECTAMENTE EN PRODUCCIÓN** para los 3 puertos de panel (2026-09-09, cerrados al tráfico externo, acceso solo por túnel SSH) -- sin confirmación específica sobre el FTP 21 mencionado en el hallazgo original |
| M1 | CORS `*` en API, WhatsApp y CDN | 🟡 Media | ✅ Cerrado en Desarrollo (whitelist real en los 3 servicios, 2026-09-10) -- pendiente Producción |
| M2 | Cero cabeceras de seguridad (HSTS, CSP, X-Frame-Options...) | 🟡 Media | ✅ Cerrado en Desarrollo (`ninesys-api`: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) -- pendiente Producción |
| M3 | ~1141 `console.*` en el bundle público (imprime sueldos y respuestas completas) | 🟡 Media | ✅ Cerrado en Desarrollo (1042 ocurrencias reales quitadas del build de producción + limpieza manual de los sitios más sensibles) -- pendiente Producción |
| M4 | 103 `error_log` + volcado de datos a `/tmp` en cada request | 🟡 Media | ✅ Cerrado en Desarrollo Y **PRODUCCIÓN** (21 scripts de debug/logs expuestos, cerrados en ambos servidores) -- reforzado 2026-09-15 en `ninesys-cdn` (`error_log`/bitácoras propias expuestas por HTTP, cerrado en Desarrollo, pendiente Producción ese punto específico) |
| M5 | Enumeración de usuarios en el login | 🟡 Media | ✅ Cerrado en Desarrollo -- pendiente Producción |
| M6 | Sin límite de peticiones en ningún endpoint (login, recuperar clave) | 🟡 Media | ✅ Cerrado en Desarrollo (`ninesys-api`: Turnstile + límite por email; `19print_app`: lockout propio agregado 2026-09-15, el PIN de recuperación de clave era fuerza-brutéable sin límite) -- pendiente Producción |
| M7 | `dev_user` de Postgres es superusuario; MariaDB escucha en `0.0.0.0` | 🟡 Media | ✅ `dev_user` cerrado en Desarrollo (`NOSUPERUSER`, verificado con una empresa real de prueba) -- sin evidencia de que se haya revisado el punto de MariaDB en `0.0.0.0` |

## Efecto colateral de `setup_company` (documento viejo) -- decisión final tomada

El portal de `setup_company` quedó efectivamente inutilizable para crear/editar/eliminar empresas desde que el backend empezó a exigir el token interno en `/setup/user*` -- **decisión final: se acepta así, `setup_company` queda fuera de alcance de esta fase de seguridad por decisión explícita del usuario** (es una herramienta interna, de uso exclusivo de administradores del proyecto, sin base de datos propia de ese personal todavía como para reemplazar su login hardcodeado por uno real). Alta de empresas nuevas sigue siendo por script, no por el portal. El único hallazgo relacionado que sí se resolvió, por vivir en `ninesys-api` y no depender de arreglar el portal, es `GET /setup/user` (exponía datos de todas las empresas sin ningún control) -- cerrado.

## El "panorama más grande" del documento viejo -- todo cerrado en Desarrollo

Las 4 fases que el documento original dejaba "sin fecha fijada" quedaron **todas cerradas en Desarrollo**: Fase 2 (autenticación real de sesión), Fase 3 (hash de contraseñas), Fase 4 (autorización por rol), Fase 5 (limpieza -- XSS, motor de IA, `console`/`error_log`, login, rol mínimo de Postgres). Sobre esa base se construyó, ya en septiembre, una fase mucho más amplia -- sesión única por empleado, autorización granular por departamento/módulo en prácticamente todos los endpoints de los 5 repos del ecosistema (no solo `ninesys-api`), clonación y prueba con datos reales de producción (empresas 194 y 208), y el checklist de preparación para el despliegue final a Producción. Todo documentado en el plan `joyful-dreaming-axolotl.md` y en la memoria del proyecto (`project_fase_seguridad_pendiente.md`).

---

# Patrones de inyección SQL a revisar -- checklist (actualizado)

**Estado: la auditoría completa quedó CERRADA.** Se recorrieron los 31 archivos de `app/routes/` de `ninesys-api` contra este checklist de 8 patrones (no solo el patrón 1 original), más los 6 archivos de servicio de `msg_ninesys` (sin hallazgos, todo ya parametrizado) y `19print_app` (sin SQL por concatenación, todo vía Prisma). `ninesys-cdn` no tiene capa SQL propia relevante. `app_multi` no aplica (frontend).

Checklist usado (se guarda para futuras auditorías de este tipo):

1. **Concatenación cruda sin ningún cast/escape** -- `$args['id']`/`$data['x']` directo en el SQL, sin `intval()`, `floatval()` ni parámetro `?`. El patrón más común, ~90% de los hallazgos reales.
2. **`addslashes()` como "escape"** -- confirmado roto contra Postgres en vivo (`standard_conforming_strings=on`, el backslash no escapa nada): un payload real con `addslashes()` de por medio ejecutó un `DROP TABLE` de prueba. Barrido completo del repo, cerrado -- ya no queda ningún uso real, solo comentarios que documentan el fix.
3. **Cast aplicado a la variable equivocada** -- se castea una copia local pero se sigue usando la original sin cast más abajo, o el cast se aplica antes de un valor que se vuelve a leer crudo después. El hallazgo más sutil y el que más se repitió en el barrido completo -- hay que grepear también asignaciones a variable local, no solo el acceso directo al array.
4. **Placeholders `?` sin su array de parámetros** -- SQL con `?` pero `goQuery($sql)` sin el segundo argumento, o con menos/más parámetros que `?`, o en orden distinto.
5. **Identificadores dinámicos (tabla/columna) desde el usuario** -- `ORDER BY {$campo}`, nombre de tabla armado por parámetro. Nunca se pueden parametrizar con `?`; necesitan whitelist explícita contra un array fijo (ejemplo ya en el código: `config.php` contra `WIZARD_OPERATIVO_PASOS`).
6. **Listas/arrays armados a mano en `IN (...)`** -- cada elemento debe pasar por `is_numeric()`+`intval()` antes de `implode()` (ejemplo ya en el código: `manufacturing.php`).
7. **Cláusulas WHERE/JOIN opcionales armadas por concatenación** (filtros de reportes) -- verificar que cada fragmento condicional castee/parametrice su propio valor.
8. **Otros mecanismos de escape manual rotos** -- no se encontró ninguno nuevo más allá de `addslashes()` en el barrido completo.

**Metodología que funcionó:** grep de DOS patrones a la vez (acceso directo `$var['clave']` concatenado/interpolado, Y asignación previa a variable local sin cast) contra los nombres de variable reales del código -- un primer barrido que solo miró el patrón 1 dio una falsa sensación de completitud; el patrón 3 fue necesario para encontrar varios de los hallazgos más graves. Cada resultado se clasificó leyendo el código real (nunca por el nombre de variable solo), y cada fix se verificó en vivo contra el Postgres de Desarrollo con un payload malicioso real (`'; DROP TABLE IF EXISTS tabla_de_prueba; --`), confirmando con `to_regclass()` que la tabla de prueba nunca se creó -- no alcanza con revisar la sintaxis, hay que probar que el payload realmente quede inerte.
