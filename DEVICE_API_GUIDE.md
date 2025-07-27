# Guía de Autenticación de Dispositivos - CatHub API

## Resumen del Sistema

El sistema de autenticación de dispositivos permite que hardware físico (Arduino, Raspberry Pi, etc.) se identifique ante la API usando API Keys únicas.

## ¿Cómo funciona?

### 1. Generación de API Key
- Cuando se crea un dispositivo en el sistema, automáticamente se genera una API Key única
- Esta clave se almacena en la base de datos en la columna `api_key` de la tabla `devices`
- Ejemplo de API Key: `550e8400-e29b-41d4-a716-446655440000`

### 2. Autenticación del Dispositivo
Los dispositivos deben incluir su API Key en el header de cada request:

```
X-Device-API-Key: 550e8400-e29b-41d4-a716-446655440000
```

### 3. Endpoints Disponibles para Dispositivos

#### Base URL: `/api/device/`
Todos estos endpoints requieren autenticación con API Key.

---

## 📋 Obtener Configuraciones del Dispositivo

**GET** `/api/device/config`

Obtiene todas las configuraciones asignadas al dispositivo autenticado.

### Headers:
```
X-Device-API-Key: TU_API_KEY_AQUI
Content-Type: application/json
```

### Respuesta exitosa:
```json
{
  "status": "success",
  "data": {
    "deviceId": 1,
    "deviceName": "Sensor Temperatura Sala 1",
    "configurations": [
      {
        "key": "temp_threshold",
        "value": "25.5",
        "dataType": "float"
      },
      {
        "key": "reading_interval",
        "value": "30",
        "dataType": "integer"
      }
    ]
  }
}
```

---

## ⚙️ Actualizar Configuración

**POST** `/api/device/config`

Actualiza una configuración específica del dispositivo.

### Headers:
```
X-Device-API-Key: TU_API_KEY_AQUI
Content-Type: application/json
```

### Body:
```json
{
  "configKey": "temp_threshold",
  "configValue": "26.0"
}
```

### Respuesta exitosa:
```json
{
  "status": "success",
  "message": "Configuración actualizada correctamente",
  "data": {
    "deviceId": 1,
    "configKey": "temp_threshold",
    "configValue": "26.0"
  }
}
```

---

## 📊 Enviar Datos de Sensor

**POST** `/api/device/sensor-data`

Envía datos de sensores desde el dispositivo.

### Headers:
```
X-Device-API-Key: TU_API_KEY_AQUI
Content-Type: application/json
```

### Body:
```json
{
  "sensorName": "Temperature",
  "identifier": "DHT22_01",
  "value": 24.5
}
```

### Respuesta exitosa:
```json
{
  "status": "success",
  "message": "Datos de sensor registrados correctamente",
  "data": {
    "deviceId": 1,
    "deviceName": "Sensor Temperatura Sala 1",
    "reading": {
      "sensorName": "Temperature",
      "identifier": "DHT22_01",
      "value": 24.5,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## Ejemplos de Código

### Arduino (C++)
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* API_KEY = "550e8400-e29b-41d4-a716-446655440000";
const char* SERVER_URL = "http://tu-servidor.com/api/device";

void getDeviceConfig() {
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/config");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-API-Key", API_KEY);
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    // Procesar respuesta JSON
    Serial.println("Configuraciones recibidas:");
    Serial.println(response);
  }
  
  http.end();
}

void sendSensorData(float temperature) {
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/sensor-data");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-API-Key", API_KEY);
  
  StaticJsonDocument<200> doc;
  doc["sensorName"] = "Temperature";
  doc["identifier"] = "DHT22_01";
  doc["value"] = temperature;
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  int httpResponseCode = http.POST(requestBody);
  
  if (httpResponseCode == 201) {
    Serial.println("Datos enviados correctamente");
  }
  
  http.end();
}
```

### Python (Raspberry Pi)
```python
import requests
import json

API_KEY = "550e8400-e29b-41d4-a716-446655440000"
BASE_URL = "http://tu-servidor.com/api/device"

headers = {
    "Content-Type": "application/json",
    "X-Device-API-Key": API_KEY
}

def get_device_config():
    """Obtiene las configuraciones del dispositivo"""
    response = requests.get(f"{BASE_URL}/config", headers=headers)
    
    if response.status_code == 200:
        config_data = response.json()
        print("Configuraciones recibidas:", config_data)
        return config_data["data"]["configurations"]
    else:
        print("Error al obtener configuraciones:", response.text)
        return None

def send_sensor_data(sensor_name, identifier, value):
    """Envía datos de sensor al servidor"""
    data = {
        "sensorName": sensor_name,
        "identifier": identifier,
        "value": value
    }
    
    response = requests.post(f"{BASE_URL}/sensor-data", 
                           headers=headers, 
                           json=data)
    
    if response.status_code == 201:
        print("Datos enviados correctamente")
    else:
        print("Error al enviar datos:", response.text)

def update_config(config_key, config_value):
    """Actualiza una configuración específica"""
    data = {
        "configKey": config_key,
        "configValue": config_value
    }
    
    response = requests.post(f"{BASE_URL}/config", 
                           headers=headers, 
                           json=data)
    
    if response.status_code == 200:
        print(f"Configuración {config_key} actualizada a {config_value}")
    else:
        print("Error al actualizar configuración:", response.text)

# Ejemplo de uso
if __name__ == "__main__":
    # Obtener configuraciones al iniciar
    configs = get_device_config()
    
    # Enviar datos de sensor
    send_sensor_data("Temperature", "DHT22_01", 24.5)
    send_sensor_data("Humidity", "DHT22_01", 60.2)
    
    # Actualizar una configuración
    update_config("temp_threshold", "25.0")
```

---

## Errores Comunes

### 401 - No autorizado
```json
{
  "status": "error",
  "message": "API key requerida"
}
```
**Solución**: Incluir el header `X-Device-API-Key` con una API key válida.

### 404 - Dispositivo no encontrado
```json
{
  "status": "error",
  "message": "Dispositivo no encontrado"
}
```
**Solución**: Verificar que la API key corresponde a un dispositivo existente y activo.

### 400 - Datos faltantes
```json
{
  "status": "error",
  "message": "configKey y configValue son requeridos"
}
```
**Solución**: Incluir todos los campos requeridos en el body de la petición.

---

## Seguridad

1. **Protege tu API Key**: Nunca hardcodees la API key en el código que suba a repositorios públicos
2. **HTTPS**: Usa siempre HTTPS en producción para proteger la transmisión de la API key
3. **Regeneración**: Las API keys pueden ser regeneradas desde el panel de administración si se comprometen
4. **Validación**: El servidor valida que el dispositivo existe y está activo antes de procesar requests

---

## Flujo Típico de un Dispositivo

1. **Inicio**: Al encender, obtener configuraciones con `GET /api/device/config`
2. **Configuración**: Aplicar las configuraciones recibidas (intervalos, umbrales, etc.)
3. **Operación**: Enviar datos de sensores periódicamente con `POST /api/device/sensor-data`
4. **Actualización**: Si es necesario, actualizar configuraciones con `POST /api/device/config`
5. **Reinicio**: Repetir el ciclo según sea necesario

Este sistema permite que cada dispositivo físico se identifique de manera única ante la API, asegurando que las configuraciones y datos se apliquen al dispositivo correcto.
