# Guía de Actualización de Device Environment

Esta guía explica cómo usar las nuevas funciones para modificar los datos de la tabla `device_envir`.

## Nuevas Funciones Implementadas

### 1. Obtener Detalles de Device Environment
**Endpoint:** `GET /api/devices/device-envir/:deviceEnvirId`

**Descripción:** Obtiene todos los detalles de una asignación específica de dispositivo-environment.

**Ejemplo de respuesta:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "alias": "Arenero Principal",
    "type": "arenero",
    "status": "lleno",
    "intervalo": 24,
    "comida": null,
    "device": {
      "id": 1,
      "name": "Dispositivo Smart",
      "code": "DEV001",
      "apiKey": "device_abc123"
    },
    "environment": {
      "id": 1,
      "name": "Sala Principal",
      "color": "#3498db"
    },
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T15:30:00.000Z"
  }
}
```

### 2. Actualizar Device Environment
**Endpoint:** `PUT /api/devices/device-envir/:deviceEnvirId`

**Descripción:** Permite actualizar cualquier campo de la tabla `device_envir`.

**Campos que se pueden modificar:**
- `alias`: Nombre personalizado del dispositivo
- `type`: Tipo de dispositivo (`arenero`, `bebedero`, `comedero`)
- `status`: Estado del dispositivo (`sin_comida`, `sin_arena`, `sin_agua`, `abastecido`, `lleno`, `sucio`)
- `intervalo`: Intervalo de limpieza en horas (solo para areneros)
- `comida`: Cantidad de comida en gramos (solo para comederos)
- `environmentId`: Cambiar el dispositivo a otro environment

### 3. Eliminar Device Environment
**Endpoint:** `DELETE /api/devices/device-envir/:deviceEnvirId`

**Descripción:** Elimina la asignación entre dispositivo y environment. **Importante:** Esto no elimina el dispositivo ni el environment, solo la relación entre ellos.

**Ejemplo de respuesta:**
```json
{
  "status": "success",
  "message": "Asignación de dispositivo eliminada correctamente",
  "data": {
    "deleted": {
      "deviceEnvirId": 1,
      "alias": "Arenero Principal",
      "type": "arenero",
      "status": "lleno",
      "device": {
        "id": 1,
        "name": "Dispositivo Smart",
        "code": "DEV001"
      },
      "environment": {
        "id": 1,
        "name": "Sala Principal",
        "color": "#3498db"
      }
    },
    "note": "El dispositivo y el environment se mantienen intactos, solo se eliminó la asignación"
  }
}
```

## Ejemplos de Uso

### Actualizar solo el alias
```bash
curl -X PUT http://localhost:3333/api/devices/device-envir/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "alias": "Nuevo Nombre del Dispositivo"
  }'
```

### Actualizar tipo y status
```bash
curl -X PUT http://localhost:3333/api/devices/device-envir/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "type": "comedero",
    "status": "abastecido"
  }'
```

### Actualizar intervalo de limpieza (para areneros)
```bash
curl -X PUT http://localhost:3333/api/devices/device-envir/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "intervalo": 12
  }'
```

### Actualizar cantidad de comida (para comederos)
```bash
curl -X PUT http://localhost:3333/api/devices/device-envir/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "comida": 250.5
  }'
```

### Mover dispositivo a otro environment
```bash
curl -X PUT http://localhost:3333/api/devices/device-envir/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "environmentId": 2
  }'
```

### Eliminar asignación de dispositivo
```bash
curl -X DELETE http://localhost:3333/api/devices/device-envir/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui"
```

**⚠️ Importante:** Esta operación:
- ✅ Elimina la asignación en la tabla `device_envir`
- ✅ Mantiene el dispositivo intacto en la tabla `devices`
- ✅ Mantiene el environment intacto en la tabla `environments`
- ✅ El dispositivo queda disponible para ser reasignado a otro environment

### Actualizar múltiples campos a la vez
```bash
curl -X PUT http://localhost:3333/api/devices/device-envir/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token_aqui" \
  -d '{
    "alias": "Comedero de Luna",
    "type": "comedero",
    "status": "lleno",
    "comida": 500.0
  }'
```

## Validaciones Implementadas

### Seguridad
- ✅ Solo el propietario del environment puede modificar los dispositivos
- ✅ Validación de autenticación requerida
- ✅ Verificación de permisos antes de cualquier modificación

### Validación de Datos
- ✅ Tipo de dispositivo debe ser: `arenero`, `bebedero`, `comedero`
- ✅ Status debe ser uno de: `sin_comida`, `sin_arena`, `sin_agua`, `abastecido`, `lleno`, `sucio`
- ✅ Intervalo debe ser un número positivo
- ✅ Comida debe ser un número positivo o cero
- ✅ No se puede asignar el mismo dispositivo dos veces al mismo environment

### Validación de Relaciones
- ✅ El nuevo environment debe existir y pertenecer al usuario
- ✅ No se permite duplicar asignaciones de dispositivo-environment
- ✅ Verificación de existencia del registro device_envir

## Respuestas de Error Comunes

### Dispositivo no encontrado
```json
{
  "status": "error",
  "message": "Asignación de dispositivo no encontrada"
}
```

### Sin permisos
```json
{
  "status": "error",
  "message": "No tienes permisos para modificar este dispositivo"
}
```

### Tipo inválido
```json
{
  "status": "error",
  "message": "El tipo de dispositivo debe ser: arenero, bebedero o comedero"
}
```

### Status inválido
```json
{
  "status": "error",
  "message": "El status debe ser uno de: sin_comida, sin_arena, sin_agua, abastecido, lleno, sucio"
}
```

### Intervalo inválido
```json
{
  "status": "error",
  "message": "El intervalo debe ser un número positivo"
}
```

### Comida inválida
```json
{
  "status": "error",
  "message": "La cantidad de comida debe ser un número positivo o cero"
}
```

### Dispositivo ya asignado
```json
{
  "status": "error",
  "message": "El dispositivo ya está asignado al environment especificado"
}
```

### Asignación no encontrada (para eliminación)
```json
{
  "status": "error",
  "message": "Asignación de dispositivo no encontrada"
}
```

### Sin permisos para eliminar
```json
{
  "status": "error",
  "message": "No tienes permisos para eliminar esta asignación"
}
```

## Casos de Uso Recomendados

1. **Cambio de Nombre:** Actualizar el alias cuando el usuario quiere personalizar el nombre
2. **Reconfiguración:** Cambiar el tipo cuando se reasigna el hardware
3. **Mantenimiento:** Actualizar status durante operaciones de limpieza o reabastecimiento
4. **Programación:** Ajustar intervalos de limpieza según necesidades
5. **Alimentación:** Controlar niveles de comida en tiempo real
6. **Reorganización:** Mover dispositivos entre environments cuando se reorganiza el hogar
7. **Desinstalación:** Eliminar asignación cuando se retira temporalmente un dispositivo
8. **Reasignación:** Eliminar y crear nueva asignación para cambiar configuración completa

## Integración con WebSocket

Estas actualizaciones pueden integrarse con el sistema WebSocket existente para notificar cambios en tiempo real. Se recomienda emitir eventos cuando:
- Se cambia el status del dispositivo
- Se actualiza la cantidad de comida
- Se modifica el intervalo de limpieza
