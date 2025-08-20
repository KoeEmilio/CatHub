import { HttpContext } from '@adonisjs/core/http'
import Reading from '../models/readings.js'
import Device from '../models/device.js'
import DeviceEnvir from '../models/device_envir.js'
import WebSocketService from '../services/websocket_service.js'

export default class ReadingsController {
  /**
   * Crear una nueva lectura de sensor
   */
    /**
   * Crear una nueva lectura de sensor
   */
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['sensorName', 'identifier', 'value', 'deviceId', 'deviceEnvirId'])
      
      // Validar datos mínimos
      if (!data.sensorName || !data.identifier || data.value === undefined) {
        return response.status(400).json({
          status: 'error',
          message: 'sensorName, identifier y value son obligatorios'
        })
      }
  
      // Validar que se proporcione al menos deviceId o deviceEnvirId
      if (!data.deviceId && !data.deviceEnvirId) {
        return response.status(400).json({
          status: 'error',
          message: 'Debe proporcionar deviceId o deviceEnvirId'
        })
      }
  
      let deviceEnvirId = data.deviceEnvirId
  
      // Si se proporciona deviceId pero no deviceEnvirId, intentar encontrar el deviceEnvir
      if (data.deviceId && !deviceEnvirId) {
        const deviceEnvir = await DeviceEnvir.query()
          .where('idDevice', data.deviceId)
          .first()
        
        if (deviceEnvir) {
          deviceEnvirId = deviceEnvir.id.toString()
        }
      }
  
      // Verificar que el device_environment existe si se proporciona
      if (deviceEnvirId) {
        const deviceEnvirExists = await DeviceEnvir.find(deviceEnvirId)
        if (!deviceEnvirExists) {
          return response.status(404).json({
            status: 'error',
            message: 'El device_environment especificado no existe'
          })
        }
      }
  
      // Verificar que el dispositivo físico existe si se proporciona deviceId
      if (data.deviceId) {
        const deviceExists = await Device.find(data.deviceId)
        if (!deviceExists) {
          return response.status(404).json({
            status: 'error',
            message: 'El dispositivo especificado no existe'
          })
        }
      }
      
      // Crear lectura en MongoDB
      const reading = new Reading({
        sensorName: data.sensorName,
        identifier: data.identifier,
        value: data.value,
        deviceId: data.deviceId,
        deviceEnvirId: deviceEnvirId, // Incluir la relación correcta
        timestamp: new Date()
      })
  
      await reading.save()
      
      // 🚀 Emitir nueva lectura en tiempo real por WebSocket
      WebSocketService.emitNewReading({
        sensorName: reading.sensorName,
        identifier: reading.identifier,
        value: reading.value,
        deviceId: reading.deviceId,
        deviceEnvirId: reading.deviceEnvirId,
        timestamp: reading.timestamp
      })
      
      return response.status(201).json({
        status: 'success',
        message: 'Lectura registrada correctamente',
        data: {
          id: reading._id,
          sensorName: reading.sensorName,
          identifier: reading.identifier,
          value: reading.value,
          deviceId: reading.deviceId,
          deviceEnvirId: reading.deviceEnvirId,
          timestamp: reading.timestamp
        }
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
  
      // Obtener device_environments del usuario directamente
      const userDeviceEnvirs = await DeviceEnvir.query()
        .preload('environment', (envQuery: any) => {
          envQuery.where('id_user', user.id)
        })
        .preload('device') // Cargar información del device para mostrar
        .whereHas('environment', (envQuery: any) => {
          envQuery.where('id_user', user.id)
        })
  
      if (userDeviceEnvirs.length === 0) {
        return response.ok({
          status: 'success',
          data: {
            readings: [],
            count: 0,
            message: 'No tienes dispositivos registrados en tus environments'
          }
        })
      }
  
      // Obtener los IDs de device_environments del usuario
      const userDeviceEnvirIds = userDeviceEnvirs.map((deviceEnvir: any) => deviceEnvir.id.toString())
  
      // Obtener las últimas 5 lecturas usando deviceEnvirId en lugar de deviceId
      let latestReadings
      try {
        latestReadings = await Reading.find({
          deviceEnvirId: { $in: userDeviceEnvirIds } // Cambio clave: usar deviceEnvirId
        })
        .sort({ timestamp: -1 })
        .limit(5)
        .maxTimeMS(20000) // Timeout de 20 segundos
        .lean()
      } catch (timeoutError) {
        console.warn('MongoDB timeout, intentando consulta más simple:', timeoutError)
        
        // Fallback: consulta más simple sin filtros complejos
        try {
          latestReadings = await Reading.find({})
            .sort({ timestamp: -1 })
            .limit(20) // Obtener más para filtrar después
            .maxTimeMS(10000)
            .lean()
            
          // Filtrar en JavaScript si MongoDB no responde bien
          latestReadings = latestReadings
            .filter((reading: any) => userDeviceEnvirIds.includes(reading.deviceEnvirId))
            .slice(0, 5) // Limitar a 5 después del filtro
        } catch (fallbackError) {
          console.error('Error en consulta de fallback:', fallbackError)
          return response.status(503).json({
            status: 'error',
            message: 'Base de datos temporalmente no disponible',
            code: 'DATABASE_TIMEOUT'
          })
        }
      }
  
      // Enriquecer los datos con información del device_environment
      const enrichedReadings = latestReadings.map((reading: any) => {
        const deviceEnvir = userDeviceEnvirs.find((de: any) => de.id.toString() === reading.deviceEnvirId)
        return {
          id: reading._id,
          sensorName: reading.sensorName,
          identifier: reading.identifier,
          value: reading.value,
          timestamp: reading.timestamp,
          deviceEnvirId: reading.deviceEnvirId,
          deviceId: reading.deviceId, // Mantener para compatibilidad
          device: {
            id: deviceEnvir?.device?.id,
            name: deviceEnvir?.device?.name,
            alias: deviceEnvir?.alias || deviceEnvir?.device?.name,
            type: deviceEnvir?.type || 'unknown',
            status: deviceEnvir?.status
          },
          environment: {
            id: deviceEnvir?.environment?.id,
            name: deviceEnvir?.environment?.name,
            color: deviceEnvir?.environment?.color
          }
        }
      })
  
      return response.ok({
        status: 'success',
        data: {
          readings: enrichedReadings,
          count: enrichedReadings.length,
          message: `Últimas ${enrichedReadings.length} lecturas obtenidas de tus dispositivos`
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

  /**
   * Health check para MongoDB
   * GET /readings/health
   */
  public async healthCheck({ response }: HttpContext) {
    try {
      console.log('🔍 Starting MongoDB health check...')
      
      // Información de conexión
      const mongoose = (await import('mongoose')).default
      const connectionState = mongoose.connection.readyState
      const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting']
      
      console.log(`📊 MongoDB connection state: ${connectionState} (${stateNames[connectionState] || 'unknown'})`)
      
      // Probar conexión básica con timeout más largo
      const startTime = Date.now()
      
      const testResult = await Reading.findOne({}).maxTimeMS(15000).lean()
      
      const responseTime = Date.now() - startTime
      
      console.log(`✅ MongoDB query successful in ${responseTime}ms`)
      
      return response.ok({
        status: 'success',
        data: {
          mongodb: 'connected',
          connectionState: stateNames[connectionState] || 'unknown',
          responseTime: `${responseTime}ms`,
          hasData: testResult !== null,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('❌ MongoDB health check failed:', error)
      
      const mongoose = (await import('mongoose')).default
      const connectionState = mongoose.connection.readyState
      const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting']
      
      return response.status(503).json({
        status: 'error',
        message: 'MongoDB no está disponible',
        connectionState: stateNames[connectionState] || 'unknown',
        error: error.message,
        errorCode: error.code || 'UNKNOWN',
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Test endpoint simple - solo para debug
   * GET /readings/test-mongo
   */
  public async testMongo({ response }: HttpContext) {
    try {
      console.log('🧪 Testing MongoDB connection without auth...')
      
      // Test básico sin timeouts
      const count = await Reading.countDocuments({})
      
      return response.ok({
        status: 'success',
        message: 'MongoDB test successful',
        totalReadings: count,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('🚨 MongoDB test failed:', error)
      return response.status(500).json({
        status: 'error',
        message: 'MongoDB test failed',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * 📊 Obtener datos de sensores por dispositivo para tiempo real
   * Ruta optimizada para frontend - trae últimas lecturas agrupadas por sensor
   */
  public async getSensorDataByDevice({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { deviceId } = params
      const { 
        limit = 50,           // Número máximo de lecturas por sensor
        hours = 24,           // Horas hacia atrás para consultar
        groupBy = 'sensor',   // 'sensor' o 'time'
        includeStats = false  // Incluir estadísticas (min, max, avg)
      } = request.qs()

      // Verificar que el usuario tiene acceso al dispositivo
      const deviceAccess = await this.verifyDeviceAccess(deviceId, user.id)
      if (!deviceAccess.hasAccess) {
        return response.status(deviceAccess.status || 500).json({
          status: 'error',
          message: deviceAccess.message
        })
      }




      // Calcular timestamp desde hace X horas
      const hoursAgo = new Date()
      hoursAgo.setHours(hoursAgo.getHours() - parseInt(hours))

      // Obtener información adicional del dispositivo y sus device_environments
      const deviceInfo = await Device.query()
        .where('id', deviceId)
        .preload('deviceEnvirs', (query) => {
          query.whereNotNull('idEnvironment')
          query.preload('environment')
        })
        .select(['id', 'name'])
        .first()

      // Filtrar solo los deviceEnvirs que tengan environment cargado (opcional, pero recomendable)
      const filteredDeviceEnvirs = (deviceInfo?.deviceEnvirs || []).filter(de => de.environment)
      // Obtener todos los deviceEnvirId asociados al deviceId
      const deviceEnvirIds = filteredDeviceEnvirs.map(de => de.id.toString())

      // Pipeline de agregación para obtener datos agrupados por sensor
      const pipeline: any[] = [
        {
          $match: {
            deviceEnvirId: { $in: deviceEnvirIds },
            timestamp: { $gte: hoursAgo }
          }
        },
        {
          $sort: { timestamp: -1 }
        }
      ]

      if (groupBy === 'sensor') {
        // Agrupar por sensor y tomar las últimas N lecturas de cada uno
        pipeline.push({
          $group: {
            _id: '$sensorName',
            readings: {
              $push: {
                value: '$value',
                timestamp: '$timestamp',
                identifier: '$identifier'
              }
            },
            lastReading: { $first: '$$ROOT' },
            totalReadings: { $sum: 1 }
          }
        })

        // Limitar lecturas por sensor
        pipeline.push({
          $project: {
            sensorName: '$_id',
            readings: { $slice: ['$readings', parseInt(limit)] },
            lastValue: '$lastReading.value',
            lastTimestamp: '$lastReading.timestamp',
            lastIdentifier: '$lastReading.identifier',
            totalReadings: 1,
            _id: 0
          }
        })

        // Si se solicitan estadísticas
        if (includeStats === 'true') {
          pipeline.splice(-1, 0, {
            $addFields: {
              stats: {
                $let: {
                  vars: {
                    values: '$readings.value'
                  },
                  in: {
                    min: { $min: '$$values' },
                    max: { $max: '$$values' },
                    avg: { $avg: '$$values' },
                    count: { $size: '$$values' }
                  }
                }
              }
            }
          })
        }
      } else {
        // Agrupar por tiempo (para gráficos temporales)
        pipeline.push({
          $group: {
            _id: {
              sensor: '$sensorName',
              hour: {
                $dateToString: {
                  format: '%Y-%m-%d %H:00:00',
                  date: '$timestamp'
                }
              }
            },
            avgValue: { $avg: '$value' },
            minValue: { $min: '$value' },
            maxValue: { $max: '$value' },
            count: { $sum: 1 },
            readings: {
              $push: {
                value: '$value',
                timestamp: '$timestamp',
                identifier: '$identifier'
              }
            }
          }
        })

        pipeline.push({
          $project: {
            sensorName: '$_id.sensor',
            hour: '$_id.hour',
            avgValue: { $round: ['$avgValue', 2] },
            minValue: '$minValue',
            maxValue: '$maxValue',
            count: '$count',
            readings: { $slice: ['$readings', 10] }, // Máximo 10 readings por hora
            _id: 0
          }
        })

        pipeline.push({
          $sort: { hour: -1 }
        })
      }


      // Ejecutar la agregación
      const sensorData = await Reading.aggregate(pipeline)

      // Obtener sensores únicos para este dispositivo (por deviceEnvirId)
      const uniqueSensors = await Reading.distinct('sensorName', {
        deviceEnvirId: { $in: deviceEnvirIds }
      })

      // Estadísticas generales
      const totalReadings = await Reading.countDocuments({
        deviceEnvirId: { $in: deviceEnvirIds },
        timestamp: { $gte: hoursAgo }
      })

      const oldestReading = await Reading.findOne({
        deviceEnvirId: { $in: deviceEnvirIds }
      }).sort({ timestamp: 1 })

      const newestReading = await Reading.findOne({
        deviceEnvirId: { $in: deviceEnvirIds }
      }).sort({ timestamp: -1 })

      return response.ok({
        status: 'success',
        data: {
          deviceId: parseInt(deviceId),
          deviceInfo: {
            id: deviceInfo?.id,
            name: deviceInfo?.name,
            deviceEnvirs: filteredDeviceEnvirs
          },
          sensorData: sensorData,
          metadata: {
            uniqueSensors: uniqueSensors,
            totalReadings: totalReadings,
            queryParams: {
              limit: parseInt(limit),
              hours: parseInt(hours),
              groupBy: groupBy,
              includeStats: includeStats === 'true'
            },
            timeRange: {
              from: hoursAgo.toISOString(),
              to: new Date().toISOString()
            },
            dataRange: {
              oldest: oldestReading?.timestamp,
              newest: newestReading?.timestamp
            }
          }
        },
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error obteniendo datos de sensores por dispositivo:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener datos de sensores',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * 📈 Obtener resumen rápido de sensores para dashboard
   * Versión ligera para actualizaciones frecuentes
   */
  public async getDeviceSensorSummary({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { deviceId } = params
      const { minutes = 30 } = request.qs() // Por defecto últimos 30 minutos

      // Verificar acceso al dispositivo
      const deviceAccess = await this.verifyDeviceAccess(deviceId, user.id)
      if (!deviceAccess.hasAccess) {
        return response.status(deviceAccess.status || 500).json({
          status: 'error',
          message: deviceAccess.message
        })
      }

      // Timestamp desde hace X minutos
      const minutesAgo = new Date()
      minutesAgo.setMinutes(minutesAgo.getMinutes() - parseInt(minutes))

      // Pipeline optimizado para resumen rápido
      const summaryData = await Reading.aggregate([
        {
          $match: {
            deviceId: deviceId.toString(),
            timestamp: { $gte: minutesAgo }
          }
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $group: {
            _id: '$sensorName',
            lastValue: { $first: '$value' },
            lastTimestamp: { $first: '$timestamp' },
            lastIdentifier: { $first: '$identifier' },
            readingsCount: { $sum: 1 },
            minValue: { $min: '$value' },
            maxValue: { $max: '$value' },
            avgValue: { $avg: '$value' }
          }
        },
        {
          $project: {
            sensorName: '$_id',
            lastValue: 1,
            lastTimestamp: 1,
            lastIdentifier: 1,
            readingsCount: 1,
            minValue: 1,
            maxValue: 1,
            avgValue: { $round: ['$avgValue', 2] },
            isActive: {
              $gt: [
                '$lastTimestamp',
                {
                  $subtract: [new Date(), 5 * 60 * 1000] // Activo si hay lectura en últimos 5 minutos
                }
              ]
            },
            _id: 0
          }
        },
        {
          $sort: { lastTimestamp: -1 }
        }
      ])

      return response.ok({
        status: 'success',
        data: {
          deviceId: parseInt(deviceId),
          sensors: summaryData,
          summary: {
            totalSensors: summaryData.length,
            activeSensors: summaryData.filter(s => s.isActive).length,
            totalReadings: summaryData.reduce((sum, s) => sum + s.readingsCount, 0),
            timeRange: {
              minutes: parseInt(minutes),
              from: minutesAgo.toISOString(),
              to: new Date().toISOString()
            }
          }
        },
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error obteniendo resumen de sensores:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener resumen de sensores',
        error: error.message
      })
    }
  }

  /**
   * 🔒 Verificar si el usuario tiene acceso a un dispositivo
   * Función auxiliar reutilizable
   */
  private async verifyDeviceAccess(deviceId: string, userId: number) {
    try {
      const device = await Device.query()
        .where('id', deviceId)
        .preload('deviceEnvirs', (query) => {
          query.preload('environment', (envQuery) => {
            envQuery.where('id_user', userId)
          })
        })
        .first()

      if (!device) {
        return {
          hasAccess: false,
          status: 404,
          message: 'Dispositivo no encontrado'
        }
      }

      // Verificar si al menos una relación pertenece al usuario
      const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
        deviceEnvir.environment && deviceEnvir.environment.idUser === userId
      )

      if (!hasAccess) {
        return {
          hasAccess: false,
          status: 403,
          message: 'No tienes permisos para acceder a este dispositivo'
        }
      }

      return {
        hasAccess: true,
        device: device
      }

    } catch (error) {
      return {
        hasAccess: false,
        status: 500,
        message: 'Error verificando acceso al dispositivo'
      }
    }
  }

  /**
   * Obtener todos los dispositivos con sus sensores y últimas lecturas (tiempo real)
   */
  public async getAllDevicesWithSensorsAndReadings({ response }: HttpContext) {
    try {
      // Obtener todos los dispositivos con sus device_environments
      const devices = await Device.query()
        .preload('deviceEnvirs', (query) => {
          query.whereNotNull('idEnvironment')
          query.preload('environment')
        })
        .select(['id', 'name'])

      const devicesWithSensors = []

      for (const device of devices) {
        // Obtener todos los deviceEnvirIds para este dispositivo
        const deviceEnvirIds = device.deviceEnvirs.map(de => de.id.toString())
        
        if (deviceEnvirIds.length === 0) {
          devicesWithSensors.push({
            device: {
              id: device.id,
              name: device.name,
              deviceEnvirs: device.deviceEnvirs
            },
            sensors: [],
            lastUpdate: null
          })
          continue
        }

        // Agregación optimizada para obtener solo las últimas lecturas por sensor
        const latestReadingsBySensor = await Reading.aggregate([
          {
            $match: {
              deviceEnvirId: { $in: deviceEnvirIds }
            }
          },
          {
            $sort: { timestamp: -1 }
          },
          {
            $group: {
              _id: {
                sensorName: '$sensorName',
                identifier: '$identifier',
                deviceEnvirId: '$deviceEnvirId'
              },
              latestReading: { $first: '$$ROOT' }
            }
          },
          {
            $group: {
              _id: '$_id.sensorName',
              sensors: {
                $push: {
                  deviceEnvirId: '$_id.deviceEnvirId',
                  identifier: '$_id.identifier',
                  sensorName: '$_id.sensorName',
                  value: '$latestReading.value',
                  timestamp: '$latestReading.timestamp',
                  deviceId: '$latestReading.deviceId',
                  reading: '$latestReading'
                }
              }
            }
          },
          {
            $sort: { '_id': 1 }
          }
        ])

        // Obtener el timestamp de la lectura más reciente para este dispositivo
        const mostRecentReading = await Reading.findOne({
          deviceEnvirId: { $in: deviceEnvirIds }
        }).sort({ timestamp: -1 })

        devicesWithSensors.push({
          device: {
            id: device.id,
            name: device.name,
            deviceEnvirs: device.deviceEnvirs
          },
          sensors: latestReadingsBySensor,
          lastUpdate: mostRecentReading?.timestamp || null
        })
      }

      return response.json({
        status: 'success',
        data: {
          devices: devicesWithSensors,
          metadata: {
            totalDevices: devices.length,
            dataType: 'latest_readings',
            realtime: true
          }
        },
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error obteniendo dispositivos con sensores:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        error: error.message
      })
    }
  }

  /**
   * Enviar comando de control a dispositivos IoT
   */
  public async sendControlCommand({ request, response }: HttpContext) {
    try {
      const { command, deviceId, deviceEnvirId, type } = request.only(['command', 'deviceId', 'deviceEnvirId', 'type'])
      
      // Validar datos requeridos
      if (!command) {
        return response.status(400).json({
          status: 'error',
          message: 'El campo command es obligatorio'
        })
      }

      // Emitir comando por WebSocket
      WebSocketService.emitControlCommand(command, {
        deviceId: deviceId,
        deviceEnvirId: deviceEnvirId,
        type: type || 'control'
      })

      return response.json({
        status: 'success',
        message: 'Comando enviado correctamente',
        data: {
          command: command,
          deviceId: deviceId,
          deviceEnvirId: deviceEnvirId,
          type: type,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('Error enviando comando de control:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        error: error.message
      })
    }
  }
}
