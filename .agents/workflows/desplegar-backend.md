---
description: Despliega los cambios del backend al servidor de pruebas (Hostinger)
---

# Workflow: Desplegar Backend (Hostinger)

Este workflow es **OBLIGATORIO** cada vez que se realicen cambios en el código de la API (`ninesys-apidev`).

## Requisitos Previos
1. Estar en la rama correcta (`refactor/modular-routes`).
2. Tener cambios confirmados localmente.

## Pasos a Seguir:

1. **Subir cambios a GitHub**:
// turbo
```bash
cd /home/developer/Escritorio/Antigravity/ninesys-apidev && git push origin refactor/modular-routes
```

2. **Actualizar servidor remoto (Hostinger)**:
// turbo
```bash
ssh vps-ninesys "cd /home/api.nineteengreen.com/public_html && git fetch origin && git checkout refactor/modular-routes && git pull origin refactor/modular-routes"
```

3. **Verificar despliegue**:
Realiza una prueba (vía `curl` o desde el frontend) para confirmar que el servidor remoto responde con la nueva lógica.

> [!IMPORTANT]
> No marcar la tarea como completada en `task.md` ni en el log hasta que este workflow se haya ejecutado exitosamente.
