# Tarea: Fixes Modal PagosReporteEmpleado en Planilla de Pagos

**Fecha:** 16 de mayo de 2026
**Estado:** Finalizado

## Solicitud
En `/empleados/planilla-de-pagos`, el componente `PagosReporteEmpleado` fue añadido
al footer del modal "Confirmar Pago". Dos problemas:
1. Al hacer click desde dentro del modal, el reporte se abría dos veces.
2. El botón dentro del modal se veía más pequeño que los botones Cancelar y Confirmar.

---

## 1. Modal se abría dos veces

### Causa raíz
El modal ID era `:id="\`reporte-modal-${idEmpleado}\`"`. Cuando el mismo empleado
aparece en la tabla Y en el footer del modal de confirmación, existen dos instancias
del componente con el mismo ID. `$bvModal.show()` encontraba ambas y las abría
simultáneamente.

### Fix
Se usa `_uid` de Vue (identificador interno único por instancia) como sufijo:

```javascript
modalUid() {
  return `reporte-modal-${this.idEmpleado}-${this._uid}`
}
```

El modal `:id`, el botón Cerrar y `abrirReporte()` usan `this.modalUid` en lugar
del ID estático. Cada instancia tiene su propio modal. Commit `4dfbfc1`.

---

## 2. Botón pequeño en footer del modal

### Causa raíz (investigación en tres pasos)

**Intento 1**: `:size="pendiente ? undefined : 'sm'"` — `undefined` sigue siendo
procesado por Bootstrap Vue y no elimina la clase `btn-sm`. No funcionó.

**Intento 2**: `v-bind` condicional `v-bind="buttonSize ? { size: buttonSize } : {}"` 
con `buttonSize=null` desde el padre — Vue no omitía el atributo como se esperaba.

**Causa real encontrada**: La clase CSS `.btn-reporte-empleado` en el `<style scoped>`
del componente tenía `padding: 1px 5px; font-size: 0.75rem; line-height: 1.2`
hardcodeados, sobreescribiendo Bootstrap sin importar el `size` prop.

### Fix
Se agrega prop `buttonSize` (default `'sm'`). Se usan dos declaraciones `v-if/v-else`:
- `v-if="buttonSize"`: botón con `size` y clase `btn-reporte-empleado` (para tabla).
- `v-else`: botón sin `size` y sin la clase CSS, respetando Bootstrap por defecto (para modal).

En `PagosConfirmacionModal.vue` se pasa `:button-size="null"` para activar el `v-else`.

### Commits

| Hash | Descripción |
|------|-------------|
| `4dfbfc1` | Modal ID único con `_uid`; prop `buttonSize` inicial |
| `c7e470d` | Fix: `undefined` en lugar de `''` para size (no resolvió) |
| `021bf85` | Fix: `v-bind` condicional (no resolvió) |
| `09792a0` | Fix: `v-if/v-else` con dos declaraciones explícitas |
| `d2f8f3d` | Fix real: omitir clase `btn-reporte-empleado` en botón del modal |
| `b96421a` | UI: variant primary + texto "Reporte"; reordenar footer modal |
