# API de Estados de Dispositivos - WebSocket Simplificado

## Estados de Dispositivos

### Endpoints disponibles (Base: `/api/device-status`)

Todos los endpoints requieren autenticación.

### Cambiar estados específicos:
- `PUT /:id/sin-comida` - Marcar como sin comida
- `PUT /:id/sin-arena` - Marcar como sin arena  
- `PUT /:id/sin-agua` - Marcar como sin agua
- `PUT /:id/abastecido` - Marcar como abastecido
- `PUT /:id/lleno` - Marcar como lleno
- `PUT /:id/sucio` - Marcar como sucio

### Obtener estados:
- `GET /:id` - Estado de un dispositivo específico
- `GET /environment/:environmentId` - Estados de todos los dispositivos de un entorno

### Cambio genérico de estado:
- `PUT /:id` - Body: `{"status": "sin_comida"}`

### Manejo de intervalos (solo para areneros):
- `PUT /:id/intervalo` - Configurar intervalo de limpieza (Body: `{"intervalo": 120}`)
- `GET /:id/intervalo` - Obtener intervalo de un arenero específico
- `GET /areneros/all` - Obtener todos los areneros con sus intervalos

### Limpieza automática (solo para areneros):
- `POST /:id/start-cleaning` - Iniciar limpieza automática
- `POST /:id/complete-cleaning` - Completar limpieza automática  
- `POST /:id/cleaning-reminder` - Enviar recordatorio (Body: `{"minutesUntilNext": 30}`)

## Intervalos de Limpieza para Areneros

Los areneros pueden tener configurado un intervalo de limpieza automática en minutos.

### Configurar intervalo:
```bash
PUT /api/device-status/1/intervalo
Content-Type: application/json
Authorization: Bearer tu_token

{
  "intervalo": 120  // 120 minutos = 2 horas
}
```

**Respuesta:**
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

### Obtener intervalo de un arenero:
```bash
GET /api/device-status/1/intervalo
```

**Respuesta:**
```json
{
  "deviceEnvirId": 1,
  "alias": "Arenero Principal", 
  "type": "arenero",
  "intervalo": 120,
  "intervaloEnHoras": 2.0
}
```

### Obtener todos los areneros:
```bash
GET /api/device-status/areneros/all
```

**Respuesta:**
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

## WebSocket - Canal Único

### Conectar
```javascript
const socket = io('http://localhost:3333')
```

### Eventos que puedes escuchar:

#### 1. Cambio de estado de cualquier dispositivo
```javascript
socket.on('device_status_changed', (data) => {
  console.log('Estado cambiado:', data)
  // Estructura del evento:
  // {
  //   deviceEnvirId: 1,
  //   environmentId: 1,
  //   deviceId: 1,
  //   alias: "Comedero Principal",
  //   type: "comedero",
  //   status: "sin_comida",
  //   timestamp: "2025-01-15T10:30:00.000Z"
  // }
})
```

#### 2. Alertas críticas
```javascript
socket.on('critical_alert', (data) => {
  console.log('¡Alerta crítica!', data)
  // Estructura del evento:
  // {
  //   deviceEnvirId: 1,
  //   environmentId: 1,
  //   deviceId: 1,
  //   alias: "Comedero Principal",
  //   type: "comedero",
  //   status: "sin_comida",
  //   severity: "critical",
  //   message: "¡Atención! El comedero está sin comida",
  //   timestamp: "2025-01-15T10:30:00.000Z"
  // }
})
```

#### 3. Cambio de intervalo de arenero
```javascript
socket.on('interval_changed', (data) => {
  console.log('Intervalo de arenero cambiado:', data)
  // Estructura del evento:
  // {
  //   deviceEnvirId: 1,
  //   environmentId: 1,
  //   deviceId: 1,
  //   alias: "Arenero Principal",
  //   type: "arenero",
  //   intervalo: 120,
  //   intervaloEnHoras: 2.0,
  //   timestamp: "2025-01-15T10:30:00.000Z"
  // }
})
```

#### 4. Limpieza automática iniciada
```javascript
socket.on('cleaning_started', (data) => {
  console.log('Limpieza iniciada:', data)
  // Estructura del evento:
  // {
  //   deviceEnvirId: 1,
  //   environmentId: 1,
  //   deviceId: 1,
  //   alias: "Arenero Principal",
  //   type: "arenero",
  //   message: "Limpieza automática iniciada para Arenero Principal",
  //   timestamp: "2025-01-15T10:30:00.000Z"
  // }
})
```

#### 5. Limpieza automática completada
```javascript
socket.on('cleaning_completed', (data) => {
  console.log('Limpieza completada:', data)
  // Misma estructura que cleaning_started
})
```

#### 6. Recordatorio de próxima limpieza
```javascript
socket.on('cleaning_reminder', (data) => {
  console.log('Recordatorio de limpieza:', data)
  // Estructura del evento:
  // {
  //   deviceEnvirId: 1,
  //   environmentId: 1,
  //   deviceId: 1,
  //   alias: "Arenero Principal",
  //   type: "arenero",
  //   minutesUntilNext: 30,
  //   hoursUntilNext: 0.5,
  //   message: "Próxima limpieza de Arenero Principal en 30 minutos",
  //   timestamp: "2025-01-15T10:30:00.000Z"
  // }
})
```

#### 7. Datos de sensores (opcional)
```javascript
socket.on('sensor_data', (data) => {
  console.log('Datos de sensor:', data)
})
```

## Severidades de alertas:
- **critical**: `sin_comida`, `sin_agua`
- **high**: `sin_arena`, `sucio`  
- **medium**: `lleno`
- **low**: `abastecido`

## Ejemplo de implementación completa:

```javascript
// Conectar al WebSocket
const socket = io('http://localhost:3333')

// Manejar conexión
socket.on('connect', () => {
  console.log('Conectado al servidor WebSocket')
})

// Escuchar todos los cambios de estado
socket.on('device_status_changed', (data) => {
  // Actualizar UI según el dispositivo que cambió
  updateDeviceInUI(data.deviceEnvirId, data.status, data.alias)
})

// Escuchar alertas críticas
socket.on('critical_alert', (data) => {
  // Mostrar notificación urgente
  showCriticalAlert(data.message, data.severity)
})

// Escuchar cambios de intervalo en areneros
socket.on('interval_changed', (data) => {
  // Actualizar configuración de intervalos en UI
  updateIntervalInUI(data.deviceEnvirId, data.intervalo, data.intervaloEnHoras)
  console.log(`Intervalo de ${data.alias} cambiado a ${data.intervaloEnHoras} horas`)
})

// Escuchar inicio de limpieza automática
socket.on('cleaning_started', (data) => {
  // Mostrar notificación de que la limpieza ha comenzado
  showCleaningNotification(`Iniciando limpieza de ${data.alias}`)
  updateCleaningStatus(data.deviceEnvirId, 'cleaning')
})

// Escuchar finalización de limpieza automática  
socket.on('cleaning_completed', (data) => {
  // Mostrar notificación de limpieza completada
  showCleaningNotification(`Limpieza de ${data.alias} completada`)
  updateCleaningStatus(data.deviceEnvirId, 'clean')
})

// Escuchar recordatorios de próxima limpieza
socket.on('cleaning_reminder', (data) => {
  // Mostrar recordatorio
  showReminder(`${data.alias} necesitará limpieza en ${data.hoursUntilNext} horas`)
})

// Función para configurar intervalo de arenero
async function setArenerosInterval(deviceId, intervalMinutes) {
  try {
    const response = await fetch(`/api/device-status/${deviceId}/intervalo`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${yourToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ intervalo: intervalMinutes })
    })
    
    const result = await response.json()
    console.log('Intervalo configurado:', result)
  } catch (error) {
    console.error('Error al configurar intervalo:', error)
  }
}

// Función para obtener todos los areneros
async function getAllAreneros() {
  try {
    const response = await fetch('/api/device-status/areneros/all', {
      headers: {
        'Authorization': `Bearer ${yourToken}`
      }
    })
    
    const result = await response.json()
    result.areneros.forEach(arenero => {
      console.log(`Arenero: ${arenero.alias}, Intervalo: ${arenero.intervaloEnHoras}h`)
    })
  } catch (error) {
    console.error('Error al obtener areneros:', error)
  }
}
```

## Uso desde Arduino/IoT:

```cpp
// Reportar estado bajo de comida
void reportLowFood(int deviceId) {
  HTTPClient http;
  http.begin("http://tu-servidor.com/api/device-status/" + String(deviceId) + "/sin-comida");
  http.addHeader("Authorization", "Bearer " + deviceToken);
  
  int responseCode = http.PUT("");
  
  if (responseCode > 0) {
    Serial.println("Estado reportado correctamente");
  }
  
  http.end();
}
```

El WebSocket ahora usa un solo canal global donde todos los clientes reciben todas las notificaciones de cambios de estado de cualquier dispositivo.
