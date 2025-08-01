import { HttpContext } from '@adonisjs/core/http'
import Device from '../models/device.js'
import Environment from '../models/environment.js'
import DeviceEnvir from '../models/device_envir.js'
import { randomUUID } from 'node:crypto'

export default class DevicesController {
  /**
   * Crear un nuevo dispositivo
   */
  public async store({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const data = request.only(['name', 'environmentId', 'alias', 'type'])
      
      // Validar datos
      if (!data.name || !data.environmentId || !data.alias || !data.type) {
        return response.status(400).json({
          status: 'error',
          message: 'Todos los campos son obligatorios: name, environmentId, alias, type'
        })
      }

      // Validar tipo de dispositivo
      if (!['arenero', 'bebedero', 'comedero'].includes(data.type)) {
        return response.status(400).json({
          status: 'error',
          message: 'El tipo de dispositivo debe ser arenero, bebedero o comedero'
        })
      }
      
      // Verificar que el entorno existe y pertenece al usuario
      const environment = await Environment.query()
        .where('id', data.environmentId)
        .where('id_user', user.id)
        .first()

      if (!environment) {
        return response.status(404).json({
          status: 'error',
          message: 'El entorno especificado no existe o no tienes permisos'
        })
      }
      
      // Crear dispositivo
      const device = await Device.create({
        name: data.name,
        idEnvironment: data.environmentId,
        apiKey: `device_${randomUUID()}` // Generar API key único
      })

      // Crear relación device_envir
      const deviceEnvir = await DeviceEnvir.create({
        alias: data.alias,
        type: data.type,
        idDevice: device.id,
        idEnvironment: data.environmentId
      })
      
      return response.status(201).json({
        status: 'success',
        message: 'Dispositivo creado correctamente',
        data: {
          device,
          deviceEnvir
        }
      })
    } catch (error) {
      console.error('Error al crear dispositivo:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al procesar la solicitud',
        error: error.message
      })
    }
  }

  /**
   * Obtener dispositivos de un entorno
   */
  public async index({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      // Verificar que el entorno pertenece al usuario
      const environment = await Environment.query()
        .where('id', params.environmentId)
        .where('id_user', user.id)
        .first()

      if (!environment) {
        return response.status(404).json({
          status: 'error',
          message: 'El entorno especificado no existe o no tienes permisos'
        })
      }

      const devices = await Device.query()
        .where('id_environment', params.environmentId)
        .preload('environment')

      return response.ok({
        status: 'success',
        data: devices
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener dispositivos',
        error: error.message
      })
    }
  }

  /**
   * Obtener un dispositivo específico
   */
  public async show({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const device = await Device.query()
        .where('id', params.id)
        .preload('environment', (query) => {
          query.where('id_user', user.id)
        })
        .first()

      if (!device || !device.environment) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado o no tienes permisos'
        })
      }

      return response.ok({
        status: 'success',
        data: device
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener dispositivo',
        error: error.message
      })
    }
  }

  /**
   * Actualizar un dispositivo
   */
  public async update({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const device = await Device.query()
        .where('id', params.id)
        .preload('environment', (query) => {
          query.where('id_user', user.id)
        })
        .first()

      if (!device || !device.environment) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado o no tienes permisos'
        })
      }

      const data = request.only(['name'])
      device.merge(data)
      await device.save()

      return response.ok({
        status: 'success',
        message: 'Dispositivo actualizado correctamente',
        data: device
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al actualizar dispositivo',
        error: error.message
      })
    }
  }

  /**
   * Eliminar un dispositivo
   */
  public async destroy({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const device = await Device.query()
        .where('id', params.id)
        .preload('environment', (query) => {
          query.where('id_user', user.id)
        })
        .first()

      if (!device || !device.environment) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado o no tienes permisos'
        })
      }

      await device.delete()

      return response.ok({
        status: 'success',
        message: 'Dispositivo eliminado correctamente'
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al eliminar dispositivo',
        error: error.message
      })
    }
  }

  /**
 * Obtener todos los dispositivos del usuario autenticado
 */
public async getAllDevices({ auth, response }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    const devices = await Device.query()
      .preload('environment', (query) => {
        query.where('id_user', user.id)
      })
      .preload('deviceEnvirs') 
      .whereHas('environment', (query) => {
        query.where('id_user', user.id)
      })

    return response.ok({
      status: 'success',
      message: 'Dispositivos obtenidos correctamente',
      data: devices,
      total: devices.length
    })
  } catch (error) {
    console.error('Error al obtener todos los dispositivos:', error)
    return response.status(500).json({
      status: 'error',
      message: 'Error al obtener los dispositivos',
      error: error.message
    })
  }
}
}
