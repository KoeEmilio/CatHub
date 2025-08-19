import { HttpContext } from '@adonisjs/core/http'
import DeviceEnvir from '../models/device_envir.js'
import Environment from '../models/environment.js'
import { Server } from 'socket.io'

// Variable global para el servidor Socket.IO (se inicializará en el servidor)
let io: Server | null = null

export function setSocketIO(socketServer: Server) {
  io = socketServer
}

export default class DeviceStatusController {
  /**
   * Cambiar el estado de un dispositivo
   */
  public async updateStatus({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { deviceEnvirId } = params
      const { status } = request.only(['status'])

      // Validar status
      const validStatuses = ['sin_comida', 'sin_arena', 'sin_agua', 'abastecido', 'lleno', 'sucio']
      if (!status || !validStatuses.includes(status)) {
        return response.status(400).json({
          status: 'error',
          message: `Status inválido. Debe ser uno de: ${validStatuses.join(', ')}`
        })
      }

      // Buscar el device_envir y verificar permisos
      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('environment')
        .preload('device')
        .first()

      if (!deviceEnvir) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado'
        })
      }

      // Verificar que el usuario es dueño del environment
      if (deviceEnvir.environment.idUser !== user.id) {
        return response.status(403).json({
          status: 'error',
          message: 'No tienes permisos para controlar este dispositivo'
        })
      }

      const previousStatus = deviceEnvir.status

      // Actualizar el status
      deviceEnvir.status = status
      await deviceEnvir.save()

      // Datos para el WebSocket
      const deviceData = {
        deviceEnvirId: deviceEnvir.id,
        deviceId: deviceEnvir.device.id,
        environmentId: deviceEnvir.environment.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        previousStatus,
        newStatus: status,
        timestamp: new Date().toISOString(),
        userId: user.id
      }

      // Enviar notificación por Socket.IO
      if (io) {
        // Enviar a la room específica del environment
        io.to(`environment-${deviceEnvir.environment.id}`).emit('device-status-changed', {
          type: 'status_changed',
          data: deviceData
        })

        // También enviar a un canal general de IoT para el script de Python
        io.to('iot-commands').emit('device-command', {
          type: 'device_command',
          action: 'status_change',
          data: deviceData
        })
      }

      return response.ok({
        status: 'success',
        message: 'Estado del dispositivo actualizado correctamente',
        data: {
          deviceEnvirId: deviceEnvir.id,
          alias: deviceEnvir.alias,
          type: deviceEnvir.type,
          previousStatus,
          newStatus: status,
          updatedAt: deviceEnvir.updatedAt
        }
      })
    } catch (error) {
      console.error('Error al actualizar estado del dispositivo:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al actualizar estado del dispositivo',
        error: error.message
      })
    }
  }

  /**
   * Obtener el estado actual de un dispositivo
   */
  public async getStatus({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { deviceEnvirId } = params

      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('environment')
        .preload('device')
        .first()

      if (!deviceEnvir) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado'
        })
      }

      // Verificar permisos
      if (deviceEnvir.environment.idUser !== user.id) {
        return response.status(403).json({
          status: 'error',
          message: 'No tienes permisos para ver este dispositivo'
        })
      }

      return response.ok({
        status: 'success',
        data: {
          deviceEnvirId: deviceEnvir.id,
          alias: deviceEnvir.alias,
          type: deviceEnvir.type,
          status: deviceEnvir.status,
          device: {
            id: deviceEnvir.device.id,
            name: deviceEnvir.device.name,
          },
          environment: {
            id: deviceEnvir.environment.id,
            name: deviceEnvir.environment.name
          },
          updatedAt: deviceEnvir.updatedAt
        }
      })
    } catch (error) {
      console.error('Error al obtener estado del dispositivo:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener estado del dispositivo',
        error: error.message
      })
    }
  }

  /**
   * Obtener estados de todos los dispositivos de un environment
   */
  public async getEnvironmentDevicesStatus({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { environmentId } = params

      // Verificar que el environment pertenece al usuario
      const environment = await Environment.query()
        .where('id', environmentId)
        .where('id_user', user.id)
        .first()

      if (!environment) {
        return response.status(404).json({
          status: 'error',
          message: 'Environment no encontrado o no tienes permisos'
        })
      }

      const deviceEnvirs = await DeviceEnvir.query()
        .where('idEnvironment', environmentId)
        .preload('device')

      const devicesStatus = deviceEnvirs.map(deviceEnvir => ({
        deviceEnvirId: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        status: deviceEnvir.status,
        device: {
          id: deviceEnvir.device.id,
          name: deviceEnvir.device.name
        },
        updatedAt: deviceEnvir.updatedAt
      }))

      return response.ok({
        status: 'success',
        data: {
          environmentId: environment.id,
          environmentName: environment.name,
          devices: devicesStatus,
          total: devicesStatus.length
        }
      })
    } catch (error) {
      console.error('Error al obtener estados de dispositivos:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener estados de dispositivos',
        error: error.message
      })
    }
  }

  /**
   * Activar dispositivo (cambiar a 'abastecido')
   */
  public async activate({ params, auth, response }: HttpContext) {
    const { deviceEnvirId } = params
    return this.updateStatusHelper(deviceEnvirId, 'abastecido', 'activado', auth, response)
  }

  /**
   * Desactivar dispositivo (cambiar a estado según tipo)
   */
  public async deactivate({ params, auth, response }: HttpContext) {
    const { deviceEnvirId } = params
    // Para desactivar, determinamos el estado según el tipo de dispositivo
    return this.updateStatusHelper(deviceEnvirId, 'sin_comida', 'desactivado', auth, response)
  }

  /**
   * Iniciar llenado del dispositivo (cambiar a 'lleno')
   */
  public async startFilling({ params, auth, response }: HttpContext) {
    const { deviceEnvirId } = params
    return this.updateStatusHelper(deviceEnvirId, 'lleno', 'llenado iniciado', auth, response)
  }

  /**
   * Marcar dispositivo como vacío (según tipo)
   */
  public async markEmpty({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { deviceEnvirId } = params

      // Primero obtener el dispositivo para saber su tipo
      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('environment')
        .first()

      if (!deviceEnvir) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado'
        })
      }

      // Verificar permisos
      if (deviceEnvir.environment.idUser !== user.id) {
        return response.status(403).json({
          status: 'error',
          message: 'No tienes permisos para controlar este dispositivo'
        })
      }

      // Determinar el estado "vacío" según el tipo de dispositivo
      let emptyStatus: 'sin_comida' | 'sin_arena' | 'sin_agua'
      switch (deviceEnvir.type) {
        case 'comedero':
          emptyStatus = 'sin_comida'
          break
        case 'bebedero':
          emptyStatus = 'sin_agua'
          break
        case 'arenero':
          emptyStatus = 'sin_arena'
          break
        default:
          emptyStatus = 'sin_comida' // fallback
      }

      return this.updateStatusHelper(deviceEnvirId, emptyStatus, `marcado como vacío (${emptyStatus})`, auth, response)
    } catch (error) {
      console.error('Error al marcar como vacío:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al marcar dispositivo como vacío',
        error: error.message
      })
    }
  }

  /**
   * Marcar arenero como sucio
   */
  public async markDirty({ params, auth, response }: HttpContext) {
    const { deviceEnvirId } = params
    return this.updateStatusHelper(deviceEnvirId, 'sucio', 'marcado como sucio', auth, response)
  }

  /**
   * Helper para actualizar status con métodos específicos
   */
  private async updateStatusHelper(
    deviceEnvirId: string,
    newStatus: 'sin_comida' | 'sin_arena' | 'sin_agua' | 'abastecido' | 'lleno' | 'sucio',
    actionMessage: string,
    auth: any,
    response: any
  ) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      // Buscar el device_envir y verificar permisos
      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('environment')
        .preload('device')
        .first()

      if (!deviceEnvir) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado'
        })
      }

      // Verificar que el usuario es dueño del environment
      if (deviceEnvir.environment.idUser !== user.id) {
        return response.status(403).json({
          status: 'error',
          message: 'No tienes permisos para controlar este dispositivo'
        })
      }

      const previousStatus = deviceEnvir.status

      // Actualizar el status
      deviceEnvir.status = newStatus
      await deviceEnvir.save()

      // Datos para Socket.IO
      const deviceData = {
        deviceEnvirId: deviceEnvir.id,
        deviceId: deviceEnvir.device.id,
        environmentId: deviceEnvir.environment.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        previousStatus,
        newStatus,
        timestamp: new Date().toISOString(),
        userId: user.id
      }

      // Enviar notificación por Socket.IO
      if (io) {
        io.to(`environment-${deviceEnvir.environment.id}`).emit('device-status-changed', {
          type: 'status_changed',
          data: deviceData
        })

        io.to('iot-commands').emit('device-command', {
          type: 'device_command',
          action: 'status_change',
          data: deviceData
        })
      }

      return response.ok({
        status: 'success',
        message: `Dispositivo ${actionMessage} correctamente`,
        data: {
          deviceEnvirId: deviceEnvir.id,
          alias: deviceEnvir.alias,
          type: deviceEnvir.type,
          previousStatus,
          newStatus,
          updatedAt: deviceEnvir.updatedAt
        }
      })
    } catch (error) {
      console.error(`Error al ${actionMessage.toLowerCase()}:`, error)
      return response.status(500).json({
        status: 'error',
        message: `Error al ${actionMessage.toLowerCase()}`,
        error: error.message
      })
    }
  }
}
