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
}).prefix('/api/auth')

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
}).prefix('/api/environments').use(middleware.auth())

// Rutas de dispositivos
router.group(() => {
  router.get('/environment/:environmentId', [DevicesController, 'index'])
  router.post('/', [DevicesController, 'store'])
  router.get('/:id', [DevicesController, 'show'])
  router.put('/:id', [DevicesController, 'update'])
  router.delete('/:id', [DevicesController, 'destroy'])
}).prefix('/api/devices').use(middleware.auth())

// Rutas de lecturas (readings)
router.group(() => {
  router.post('/', [ReadingsController, 'store']) // Sin auth para que Arduino pueda enviar datos
  router.get('/device/:deviceId', [ReadingsController, 'index']).use(middleware.auth())
  router.get('/device/:deviceId/range', [ReadingsController, 'getByDateRange']).use(middleware.auth())
  router.get('/device/:deviceId/stats', [ReadingsController, 'getStats']).use(middleware.auth())
}).prefix('/api/readings')

// Rutas para dispositivos (endpoints que consumen Arduino/Raspberry Pi)
router.group(() => {
  router.get('/config', [DeviceConfigController, 'getConfigurations'])
  router.post('/config', [DeviceConfigController, 'updateConfiguration'])
  router.post('/sensor-data', [DeviceConfigController, 'sendSensorData'])
}).prefix('/api/device').use(middleware.deviceAuth())
