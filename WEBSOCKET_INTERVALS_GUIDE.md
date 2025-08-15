# WebSocket - Eventos de Intervalos y Limpieza Automática

## ✅ Nuevos Eventos WebSocket Implementados

### 🔄 **Eventos de Intervalos**

#### 1. `interval_changed`
Se emite cuando se configura o cambia el intervalo de un arenero.

**Estructura del evento:**
```json
{
  "deviceEnvirId": 1,
  "environmentId": 1, 
  "deviceId": 1,
  "alias": "Arenero Principal",
  "type": "arenero",
  "intervalo": 120,
  "intervaloEnHoras": 2.0,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Cuándo se dispara:**
- Al configurar un intervalo con `PUT /api/device-status/:id/intervalo`

### 🧹 **Eventos de Limpieza Automática**

#### 2. `cleaning_started`
Se emite cuando inicia una limpieza automática.

**Estructura del evento:**
```json
{
  "deviceEnvirId": 1,
  "environmentId": 1,
  "deviceId": 1,
  "alias": "Arenero Principal",
  "type": "arenero",
  "message": "Limpieza automática iniciada para Arenero Principal",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Cuándo se dispara:**
- Al llamar `POST /api/device-status/:id/start-cleaning`
- Por servicios automatizados de limpieza

#### 3. `cleaning_completed`
Se emite cuando se completa una limpieza automática.

**Estructura del evento:**
```json
{
  "deviceEnvirId": 1,
  "environmentId": 1,
  "deviceId": 1,
  "alias": "Arenero Principal", 
  "type": "arenero",
  "message": "Limpieza automática completada para Arenero Principal",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Cuándo se dispara:**
- Al llamar `POST /api/device-status/:id/complete-cleaning`
- Por servicios automatizados al finalizar limpieza

#### 4. `cleaning_reminder`
Se emite para recordar próximas limpiezas programadas.

**Estructura del evento:**
```json
{
  "deviceEnvirId": 1,
  "environmentId": 1,
  "deviceId": 1,
  "alias": "Arenero Principal",
  "type": "arenero", 
  "minutesUntilNext": 30,
  "hoursUntilNext": 0.5,
  "message": "Próxima limpieza de Arenero Principal en 30 minutos",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Cuándo se dispara:**
- Al llamar `POST /api/device-status/:id/cleaning-reminder`
- Por servicios automatizados para avisar próximas limpiezas

## 🚀 **Nuevos Endpoints API**

### Limpieza Automática
```bash
# Iniciar limpieza automática
POST /api/device-status/1/start-cleaning

# Completar limpieza automática  
POST /api/device-status/1/complete-cleaning

# Enviar recordatorio (30 minutos hasta próxima limpieza)
POST /api/device-status/1/cleaning-reminder
Body: {"minutesUntilNext": 30}
```

### Intervalos
```bash
# Configurar intervalo de 2 horas
PUT /api/device-status/1/intervalo 
Body: {"intervalo": 120}

# Obtener intervalo de arenero
GET /api/device-status/1/intervalo

# Obtener todos los areneros
GET /api/device-status/areneros/all
```

## 💡 **Ejemplos de Uso**

### Frontend - Escuchar todos los eventos de areneros:
```javascript
const socket = io('http://localhost:3333')

// Configuración de intervalo
socket.on('interval_changed', (data) => {
  updateArenerosConfig(data.deviceEnvirId, data.intervaloEnHoras)
  showNotification(`Intervalo de ${data.alias} configurado a ${data.intervaloEnHoras}h`)
})

// Limpieza iniciada
socket.on('cleaning_started', (data) => {
  showCleaningIndicator(data.deviceEnvirId, true)
  showNotification(data.message)
})

// Limpieza completada
socket.on('cleaning_completed', (data) => {
  showCleaningIndicator(data.deviceEnvirId, false)
  showSuccessNotification(data.message)
})

// Recordatorios
socket.on('cleaning_reminder', (data) => {
  showUpcomingCleaningAlert(data.alias, data.hoursUntilNext)
})
```

### Servicio de Limpieza Automática:
```javascript
// Configurar intervalo de 3 horas para arenero
await configureInterval(1, 180) // 180 minutos = 3 horas

// El WebSocket emitirá: interval_changed

// Iniciar limpieza cuando sea necesario
await startCleaning(1)

// El WebSocket emitirá: cleaning_started + device_status_changed (sucio)

// Completar limpieza después de proceso
await completeCleaning(1) 

// El WebSocket emitirá: cleaning_completed + device_status_changed (abastecido)
```

### Arduino/IoT - Integración con intervalos:
```cpp
// Reportar que el arenero necesita limpieza según intervalo
void checkCleaningInterval() {
  if (minutesSinceLastCleaning >= configuredInterval) {
    // Iniciar limpieza automática vía API
    httpPOST("/api/device-status/1/start-cleaning");
    
    // Proceso de limpieza física del dispositivo...
    performPhysicalCleaning();
    
    // Reportar limpieza completada
    httpPOST("/api/device-status/1/complete-cleaning");
  }
}
```

## 🎯 **Beneficios de la Integración**

1. **Tiempo Real**: Todos los clientes se enteran inmediatamente de cambios de intervalos
2. **Automatización**: Servicios pueden programar limpiezas basadas en intervalos
3. **Notificaciones**: UI puede mostrar recordatorios y estados de limpieza
4. **Monitoreo**: Seguimiento completo del ciclo de limpieza automática
5. **Integración IoT**: Dispositivos físicos pueden reportar y recibir comandos

El WebSocket ahora maneja completamente todo el flujo de intervalos y limpieza automática de areneros! 🚀
