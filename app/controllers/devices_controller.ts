import { HttpContext } from '@adonisjs/core/http'
import Device from '../models/device.js'
import Environment from '../models/environment.js'
import DeviceEnvir from '../models/device_envir.js'
import Code from '../models/code.js'
import ActuatorDeviceSetting from '../models/actuator_device_setting.js'
import ActuatorDevice from '../models/actuator_device.js'

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

      // Obtener dispositivos del entorno a través de device_envirs
      const deviceEnvirs = await DeviceEnvir.query()
        .where('idEnvironment', params.environmentId)
        .preload('device')

      const devices = deviceEnvirs.map(deviceEnvir => ({
        ...deviceEnvir.device.serialize(),
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        deviceEnvirId: deviceEnvir.id
      }))

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

      // Verificar que el usuario tiene acceso a este dispositivo
      const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
        deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
      )

      if (!hasAccess) {
        return response.status(404).json({
          status: 'error',
          message: 'No tienes permisos para ver este dispositivo'
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

      // Verificar que el usuario tiene acceso a este dispositivo
      const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
        deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
      )

      if (!hasAccess) {
        return response.status(404).json({
          status: 'error',
          message: 'No tienes permisos para actualizar este dispositivo'
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

      // Verificar que el usuario tiene acceso a este dispositivo
      const hasAccess = device.deviceEnvirs.some(deviceEnvir => 
        deviceEnvir.environment && deviceEnvir.environment.idUser === user.id
      )

      if (!hasAccess) {
        return response.status(404).json({
          status: 'error',
          message: 'No tienes permisos para eliminar este dispositivo'
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
 * Obtener todos los dispositivos del usuario autenticado con sensores y actuadores
 */
public async getAllDevices({ auth, response }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    // Obtener todos los deviceEnvirs que pertenecen a entornos del usuario
    const deviceEnvirs = await DeviceEnvir.query()
      .preload('device', (deviceQuery) => {
        deviceQuery
          .preload('deviceSensors', (sensorQuery) => {
            sensorQuery
              .preload('sensor')
              .preload('setting')
          })
          .preload('sensors') // Relación ManyToMany directa
      })
      .preload('environment', (query) => {
        query.where('id_user', user.id)
      })
      .preload('code')
      .whereHas('environment', (query) => {
        query.where('id_user', user.id)
      })

    // Obtener configuraciones de actuadores por cada device_envir
    const devicesWithDetails = await Promise.all(
      deviceEnvirs.map(async (deviceEnvir) => {
        // CORREGIDO: Buscar actuadores relacionados al device_envir (no al device directamente)
        const actuatorDevices = await ActuatorDevice.query()
          .where('idDevice', deviceEnvir.id) // idDevice en ActuatorDevice apunta a device_environments.id
          .preload('actuator')
          .preload('actuatorDeviceSettings')

        // Obtener configuración de intervalo desde el primer actuator device setting
        let intervalo = null
        if (actuatorDevices.length > 0 && actuatorDevices[0].actuatorDeviceSettings.length > 0) {
          intervalo = actuatorDevices[0].actuatorDeviceSettings[0].intervalo
        }

        return {
          // Información básica del device_envir
          deviceEnvirId: deviceEnvir.id,
          alias: deviceEnvir.alias,
          type: deviceEnvir.type,
          status: deviceEnvir.status,
          identifier: deviceEnvir.identifier,
          
          // Información del dispositivo
          device: {
            id: deviceEnvir.device.id,
            name: deviceEnvir.device.name,
            
            // Sensores con configuraciones
            sensors: deviceEnvir.device.deviceSensors.map(deviceSensor => ({
              id: deviceSensor.id,
              sensorIdentifier: deviceSensor.sensorIdentifier,
              sensor: {
                id: deviceSensor.sensor.id,
                tipoSensor: deviceSensor.sensor.tipoSensor, // Campo correcto del modelo
              },
              settings: {
                id: deviceSensor.setting?.id || null,
                comida: deviceSensor.setting?.comida || null,
                // Agregar otros settings si existen
              }
            })),

            // Lista de sensores (relación directa ManyToMany)
            availableSensors: deviceEnvir.device.sensors.map(sensor => ({
              id: sensor.id,
              tipoSensor: sensor.tipoSensor, // Campo correcto del modelo
            }))
          },

          // Información del environment
          environment: {
            id: deviceEnvir.environment.id,
            name: deviceEnvir.environment.name,
            color: deviceEnvir.environment.color
          },

          // Código del dispositivo
          code: deviceEnvir.code?.code || null,

          // Actuadores con configuraciones
          actuators: actuatorDevices.map((actuatorDevice: any) => ({
            id: actuatorDevice.id,
            actuator: {
              id: actuatorDevice.actuator.id,
              nombre: actuatorDevice.actuator.nombre, // Campo correcto del modelo
            },
            settings: actuatorDevice.actuatorDeviceSettings.map((setting: any) => ({
              id: setting.id,
              intervalo: setting.intervalo,
              // Agregar otros campos de configuración
            }))
          })),

          // Configuraciones globales
          configurations: {
            intervalo: intervalo,
            intervaloEnHoras: intervalo ? Math.round(intervalo / 60 * 100) / 100 : null,
          },

          // Timestamps
          createdAt: deviceEnvir.createdAt,
          updatedAt: deviceEnvir.updatedAt
        }
      })
    )

    return response.ok({
      status: 'success',
      message: 'Dispositivos obtenidos correctamente con sensores y actuadores',
      data: devicesWithDetails,
      total: devicesWithDetails.length,
      summary: {
        totalDevices: devicesWithDetails.length,
        totalSensors: devicesWithDetails.reduce((acc, device) => acc + device.device.sensors.length, 0),
        totalActuators: devicesWithDetails.reduce((acc, device) => acc + device.actuators.length, 0),
        deviceTypes: {
          areneros: devicesWithDetails.filter(d => d.type === 'arenero').length,
          comederos: devicesWithDetails.filter(d => d.type === 'comedero').length,
          bebederos: devicesWithDetails.filter(d => d.type === 'bebedero').length
        }
      }
    })
  } catch (error: any) {
    console.error('Error al obtener todos los dispositivos:', error)
    return response.status(500).json({
      status: 'error',
      message: 'Error al obtener los dispositivos',
      error: error.message
    })
  }
}

/**
 * Obtener un dispositivo específico por su ID con todos sus sensores y actuadores
 */
public async getDeviceWithDetails({ params, auth, response }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    const { deviceId } = params

    // Buscar el dispositivo a través de device_envir (ya que puede estar en múltiples environments)
    const deviceEnvirs = await DeviceEnvir.query()
      .where('idDevice', deviceId)
      .preload('device', (deviceQuery) => {
        deviceQuery
          .preload('deviceSensors', (sensorQuery) => {
            sensorQuery
              .preload('sensor')
              .preload('setting')
          })
          .preload('sensors') // Relación ManyToMany directa
      })
      .preload('environment', (query) => {
        query.where('id_user', user.id) // Solo environments del usuario
      })
      .preload('code')
      .whereHas('environment', (query) => {
        query.where('id_user', user.id) // Verificar permisos del usuario
      })

    if (deviceEnvirs.length === 0) {
      return response.status(404).json({
        status: 'error',
        message: 'Dispositivo no encontrado o sin permisos de acceso'
      })
    }

    // Obtener detalles completos para cada asignación del dispositivo
    const deviceDetails = await Promise.all(
      deviceEnvirs.map(async (deviceEnvir) => {
        // CORREGIDO: Los actuadores están relacionados al device_envir, no al device directamente
        const actuatorDevices = await ActuatorDevice.query()
          .where('idDevice', deviceEnvir.id) // Relacionado a device_environments.id
          .preload('actuator')
          .preload('actuatorDeviceSettings')

        // Obtener configuración de intervalo desde el primer actuator device setting
        let intervalo = null
        if (actuatorDevices.length > 0 && actuatorDevices[0].actuatorDeviceSettings.length > 0) {
          intervalo = actuatorDevices[0].actuatorDeviceSettings[0].intervalo
        }

        return {
          // Información básica del device_envir
          deviceEnvirId: deviceEnvir.id,
          alias: deviceEnvir.alias,
          type: deviceEnvir.type,
          status: deviceEnvir.status,
          identifier: deviceEnvir.identifier,
          
          // Información del dispositivo
          device: {
            id: deviceEnvir.device.id,
            name: deviceEnvir.device.name,
            
            // Sensores con configuraciones (estos sí van directo al device)
            sensors: deviceEnvir.device.deviceSensors.map(deviceSensor => ({
              id: deviceSensor.id,
              sensorIdentifier: deviceSensor.sensorIdentifier,
              sensor: {
                id: deviceSensor.sensor.id,
                tipoSensor: deviceSensor.sensor.tipoSensor,
              },
              settings: {
                id: deviceSensor.setting?.id || null,
                comida: deviceSensor.setting?.comida || null,
              }
            })),

            // Lista de sensores disponibles (relación ManyToMany)
            availableSensors: deviceEnvir.device.sensors.map(sensor => ({
              id: sensor.id,
              tipoSensor: sensor.tipoSensor,
            }))
          },

          // Información del environment
          environment: {
            id: deviceEnvir.environment.id,
            name: deviceEnvir.environment.name,
            color: deviceEnvir.environment.color
          },

          // Código del dispositivo
          code: deviceEnvir.code?.code || null,

          // Actuadores específicos de esta asignación device_envir
          actuators: actuatorDevices.map((actuatorDevice: any) => ({
            id: actuatorDevice.id,
            actuator: {
              id: actuatorDevice.actuator.id,
              nombre: actuatorDevice.actuator.nombre,
            },
            settings: actuatorDevice.actuatorDeviceSettings.map((setting: any) => ({
              id: setting.id,
              intervalo: setting.intervalo,
            }))
          })),

          // Configuraciones globales
          configurations: {
            intervalo: intervalo,
            intervaloEnHoras: intervalo ? Math.round(intervalo / 60 * 100) / 100 : null,
          },

          // Timestamps
          createdAt: deviceEnvir.createdAt,
          updatedAt: deviceEnvir.updatedAt
        }
      })
    )

    // Información general del dispositivo (solo una vez)
    const mainDevice = deviceEnvirs[0].device

    return response.ok({
      status: 'success',
      message: 'Dispositivo obtenido correctamente con sensores y actuadores',
      data: {
        // Información general del dispositivo
        deviceId: mainDevice.id,
        deviceName: mainDevice.name,
        
        // Sensores del dispositivo (son los mismos para todas las asignaciones)
        sensors: mainDevice.deviceSensors.map(deviceSensor => ({
          id: deviceSensor.id,
          sensorIdentifier: deviceSensor.sensorIdentifier,
          sensor: {
            id: deviceSensor.sensor.id,
            tipoSensor: deviceSensor.sensor.tipoSensor,
          },
          settings: {
            id: deviceSensor.setting?.id || null,
            comida: deviceSensor.setting?.comida || null,
          }
        })),

        // Asignaciones del dispositivo (puede estar en múltiples environments)
        assignments: deviceDetails,
        
        // Resumen
        summary: {
          totalAssignments: deviceDetails.length,
          totalActuators: deviceDetails.reduce((acc, detail) => acc + detail.actuators.length, 0),
          environments: deviceDetails.map(detail => detail.environment.name).join(', ')
        }
      }
    })
  } catch (error: any) {
    console.error('Error al obtener dispositivo con detalles:', error)
    return response.status(500).json({
      status: 'error',
      message: 'Error al obtener el dispositivo',
      error: error.message
    })
  }
}

/**
 * Asignar un dispositivo existente a un environment
 * Valida que el código ya existe y crea solo la asignación en device_envir
 */
/**
 * Asignar un dispositivo usando solo código y alias
 * Detecta automáticamente el tipo y usa el environment del contexto
 */
public async assignToEnvironment({ request, response, auth, params }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    // Obtener environmentId desde los parámetros de la URL
    const { environmentId } = params
    const data = request.only(['deviceCode', 'alias'])
    
    // Validar datos requeridos (solo código y alias)
    if (!data.deviceCode || !data.alias) {
      return response.status(400).json({
        status: 'error',
        message: 'El código del dispositivo y el alias son obligatorios'
      })
    }

    // Validar formato del código usando el modelo Code
    const codeValidation = Code.validateDeviceCode(data.deviceCode)
    if (!codeValidation.isValid) {
      return response.status(400).json({
        status: 'error',
        message: codeValidation.message
      })
    }

    // Verificar que el environment existe y pertenece al usuario
    const environment = await Environment.query()
      .where('id', environmentId)
      .where('id_user', user.id)
      .first()

    if (!environment) {
      return response.status(404).json({
        status: 'error',
        message: 'El environment especificado no existe o no tienes permisos'
      })
    }

    // Verificar que el código YA EXISTE en la tabla device_codes
    const existingCode = await Code.query()
      .where('code', data.deviceCode)
      .first()

    if (!existingCode) {
      return response.status(404).json({
        status: 'error',
        message: `El código ${data.deviceCode} no existe. Solo puedes asignar dispositivos con códigos válidos existentes.`
      })
    }

    // Obtener el device environment asociado al código para detectar el tipo
    const sourceDeviceEnvironment = await DeviceEnvir.query()
      .where('id', existingCode.idDeviceEnvironment)
      .preload('device')
      .first()

    if (!sourceDeviceEnvironment) {
      return response.status(404).json({
        status: 'error',
        message: 'No se encontró el device environment asociado al código.'
      })
    }

    // ✨ DETECTAR AUTOMÁTICAMENTE EL TIPO del dispositivo
    const detectedType = sourceDeviceEnvironment.type

    // Verificar que el dispositivo no esté ya asignado al mismo environment
    const existingAssignment = await DeviceEnvir.query()
      .where('idDevice', sourceDeviceEnvironment.idDevice)
      .where('idEnvironment', environmentId)
      .first()

    if (existingAssignment) {
      return response.status(400).json({
        status: 'error',
        message: `El dispositivo con código ${data.deviceCode} ya está asignado a este environment.`
      })
    }

    // Crear la nueva asignación en device_envir con tipo detectado automáticamente
    const deviceEnvir = await DeviceEnvir.create({
      alias: data.alias,
      type: detectedType, // ✨ TIPO DETECTADO AUTOMÁTICAMENTE
      status: 'abastecido', // Status por defecto
      identifier: `${detectedType}_${Date.now()}`, // Generar identifier único
      idDevice: sourceDeviceEnvironment.idDevice,
      idEnvironment: environmentId // ✨ ENVIRONMENT DESDE LA URL
    })

    // Cargar las relaciones para la respuesta
    await deviceEnvir.load('device')
    await deviceEnvir.load('environment')

    return response.status(201).json({
      status: 'success',
      message: `Dispositivo ${detectedType} asignado automáticamente al environment`,
      data: {
        deviceEnvir,
        device: {
          id: deviceEnvir.device.id,
          name: deviceEnvir.device.name,
          code: data.deviceCode,
          identifier: deviceEnvir.identifier
        },
        environment: {
          id: environment.id,
          name: environment.name,
          color: environment.color
        },
        autoDetected: {
          type: detectedType,
          message: `Tipo "${detectedType}" detectado automáticamente del código ${data.deviceCode}`
        }
      }
    })
  } catch (error: any) {
    console.error('Error al asignar dispositivo al environment:', error)
    return response.status(500).json({
      status: 'error',
      message: 'Error al procesar la solicitud',
      error: error.message
    })
  }
}

/**
 * Obtener los detalles de una asignación device_envir específica
 * Útil para cargar datos en formularios de edición
 */
public async getDeviceEnvironment({ params, auth, response }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    const { deviceEnvirId } = params

    // Buscar el registro device_envir con sus relaciones
    const deviceEnvir = await DeviceEnvir.query()
      .where('id', deviceEnvirId)
      .preload('device', (deviceQuery) => {
        deviceQuery.preload('deviceSensors', (sensorQuery) => {
          sensorQuery.preload('setting')
        })
      })
      .preload('environment')
      .preload('code')
      .first()

    if (!deviceEnvir) {
      return response.status(404).json({
        status: 'error',
        message: 'Asignación de dispositivo no encontrada'
      })
    }

    // Verificar que el environment pertenece al usuario
    if (deviceEnvir.environment.idUser !== user.id) {
      return response.status(403).json({
        status: 'error',
        message: 'No tienes permisos para ver este dispositivo'
      })
    }

    // Obtener configuraciones del device (comida e intervalo)
    const deviceSensor = deviceEnvir.device.deviceSensors[0]
    const comida = deviceSensor?.setting?.comida || null

    // Obtener configuración de intervalo desde actuators_device_settings
    const actuatorSetting = await ActuatorDeviceSetting.query()
      .where('idActuatorSetting', 1) // ID base para intervalos
      .first()
    const intervalo = actuatorSetting?.intervalo || null

    return response.ok({
      status: 'success',
      data: {
        id: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        status: deviceEnvir.status,
        intervalo: intervalo,
        comida: comida,
        code: deviceEnvir.code?.code || null,
        device: {
          id: deviceEnvir.device.id,
          name: deviceEnvir.device.name,
        },
        environment: {
          id: deviceEnvir.environment.id,
          name: deviceEnvir.environment.name,
          color: deviceEnvir.environment.color
        },
        createdAt: deviceEnvir.createdAt,
        updatedAt: deviceEnvir.updatedAt
      }
    })
  } catch (error) {
    console.error('Error al obtener detalles del dispositivo:', error)
    return response.status(500).json({
      status: 'error',
      message: 'Error al procesar la solicitud',
      error: error.message
    })
  }
}

/**
 * Actualizar la configuración de un dispositivo en un environment (device_envir)
 * Permite modificar alias, tipo, status, intervalo y comida
 */
public async updateDeviceEnvironment({ params, request, response, auth }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    const { deviceEnvirId } = params
    const data = request.only(['alias', 'type', 'status', 'intervalo', 'comida', 'environmentId', 'code'])

    // Buscar el registro device_envir
    const deviceEnvir = await DeviceEnvir.query()
      .where('id', deviceEnvirId)
      .preload('environment')
      .preload('device')
      .first()

    if (!deviceEnvir) {
      return response.status(404).json({
        status: 'error',
        message: 'Asignación de dispositivo no encontrada'
      })
    }

    // Verificar que el environment pertenece al usuario
    if (deviceEnvir.environment.idUser !== user.id) {
      return response.status(403).json({
        status: 'error',
        message: 'No tienes permisos para modificar este dispositivo'
      })
    }

    // Validar tipo de dispositivo si se proporciona
    if (data.type && !['arenero', 'bebedero', 'comedero'].includes(data.type)) {
      return response.status(400).json({
        status: 'error',
        message: 'El tipo de dispositivo debe ser: arenero, bebedero o comedero'
      })
    }

    // Validar status si se proporciona
    if (data.status && !['sin_comida', 'sin_arena', 'sin_agua', 'abastecido', 'lleno', 'sucio'].includes(data.status)) {
      return response.status(400).json({
        status: 'error',
        message: 'El status debe ser uno de: sin_comida, sin_arena, sin_agua, abastecido, lleno, sucio'
      })
    }

    // Validar intervalo si se proporciona (debe ser positivo)
    if (data.intervalo !== undefined && data.intervalo !== null && data.intervalo <= 0) {
      return response.status(400).json({
        status: 'error',
        message: 'El intervalo debe ser un número positivo'
      })
    }

    // Validar comida si se proporciona (debe ser positivo o cero)
    if (data.comida !== undefined && data.comida !== null && data.comida < 0) {
      return response.status(400).json({
        status: 'error',
        message: 'La cantidad de comida debe ser un número positivo o cero'
      })
    }

    // Validar código si se proporciona
    if (data.code) {
      // Validar formato del código
      const codeValidation = Code.validateDeviceCode(data.code)
      if (!codeValidation.isValid) {
        return response.status(400).json({
          status: 'error',
          message: codeValidation.message
        })
      }

      // Verificar si el código ya existe (excepto el actual)
      const existingCode = await Code.query()
        .where('code', data.code)
        .where('idDevice', '!=', deviceEnvir.idDevice)
        .first()

      if (existingCode) {
        return response.status(400).json({
          status: 'error',
          message: `El código ${data.code} ya está en uso. Ingresa un código diferente.`
        })
      }
    }

    // Si se quiere cambiar de environment, validar que el nuevo environment pertenece al usuario
    if (data.environmentId && data.environmentId !== deviceEnvir.idEnvironment) {
      const newEnvironment = await Environment.query()
        .where('id', data.environmentId)
        .where('id_user', user.id)
        .first()

      if (!newEnvironment) {
        return response.status(404).json({
          status: 'error',
          message: 'El nuevo environment especificado no existe o no tienes permisos'
        })
      }

      // Verificar que no exista ya una asignación del mismo dispositivo en el nuevo environment
      const existingInNewEnv = await DeviceEnvir.query()
        .where('idDevice', deviceEnvir.idDevice)
        .where('idEnvironment', data.environmentId)
        .where('id', '!=', deviceEnvirId)
        .first()

      if (existingInNewEnv) {
        return response.status(400).json({
          status: 'error',
          message: 'El dispositivo ya está asignado al environment especificado'
        })
      }
    }

    // Actualizar solo los campos que se proporcionaron
    const updateData: any = {}
    if (data.alias) updateData.alias = data.alias
    if (data.type) updateData.type = data.type
    if (data.status) updateData.status = data.status
    if (data.code) updateData.code = data.code
    if (data.intervalo !== undefined) updateData.intervalo = data.intervalo
    if (data.comida !== undefined) updateData.comida = data.comida
    if (data.environmentId) updateData.idEnvironment = data.environmentId

    deviceEnvir.merge(updateData)
    await deviceEnvir.save()

    // Recargar las relaciones para la respuesta
    await deviceEnvir.load('device')
    await deviceEnvir.load('environment')

    return response.ok({
      status: 'success',
      message: 'Configuración del dispositivo actualizada correctamente',
      data: {
        deviceEnvir,
        device: {
          id: deviceEnvir.device.id,
          name: deviceEnvir.device.name,
        },
        environment: {
          id: deviceEnvir.environment.id,
          name: deviceEnvir.environment.name,
          color: deviceEnvir.environment.color
        }
      }
    })
  } catch (error) {
    console.error('Error al actualizar configuración del dispositivo:', error)
    return response.status(500).json({
      status: 'error',
      message: 'Error al procesar la solicitud',
      error: error.message
    })
  }
}

/**
 * Eliminar una asignación device_envir
 * Elimina la relación entre dispositivo y environment, pero mantiene ambos intactos
 */
public async deleteDeviceEnvironment({ params, auth, response }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    const { deviceEnvirId } = params

    // Buscar el registro device_envir con sus relaciones
    const deviceEnvir = await DeviceEnvir.query()
      .where('id', deviceEnvirId)
      .preload('device')
      .preload('environment')
      .preload('code')
      .first()

    if (!deviceEnvir) {
      return response.status(404).json({
        status: 'error',
        message: 'Asignación de dispositivo no encontrada'
      })
    }

    // Verificar que el environment pertenece al usuario
    if (deviceEnvir.environment.idUser !== user.id) {
      return response.status(403).json({
        status: 'error',
        message: 'No tienes permisos para eliminar esta asignación'
      })
    }

    // Guardar información para la respuesta antes de eliminar
    const deletedInfo = {
      deviceEnvirId: deviceEnvir.id,
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      status: deviceEnvir.status,
      code: deviceEnvir.code?.code || null,
      device: {
        id: deviceEnvir.device.id,
        name: deviceEnvir.device.name
      },
      environment: {
        id: deviceEnvir.environment.id,
        name: deviceEnvir.environment.name,
        color: deviceEnvir.environment.color
      }
    }

    // Eliminar la asignación
    await deviceEnvir.delete()

    return response.ok({
      status: 'success',
      message: 'Asignación de dispositivo eliminada correctamente',
      data: {
        deleted: deletedInfo,
        note: 'El dispositivo y el environment se mantienen intactos, solo se eliminó la asignación'
      }
    })
  } catch (error) {
    console.error('Error al eliminar asignación del dispositivo:', error)
    return response.status(500).json({
      status: 'error',
      message: 'Error al procesar la solicitud',
      error: error.message
    })
  }
}



/**
 * Obtener environments disponibles para un usuario
 * Esta función ayuda en el formulario para mostrar las opciones
 */
public async getUserEnvironments({ auth, response }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    const environments = await Environment.query()
      .where('id_user', user.id)
      .select('id', 'name', 'color')

    return response.ok({
      status: 'success',
      data: environments
    })
  } catch (error) {
    console.error('Error al obtener environments del usuario:', error)
    return response.status(500).json({
      status: 'error',
      message: 'Error al obtener environments',
      error: error.message
    })
  }
}

/**
 * Obtener un device_environment específico por su ID con todos sus sensores y actuadores
 * Esta función busca por deviceEnvirId en lugar de deviceId
 */
public async getDeviceEnvironmentWithDetails({ params, auth, response }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    const { deviceEnvirId } = params

    // Buscar directamente el device_envir por su ID
    const deviceEnvir = await DeviceEnvir.query()
      .where('id', deviceEnvirId)
      .preload('device', (deviceQuery) => {
        deviceQuery
          .preload('deviceSensors', (sensorQuery) => {
            sensorQuery
              .preload('sensor')
              .preload('setting')
          })
          .preload('sensors') // Relación ManyToMany directa
      })
      .preload('environment')
      .preload('code')
      .first()

    if (!deviceEnvir) {
      return response.status(404).json({
        status: 'error',
        message: 'Device environment no encontrado'
      })
    }

    // Verificar que el environment pertenece al usuario
    if (deviceEnvir.environment.idUser !== user.id) {
      return response.status(403).json({
        status: 'error',
        message: 'No tienes permisos para acceder a este dispositivo'
      })
    }

    // Obtener actuadores relacionados al device_envir
    const actuatorDevices = await ActuatorDevice.query()
      .where('idDevice', deviceEnvir.id) // Relacionado a device_environments.id
      .preload('actuator')
      .preload('actuatorDeviceSettings')

    // Obtener configuración de intervalo desde el primer actuator device setting
    let intervalo = null
    if (actuatorDevices.length > 0 && actuatorDevices[0].actuatorDeviceSettings.length > 0) {
      intervalo = actuatorDevices[0].actuatorDeviceSettings[0].intervalo
    }

    return response.ok({
      status: 'success',
      message: 'Device environment obtenido correctamente con sensores y actuadores',
      data: {
        // Información del device_envir
        deviceEnvirId: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        status: deviceEnvir.status,
        identifier: deviceEnvir.identifier,
        
        // Información del dispositivo físico
        device: {
          id: deviceEnvir.device.id,
          name: deviceEnvir.device.name,
          
          // Sensores con configuraciones (van directo al device)
          sensors: deviceEnvir.device.deviceSensors.map(deviceSensor => ({
            id: deviceSensor.id,
            sensorIdentifier: deviceSensor.sensorIdentifier,
            sensor: {
              id: deviceSensor.sensor.id,
              tipoSensor: deviceSensor.sensor.tipoSensor,
            },
            settings: {
              id: deviceSensor.setting?.id || null,
              comida: deviceSensor.setting?.comida || null,
            }
          })),

          // Lista de sensores disponibles (relación ManyToMany)
          availableSensors: deviceEnvir.device.sensors.map(sensor => ({
            id: sensor.id,
            tipoSensor: sensor.tipoSensor,
          }))
        },

        // Información del environment
        environment: {
          id: deviceEnvir.environment.id,
          name: deviceEnvir.environment.name,
          color: deviceEnvir.environment.color
        },

        // Código del dispositivo
        code: deviceEnvir.code?.code || null,

        // Actuadores específicos de este device_envir
        actuators: actuatorDevices.map((actuatorDevice: any) => ({
          id: actuatorDevice.id,
          actuator: {
            id: actuatorDevice.actuator.id,
            nombre: actuatorDevice.actuator.nombre,
          },
          settings: actuatorDevice.actuatorDeviceSettings.map((setting: any) => ({
            id: setting.id,
            intervalo: setting.intervalo,
          }))
        })),

        // Configuraciones globales
        configurations: {
          intervalo: intervalo,
          intervaloEnHoras: intervalo ? Math.round(intervalo / 60 * 100) / 100 : null,
        },

        // Timestamps
        createdAt: deviceEnvir.createdAt,
        updatedAt: deviceEnvir.updatedAt
      }
    })
  } catch (error: any) {
    console.error('Error al obtener device environment con detalles:', error)
    return response.status(500).json({
      status: 'error',
      message: 'Error al obtener el device environment',
      error: error.message
    })
  }
}
}
