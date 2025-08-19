import { HttpContext } from '@adonisjs/core/http'
import Reading from '../models/readings.js'
import Device from '../models/device.js'
import DeviceEnvir from '../models/device_envir.js'
import DeviceSensor from '../models/device_sensor.js'
import Sensor from '../models/sensor.js'

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

      // Verificar que el dispositivo pertenece al usuario a través de DeviceEnvir
      const device = await Device.query()
        .where('id', deviceId)
        .preload('deviceEnvirs', (query) => {
          query.preload('environment', (envQuery) => {
            envQuery.where('id_user', user.id)
          })
        })
        .first()

      if (!device || !device.deviceEnvirs.length) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado o no tienes permisos'
        })
      }

      // Verificar que al menos una relación pertenece al usuario
      const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
        deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
      )

      if (!hasAccess) {
        return response.status(403).json({
          status: 'error',
          message: 'No tienes permisos para acceder a este dispositivo'
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

      // Verificar que el dispositivo pertenece al usuario a través de DeviceEnvir
      const device = await Device.query()
        .where('id', deviceId)
        .preload('deviceEnvirs', (query) => {
          query.preload('environment', (envQuery) => {
            envQuery.where('id_user', user.id)
          })
        })
        .first()

      if (!device || !device.deviceEnvirs.length) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado o no tienes permisos'
        })
      }

      // Verificar que al menos una relación pertenece al usuario
      const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
        deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
      )

      if (!hasAccess) {
        return response.status(403).json({
          status: 'error',
          message: 'No tienes permisos para acceder a este dispositivo'
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

      // Verificar que el dispositivo pertenece al usuario a través de DeviceEnvir
      const device = await Device.query()
        .where('id', deviceId)
        .preload('deviceEnvirs', (query) => {
          query.preload('environment', (envQuery) => {
            envQuery.where('id_user', user.id)
          })
        })
        .first()

      if (!device || !device.deviceEnvirs.length) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado o no tienes permisos'
        })
      }

      // Verificar que al menos una relación pertenece al usuario
      const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
        deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
      )

      if (!hasAccess) {
        return response.status(403).json({
          status: 'error',
          message: 'No tienes permisos para acceder a este dispositivo'
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

  /**
   * Obtener lecturas de sensores específicos de un dispositivo
   * GET /devices/:deviceId/sensor-readings
   */
  public async getDeviceSensorReadings({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { deviceId } = params
      const { page = 1, limit = 50, sensorId, startDate, endDate } = request.qs()

      // Verificar que el dispositivo pertenece al usuario
      const device = await Device.query()
        .where('id', deviceId)
        .preload('deviceEnvirs', (query) => {
          query.preload('environment', (envQuery) => {
            envQuery.where('id_user', user.id)
          })
        })
        .preload('sensors') // Cargar los sensores asociados al device
        .first()

      if (!device) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado'
        })
      }

      // Verificar permisos del usuario
      const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
        deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
      )

      if (!hasAccess) {
        return response.status(403).json({
          status: 'error',
          message: 'No tienes permisos para acceder a este dispositivo'
        })
      }

      // Obtener los IDs de los sensores asociados al dispositivo
      const deviceSensorIds = device.sensors.map(sensor => sensor.id.toString())

      if (deviceSensorIds.length === 0) {
        return response.ok({
          status: 'success',
          message: 'El dispositivo no tiene sensores asociados',
          data: {
            device: {
              id: device.id,
              name: device.name,
              sensors: []
            },
            readings: [],
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 0,
              pages: 0
            }
          }
        })
      }

      // Construir query para MongoDB
      let mongoQuery: any = {
        deviceId: deviceId.toString(),
        sensorId: { $in: deviceSensorIds }
      }

      // Filtrar por sensor específico si se proporciona
      if (sensorId) {
        if (deviceSensorIds.includes(sensorId)) {
          mongoQuery.sensorId = sensorId
        } else {
          return response.status(400).json({
            status: 'error',
            message: 'El sensor especificado no está asociado a este dispositivo'
          })
        }
      }

      // Filtrar por rango de fechas si se proporciona
      if (startDate || endDate) {
        mongoQuery.timestamp = {}
        if (startDate) {
          mongoQuery.timestamp.$gte = new Date(startDate)
        }
        if (endDate) {
          mongoQuery.timestamp.$lte = new Date(endDate)
        }
      }

      // Obtener lecturas de MongoDB con paginación
      const readings = await Reading.find(mongoQuery)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean()

      const total = await Reading.countDocuments(mongoQuery)

      // Formatear respuesta con información adicional
      return response.ok({
        status: 'success',
        data: {
          device: {
            id: device.id,
            name: device.name,
            sensors: device.sensors.map(sensor => ({
              id: sensor.id,
              tipoSensor: sensor.tipoSensor,
            }))
          },
          readings: readings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          },
          filters: {
            sensorId: sensorId || null,
            startDate: startDate || null,
            endDate: endDate || null
          }
        }
      })
    } catch (error) {
      console.error('Error al obtener lecturas de sensores del dispositivo:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener lecturas de sensores',
        error: error.message
      })
    }
  }

  /**
   * Obtener datos de dashboard (últimas lecturas por dispositivo)
   * GET /readings/dashboard
   */
  public async getDashboardData({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { limit = 10, deviceIds } = request.qs()

      // Obtener dispositivos del usuario
      const devicesQuery = Device.query()
        .preload('deviceEnvirs', (query) => {
          query.preload('environment', (envQuery) => {
            envQuery.where('id_user', user.id)
          })
        })

      // Filtrar por dispositivos específicos si se proporciona
      if (deviceIds) {
        const deviceIdArray = Array.isArray(deviceIds) ? deviceIds : [deviceIds]
        devicesQuery.whereIn('id', deviceIdArray)
      }

      const devices = await devicesQuery

      // Filtrar dispositivos que pertenecen al usuario
      const userDevices = devices.filter(device => 
        device.deviceEnvirs.some(deviceEnvir => 
          deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
        )
      )

      if (userDevices.length === 0) {
        return response.ok({
          status: 'success',
          data: {
            devices: [],
            readings: [],
            summary: {
              totalDevices: 0,
              totalReadings: 0,
              lastUpdate: null
            }
          }
        })
      }

      const userDeviceIds = userDevices.map(d => d.id.toString())

      // Obtener últimas lecturas por dispositivo usando agregación
      const dashboardReadings = await Reading.aggregate([
        // Filtrar por dispositivos del usuario
        { 
          $match: { 
            deviceId: { $in: userDeviceIds }
          }
        },
        // Ordenar por timestamp descendente
        { $sort: { deviceId: 1, timestamp: -1 } },
        // Agrupar por dispositivo y sensor para obtener la última lectura de cada uno
        {
          $group: {
            _id: {
              deviceId: '$deviceId',
              sensorName: '$sensorName'
            },
            latestReading: { $first: '$$ROOT' }
          }
        },
        // Agrupar por dispositivo para tener todas las lecturas
        {
          $group: {
            _id: '$_id.deviceId',
            sensors: {
              $push: {
                sensorName: '$latestReading.sensorName',
                identifier: '$latestReading.identifier',
                value: '$latestReading.value',
                timestamp: '$latestReading.timestamp'
              }
            },
            lastUpdate: { $max: '$latestReading.timestamp' }
          }
        },
        // Limitar sensores por dispositivo
        {
          $project: {
            deviceId: '$_id',
            sensors: { $slice: ['$sensors', parseInt(limit)] },
            lastUpdate: 1,
            _id: 0
          }
        }
      ])

      // Obtener conteo total de lecturas
      const totalReadings = await Reading.countDocuments({
        deviceId: { $in: userDeviceIds }
      })

      // Formatear respuesta
      const dashboardData = userDevices.map(device => {
        const deviceReadings = dashboardReadings.find(dr => dr.deviceId === device.id.toString())
        
        return {
          device: {
            id: device.id,
            name: device.name,
            alias: device.deviceEnvirs[0]?.alias || device.name,
            type: device.deviceEnvirs[0]?.type || 'unknown'
          },
          sensors: deviceReadings?.sensors || [],
          lastUpdate: deviceReadings?.lastUpdate || null,
          sensorsCount: deviceReadings?.sensors?.length || 0
        }
      })

      return response.ok({
        status: 'success',
        data: {
          devices: dashboardData,
          summary: {
            totalDevices: userDevices.length,
            totalReadings: totalReadings,
            lastUpdate: dashboardData.reduce((latest, device) => {
              if (!device.lastUpdate) return latest
              if (!latest) return device.lastUpdate
              return new Date(device.lastUpdate) > new Date(latest) ? device.lastUpdate : latest
            }, null)
          }
        }
      })
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener datos del dashboard',
        error: error.message
      })
    }
  }

  /**
   * Obtener lecturas en tiempo real para un dispositivo específico
   * GET /readings/realtime/:deviceId
   */
  public async getRealtimeReadings({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { deviceId } = params
      const { minutes = 60 } = request.qs() // Últimos X minutos

      // Verificar permisos del usuario
      const device = await Device.query()
        .where('id', deviceId)
        .preload('deviceEnvirs', (query) => {
          query.preload('environment', (envQuery) => {
            envQuery.where('id_user', user.id)
          })
        })
        .first()

      if (!device) {
        return response.status(404).json({
          status: 'error',
          message: 'Dispositivo no encontrado'
        })
      }

      const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
        deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
      )

      if (!hasAccess) {
        return response.status(403).json({
          status: 'error',
          message: 'No tienes permisos para acceder a este dispositivo'
        })
      }

      // Calcular fecha de inicio
      const startDate = new Date()
      startDate.setMinutes(startDate.getMinutes() - parseInt(minutes))

      // Obtener lecturas recientes
      const realtimeReadings = await Reading.find({
        deviceId: deviceId.toString(),
        timestamp: { $gte: startDate }
      }).sort({ timestamp: -1 }).limit(100)

      return response.ok({
        status: 'success',
        data: {
          device: {
            id: device.id,
            name: device.name,
            alias: device.deviceEnvirs[0]?.alias || device.name
          },
          readings: realtimeReadings,
          timeRange: {
            from: startDate.toISOString(),
            to: new Date().toISOString(),
            minutes: parseInt(minutes)
          },
          count: realtimeReadings.length
        }
      })
    } catch (error) {
      console.error('Error al obtener lecturas en tiempo real:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener lecturas en tiempo real',
        error: error.message
      })
    }
  }

  /**
   * Obtener las últimas 5 inserciones de readings
   * GET /readings/latest
   */
  public async getLatestReadings({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      // Obtener dispositivos del usuario para filtrar las lecturas
      const userDevices = await Device.query()
        .preload('deviceEnvirs', (query) => {
          query.preload('environment', (envQuery) => {
            envQuery.where('id_user', user.id)
          })
        })

      // Filtrar dispositivos que pertenecen al usuario
      const authorizedDevices = userDevices.filter(device => 
        device.deviceEnvirs.some(deviceEnvir => 
          deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
        )
      )

      if (authorizedDevices.length === 0) {
        return response.ok({
          status: 'success',
          data: {
            readings: [],
            message: 'No tienes dispositivos registrados'
          }
        })
      }

      const userDeviceIds = authorizedDevices.map(d => d.id.toString())

      // Obtener las últimas 5 lecturas de los dispositivos del usuario
      const latestReadings = await Reading.find({
        deviceId: { $in: userDeviceIds }
      })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean()

      // Enriquecer los datos con información del dispositivo
      const enrichedReadings = latestReadings.map(reading => {
        const device = authorizedDevices.find(d => d.id.toString() === reading.deviceId)
        return {
          id: reading._id,
          sensorName: reading.sensorName,
          identifier: reading.identifier,
          value: reading.value,
          timestamp: reading.timestamp,
          deviceId: reading.deviceId,
          device: {
            id: device?.id,
            name: device?.name,
            alias: device?.deviceEnvirs[0]?.alias || device?.name,
            type: device?.deviceEnvirs[0]?.type || 'unknown'
          }
        }
      })

      return response.ok({
        status: 'success',
        data: {
          readings: enrichedReadings,
          count: enrichedReadings.length,
          message: `Últimas ${enrichedReadings.length} lecturas obtenidas`
        }
      })
    } catch (error) {
      console.error('Error al obtener últimas lecturas:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener las últimas lecturas',
        error: error.message
      })
    }
  }

  /**
   * Obtener las últimas N lecturas (configurable)
   * GET /readings/recent?limit=10&deviceId=1
   */
  public async getRecentReadings({ request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { limit = 5, deviceId } = request.qs()
      const limitNum = Math.min(parseInt(limit), 50) // Máximo 50 lecturas

      // Si se especifica un deviceId, verificar permisos
      if (deviceId) {
        const device = await Device.query()
          .where('id', deviceId)
          .preload('deviceEnvirs', (query) => {
            query.preload('environment', (envQuery) => {
              envQuery.where('id_user', user.id)
            })
          })
          .first()

        if (!device) {
          return response.status(404).json({
            status: 'error',
            message: 'Dispositivo no encontrado'
          })
        }

        const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
          deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
        )

        if (!hasAccess) {
          return response.status(403).json({
            status: 'error',
            message: 'No tienes permisos para acceder a este dispositivo'
          })
        }

        // Obtener lecturas de un dispositivo específico
        const readings = await Reading.find({
          deviceId: deviceId.toString()
        })
        .sort({ timestamp: -1 })
        .limit(limitNum)
        .lean()

        return response.ok({
          status: 'success',
          data: {
            readings: readings.map(reading => ({
              id: reading._id,
              sensorName: reading.sensorName,
              identifier: reading.identifier,
              value: reading.value,
              timestamp: reading.timestamp,
              deviceId: reading.deviceId,
              device: {
                id: device.id,
                name: device.name,
                alias: device.deviceEnvirs[0]?.alias || device.name,
                type: device.deviceEnvirs[0]?.type || 'unknown'
              }
            })),
            count: readings.length,
            deviceFilter: deviceId
          }
        })
      }

      // Obtener lecturas de todos los dispositivos del usuario
      const userDevices = await Device.query()
        .preload('deviceEnvirs', (query) => {
          query.preload('environment', (envQuery) => {
            envQuery.where('id_user', user.id)
          })
        })

      const authorizedDevices = userDevices.filter(device => 
        device.deviceEnvirs.some(deviceEnvir => 
          deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
        )
      )

      if (authorizedDevices.length === 0) {
        return response.ok({
          status: 'success',
          data: {
            readings: [],
            count: 0,
            message: 'No tienes dispositivos registrados'
          }
        })
      }

      const userDeviceIds = authorizedDevices.map(d => d.id.toString())

      const readings = await Reading.find({
        deviceId: { $in: userDeviceIds }
      })
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .lean()

      // Enriquecer datos
      const enrichedReadings = readings.map(reading => {
        const device = authorizedDevices.find(d => d.id.toString() === reading.deviceId)
        return {
          id: reading._id,
          sensorName: reading.sensorName,
          identifier: reading.identifier,
          value: reading.value,
          timestamp: reading.timestamp,
          deviceId: reading.deviceId,
          device: {
            id: device?.id,
            name: device?.name,
            alias: device?.deviceEnvirs[0]?.alias || device?.name,
            type: device?.deviceEnvirs[0]?.type || 'unknown'
          }
        }
      })

      return response.ok({
        status: 'success',
        data: {
          readings: enrichedReadings,
          count: enrichedReadings.length,
          requestedLimit: limitNum
        }
      })
    } catch (error) {
      console.error('Error al obtener lecturas recientes:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener lecturas recientes',
        error: error.message
      })
    }
  }
}
