import { HttpContext } from '@adonisjs/core/http'
import Reading from '../models/readings.js'
import Device from '../models/device.js'

export default class ReadingsController {
  /**
   * Crear una nueva lectura de sensor
   */
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['sensorName', 'identifier', 'value', 'deviceId'])
      
      // Validar datos
      if (!data.sensorName || !data.identifier || data.value === undefined || !data.deviceId) {
        return response.status(400).json({
          status: 'error',
          message: 'Todos los campos son obligatorios: sensorName, identifier, value, deviceId'
        })
      }

      // Verificar que el dispositivo existe en PostgreSQL
      const deviceExists = await Device.find(data.deviceId)
      if (!deviceExists) {
        return response.status(404).json({
          status: 'error',
          message: 'El dispositivo especificado no existe'
        })
      }
      
      // Crear lectura en MongoDB
      const reading = new Reading({
        sensorName: data.sensorName,
        identifier: data.identifier,
        value: data.value,
        deviceId: data.deviceId,
        timestamp: new Date()
      })

      await reading.save()
      
      return response.status(201).json({
        status: 'success',
        message: 'Lectura registrada correctamente',
        data: reading
      })
    } catch (error) {
      console.error('Error al registrar lectura:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al procesar la solicitud',
        error: error.message
      })
    }
  }

  /**
   * Obtener lecturas de un dispositivo
   */
  public async index({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { page = 1, limit = 50 } = request.qs()
      const { deviceId } = params

      // Verificar que el dispositivo pertenece al usuario
      const device = await Device.query()
        .where('id', deviceId)
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

      // Obtener lecturas de MongoDB
      const readings = await Reading.find({ deviceId })
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)

      const total = await Reading.countDocuments({ deviceId })

      return response.ok({
        status: 'success',
        data: {
          readings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener lecturas',
        error: error.message
      })
    }
  }

  /**
   * Obtener lecturas por rango de fechas
   */
  public async getByDateRange({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { deviceId } = params
      const { startDate, endDate } = request.qs()

      if (!startDate || !endDate) {
        return response.status(400).json({
          status: 'error',
          message: 'startDate y endDate son requeridos'
        })
      }

      // Verificar que el dispositivo pertenece al usuario
      const device = await Device.query()
        .where('id', deviceId)
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

      // Obtener lecturas por rango de fechas
      const readings = await Reading.find({
        deviceId,
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).sort({ timestamp: -1 })

      return response.ok({
        status: 'success',
        data: readings
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener lecturas',
        error: error.message
      })
    }
  }

  /**
   * Obtener estadísticas de lecturas
   */
  public async getStats({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { deviceId } = params

      // Verificar que el dispositivo pertenece al usuario
      const device = await Device.query()
        .where('id', deviceId)
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

      // Obtener estadísticas usando agregación de MongoDB
      const stats = await Reading.aggregate([
        { $match: { deviceId } },
        {
          $group: {
            _id: '$sensorName',
            count: { $sum: 1 },
            avgValue: { $avg: '$value' },
            minValue: { $min: '$value' },
            maxValue: { $max: '$value' },
            lastReading: { $max: '$timestamp' }
          }
        }
      ])

      return response.ok({
        status: 'success',
        data: stats
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener estadísticas',
        error: error.message
      })
    }
  }
}
