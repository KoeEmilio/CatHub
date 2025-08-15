# Guía de Asignación de Dispositivos a Environments

Esta guía explica cómo usar la nueva funcionalidad para asignar dispositivos existentes a environments usando el código del dispositivo.

## Funcionalidad

### 1. Asignar Dispositivo a Environment

**Endpoint:** `POST /api/devices/assign-to-environment`

**Descripción:** Busca un dispositivo por su código y lo asigna al environment seleccionado por el usuario.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "deviceCode": "DEV001",
  "environmentId": 1,
  "alias": "Arenero Principal",
  "type": "arenero",
  "status": "activo"
}
```

**Parámetros:**
- `deviceCode` (string, requerido): Código único del dispositivo en la base de datos
- `environmentId` (number, requerido): ID del environment al que se asignará el dispositivo
- `alias` (string, requerido): Nombre/alias que le darás al dispositivo en este environment
- `type` (string, requerido): Tipo de dispositivo (arenero, bebedero, comedero)
- `status` (string, opcional): Estado del dispositivo (por defecto: "activo")

**Respuesta exitosa (201):**
```json
{
  "status": "success",
  "message": "Dispositivo asignado al environment correctamente",
  "data": {
    "deviceEnvir": {
      "id": 1,
      "alias": "Arenero Principal",
      "type": "arenero",
      "status": "activo",
      "idDevice": 5,
      "idEnvironment": 1,
      "createdAt": "2025-08-14T10:00:00.000Z",
      "updatedAt": "2025-08-14T10:00:00.000Z"
    },
    "device": {
      "id": 5,
      "name": "Dispositivo IoT #5",
      "code": "DEV001",
      "apiKey": "device_12345-abcde"
    },
    "environment": {
      "id": 1,
      "name": "Sala Principal",
      "color": "#4F46E5"
    }
  }
}
```

### 2. Obtener Environments del Usuario

**Endpoint:** `GET /api/devices/user-environments`

**Descripción:** Obtiene todos los environments disponibles para el usuario autenticado. Útil para poblar el formulario de selección.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Sala Principal",
      "color": "#4F46E5"
    },
    {
      "id": 2,
      "name": "Dormitorio",
      "color": "#10B981"
    }
  ]
}
```

## Flujo de Trabajo

### Para el Frontend/Formulario:

1. **Obtener Environments disponibles:**
   ```javascript
   const response = await fetch('/api/devices/user-environments', {
     headers: { 'Authorization': `Bearer ${token}` }
   });
   const { data: environments } = await response.json();
   ```

2. **Mostrar formulario con:**
   - Campo de texto para el código del dispositivo
   - Select/dropdown con los environments obtenidos del paso 1
   - Campo para alias del dispositivo
   - Select para tipo (arenero, bebedero, comedero)

3. **Enviar asignación:**
   ```javascript
   const assignmentData = {
     deviceCode: "DEV001",
     environmentId: selectedEnvironmentId,
     alias: "Mi Arenero Favorito",
     type: "arenero"
   };

   const response = await fetch('/api/devices/assign-to-environment', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify(assignmentData)
   });
   ```

## Validaciones

La función incluye las siguientes validaciones:

1. **Usuario autenticado:** Verifica que el usuario tenga sesión activa
2. **Campos requeridos:** Valida que todos los campos obligatorios estén presentes
3. **Tipo válido:** Verifica que el tipo sea arenero, bebedero o comedero
4. **Dispositivo existe:** Busca el dispositivo por código en la base de datos
5. **Environment válido:** Verifica que el environment exista y pertenezca al usuario
6. **No duplicar:** Evita asignar el mismo dispositivo al mismo environment dos veces

## Errores Comunes

- **400:** Campos faltantes o tipo inválido
- **404:** Dispositivo no encontrado o environment no existe/sin permisos
- **400:** Dispositivo ya asignado a ese environment
- **401:** Usuario no autenticado

## Ejemplo de Uso Completo

```javascript
// 1. Obtener environments del usuario
const environmentsResponse = await fetch('/api/devices/user-environments', {
  headers: { 'Authorization': `Bearer ${userToken}` }
});
const { data: environments } = await environmentsResponse.json();

// 2. El usuario selecciona environment y completa el formulario
const formData = {
  deviceCode: "AR0001",
  environmentId: 1,
  alias: "Arenero Sala Principal",
  type: "arenero"
};

// 3. Asignar dispositivo
const assignResponse = await fetch('/api/devices/assign-to-environment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(formData)
});

const result = await assignResponse.json();
if (result.status === 'success') {
  console.log('Dispositivo asignado correctamente:', result.data);
}
```
