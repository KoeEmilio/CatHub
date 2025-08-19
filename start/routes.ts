/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const UsersController = () => import('../app/controllers/users_controller.js')
const LoginController = () => import('../app/controllers/Auth/login_controller.js')
const EnvironmentsController = () => import('../app/controllers/environments_controller.js')
const DevicesController = () => import('../app/controllers/devices_controller.js')
const ReadingsController = () => import('../app/controllers/readings_controller.js')
const DeviceConfigController = () => import('../app/controllers/device_config_controller.js')
const DeviceStatusController = () => import('../app/controllers/device_status_controller.js')
const StatusesController = () => import('../app/controllers/statuses_controller.js')

router.get('/', async () => {
  return {
    hello: 'CatHub API v1.0',
    status: 'running'
  }
})

// Rutas de autenticación
router.group(() => {
  router.post('/login', [LoginController, 'login'])
  router.post('/logout', [LoginController, 'logout']).use(middleware.auth())
  router.get('/me', [LoginController, 'me']).use(middleware.auth())
}).prefix('/api')

// Rutas de usuarios
router.group(() => {
  router.post('/', [UsersController, 'store'])
  router.get('/me', [UsersController, 'me']).use(middleware.auth())
  router.put('/me', [UsersController, 'update']).use(middleware.auth())
  router.delete('/me', [UsersController, 'destroy']).use(middleware.auth())
}).prefix('/api/users')

// Rutas de entornos
router.group(() => {
  router.get('/', [EnvironmentsController, 'index'])
  router.post('/', [EnvironmentsController, 'store'])
  router.get('/:id', [EnvironmentsController, 'show'])
  router.put('/:id', [EnvironmentsController, 'update'])
  router.delete('/:id', [EnvironmentsController, 'destroy'])
}).prefix('/api/enviroments').use(middleware.auth())

// Rutas de dispositivos
router.group(() => {
  router.get('/all', [DevicesController, 'getAllDevices']).use(middleware.auth())
  router.get('/all/detailed', [DevicesController, 'getAllDevices']).use(middleware.auth()) // Misma función pero con nombre más descriptivo
  router.get('/environment/:environmentId', [DevicesController, 'index'])
  router.post('/', [DevicesController, 'store'])
  router.get('/:id', [DevicesController, 'show'])
  router.get('/:deviceId/details', [DevicesController, 'getDeviceWithDetails']) // NUEVA FUNCIÓN - Dispositivo específico con sensores y actuadores
  router.get('/device-envir/:deviceEnvirId/details', [DevicesController, 'getDeviceEnvironmentWithDetails']) // ALTERNATIVA - Por device_envir
  router.put('/:id', [DevicesController, 'update'])
  router.delete('/:id', [DevicesController, 'destroy'])
  
  // Nueva funcionalidad para asignar dispositivos - UPDATED ROUTE
  router.post('/environments/:environmentId/assign', [DevicesController, 'assignToEnvironment'])
  router.get('/user-environments', [DevicesController, 'getUserEnvironments'])
  
  // Nuevas rutas para gestión de device_envir
  router.get('/device-envir/:deviceEnvirId', [DevicesController, 'getDeviceEnvironment'])
  router.put('/device-envir/:deviceEnvirId', [DevicesController, 'updateDeviceEnvironment'])
  router.delete('/device-envir/:deviceEnvirId', [DevicesController, 'deleteDeviceEnvironment'])
}).prefix('/api/devices').use(middleware.auth())

// Rutas de lecturas (readings)
router.group(() => {
  router.post('/', [ReadingsController, 'store']) // Sin auth para que Arduino pueda enviar datos
  router.get('/latest', [ReadingsController, 'getLatestReadings']).use(middleware.auth()) // Últimas 5 lecturas
  router.get('/recent', [ReadingsController, 'getRecentReadings']).use(middleware.auth()) // Últimas N lecturas configurables
  router.get('/dashboard', [ReadingsController, 'getDashboardData']).use(middleware.auth()) // Datos del dashboard
  router.get('/realtime/:deviceId', [ReadingsController, 'getRealtimeReadings']).use(middleware.auth()) // Datos en tiempo real
  router.get('/device/:deviceId', [ReadingsController, 'index']).use(middleware.auth())
  router.get('/device/:deviceId/range', [ReadingsController, 'getByDateRange']).use(middleware.auth())
  router.get('/device/:deviceId/stats', [ReadingsController, 'getStats']).use(middleware.auth())
  router.get('/device/:deviceId/sensor-readings', [ReadingsController, 'getDeviceSensorReadings']).use(middleware.auth())
}).prefix('/api/readings')

// Rutas para dispositivos (endpoints que consumen Arduino/Raspberry Pi)
router.group(() => {
  router.get('/config', [DeviceConfigController, 'getConfigurations'])
  router.post('/config', [DeviceConfigController, 'updateConfiguration'])
  router.post('/sensor-data', [DeviceConfigController, 'sendSensorData'])
}).prefix('/api/device').use(middleware.deviceAuth())

// Rutas de control de estado de dispositivos (IoT)
router.group(() => {
  // Rutas generales de status
  router.put('/status/:deviceEnvirId', [DeviceStatusController, 'updateStatus'])
  router.get('/status/:deviceEnvirId', [DeviceStatusController, 'getStatus'])
  router.get('/environment/:environmentId/status', [DeviceStatusController, 'getEnvironmentDevicesStatus'])
  
  // Rutas de acciones específicas
  router.post('/activate/:deviceEnvirId', [DeviceStatusController, 'activate'])
  router.post('/deactivate/:deviceEnvirId', [DeviceStatusController, 'deactivate'])
  router.post('/start-filling/:deviceEnvirId', [DeviceStatusController, 'startFilling'])
  router.post('/mark-empty/:deviceEnvirId', [DeviceStatusController, 'markEmpty'])
  router.post('/mark-dirty/:deviceEnvirId', [DeviceStatusController, 'markDirty'])
}).prefix('/api/device-control').use(middleware.auth())

// Rutas para el manejo de estados específicos de dispositivos
router.group(() => {
  // Obtener estado
  router.get('/:id', [StatusesController, 'getStatus'])
  router.get('/environment/:environmentId', [StatusesController, 'getEnvironmentStatus'])
  
  // Cambiar estados específicos
  router.put('/:id/sin-comida', [StatusesController, 'setSinComida'])
  router.put('/:id/sin-arena', [StatusesController, 'setSinArena'])
  router.put('/:id/sin-agua', [StatusesController, 'setSinAgua'])
  router.put('/:id/abastecido', [StatusesController, 'setAbastecido'])
  router.put('/:id/lleno', [StatusesController, 'setLleno'])
  router.put('/:id/sucio', [StatusesController, 'setSucio'])
  
  // Cambiar estado genérico
  router.put('/:id', [StatusesController, 'updateStatus'])
  
  // Rutas para intervalos de areneros
  router.post('/:id/intervalo', [StatusesController, 'setIntervalo'])
  router.get('/:id/intervalo', [StatusesController, 'getIntervalo'])
  router.get('/areneros/all', [StatusesController, 'getAreneros'])
  
  // Rutas para limpieza automática
  router.post('/:id/start-cleaning', [StatusesController, 'startAutomaticCleaning'])
  router.post('/:id/complete-cleaning', [StatusesController, 'completeAutomaticCleaning'])
  router.post('/:id/cleaning-reminder', [StatusesController, 'sendCleaningReminder'])
  
  // Rutas para manejo de comida
  router.post('/:id/comida', [StatusesController, 'setComida'])
  router.get('/:id/comida', [StatusesController, 'getComida'])
  router.post('/:id/add-comida', [StatusesController, 'addComida'])
  router.post('/:id/consume-comida', [StatusesController, 'consumeComida'])
}).prefix('/api/device/status').use(middleware.auth())

// Ruta simple para información del WebSocket
router.get('/api/websocket/info', async ({ response }) => {
  return response.ok({
    message: 'WebSocket server running',
    serverTime: new Date().toISOString(),
    status: 'active'
  })
})
