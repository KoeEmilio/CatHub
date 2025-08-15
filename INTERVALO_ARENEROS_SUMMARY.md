# Resumen: Columna Intervalo para Areneros

## ✅ Cambios Implementados

### 1. **Migración de Base de Datos**
- ✅ Agregada columna `intervalo` (nullable, integer) a la tabla `device_envirs`
- ✅ Comentario: "Intervalo de limpieza en minutos (solo para areneros)"
- ✅ Migración ejecutada exitosamente

### 2. **Modelo DeviceEnvir Actualizado**
- ✅ Agregada propiedad `intervalo: number | null`
- ✅ Mantiene tipado fuerte para TypeScript

### 3. **Nuevos Endpoints en StatusesController**

#### Configurar intervalo:
```bash
PUT /api/device-status/:id/intervalo
Body: {"intervalo": 120}  # 120 minutos = 2 horas
```

#### Obtener intervalo de un arenero:
```bash
GET /api/device-status/:id/intervalo
```

#### Obtener todos los areneros:
```bash
GET /api/device-status/areneros/all
```

### 4. **Validaciones Implementadas**
- ✅ Solo los dispositivos tipo "arenero" pueden tener intervalos
- ✅ El intervalo debe ser un número positivo
- ✅ Respuestas incluyen conversión automática a horas

### 5. **Características de la API**

#### Respuesta al configurar intervalo:
```json
{
  "message": "Intervalo de limpieza configurado a 120 minutos",
  "device": {
    "id": 1,
    "alias": "Arenero Principal",
    "type": "arenero",
    "status": "abastecido",
    "intervalo": 120
  }
}
```

#### Respuesta al obtener intervalo:
```json
{
  "deviceEnvirId": 1,
  "alias": "Arenero Principal",
  "type": "arenero", 
  "intervalo": 120,
  "intervaloEnHoras": 2.0
}
```

#### Respuesta de todos los areneros:
```json
{
  "message": "Areneros obtenidos",
  "areneros": [
    {
      "id": 1,
      "alias": "Arenero Principal",
      "status": "abastecido",
      "intervalo": 120,
      "intervaloEnHoras": 2.0,
      "device": {...},
      "environment": {...}
    }
  ]
}
```

### 6. **Documentación Actualizada**
- ✅ `DEVICE_STATUS_SIMPLE.md` actualizado con ejemplos de uso
- ✅ Ejemplos de JavaScript para frontend
- ✅ Guía de implementación

### 7. **Ejemplo de Servicio de Limpieza Automática**
- ✅ Creado `examples/areneros_cleaning_service.ts`
- ✅ Servicio completo para manejar limpieza automática basada en intervalos
- ✅ Funciones para programar, actualizar y detener limpiezas

## 🚀 Cómo usar

### Configurar intervalo de 2 horas para un arenero:
```bash
curl -X PUT http://localhost:3333/api/device-status/1/intervalo \
  -H "Authorization: Bearer tu_token" \
  -H "Content-Type: application/json" \
  -d '{"intervalo": 120}'
```

### Obtener todos los areneros con sus intervalos:
```bash
curl -X GET http://localhost:3333/api/device-status/areneros/all \
  -H "Authorization: Bearer tu_token"
```

### Frontend JavaScript:
```javascript
// Configurar intervalo de 3 horas (180 minutos)
await fetch('/api/device-status/1/intervalo', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ intervalo: 180 })
})
```

## 💡 Casos de Uso

1. **Configuración inicial**: Establecer intervalos de limpieza para cada arenero
2. **Monitoreo**: Obtener todos los areneros y sus configuraciones
3. **Ajustes**: Modificar intervalos según necesidades
4. **Automatización**: Usar el servicio de ejemplo para limpieza automática
5. **Integración IoT**: Los dispositivos pueden reportar cuando necesitan limpieza

La funcionalidad está completamente implementada y lista para usar! 🎉
