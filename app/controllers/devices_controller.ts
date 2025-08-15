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
 * Obtener todos los dispositivos del usuario autenticado
 */
public async getAllDevices({ auth, response }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    // Obtener todos los deviceEnvirs que pertenecen a entornos del usuario
    const deviceEnvirs = await DeviceEnvir.query()
      .preload('device')
      .preload('environment', (query) => {
        query.where('id_user', user.id)
      })
      .whereHas('environment', (query) => {
        query.where('id_user', user.id)
      })

    const devices = deviceEnvirs.map(deviceEnvir => ({
      ...deviceEnvir.device.serialize(),
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      deviceEnvirId: deviceEnvir.id,
      environment: deviceEnvir.environment
    }))

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

/**
 * Asignar un dispositivo a un environment
 * Busca el dispositivo por código y lo asigna al environment seleccionado
 */
public async assignToEnvironment({ request, response, auth }: HttpContext) {
  try {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'No autenticado' })
    }

    const data = request.only(['deviceCode', 'environmentId', 'alias', 'type', 'status'])
    
    // Validar datos requeridos
    if (!data.deviceCode || !data.environmentId || !data.alias || !data.type) {
      return response.status(400).json({
        status: 'error',
        message: 'Todos los campos son obligatorios: deviceCode, environmentId, alias, type'
      })
    }

    // Validar tipo de dispositivo
    if (!['arenero', 'bebedero', 'comedero'].includes(data.type)) {
      return response.status(400).json({
        status: 'error',
        message: 'El tipo de dispositivo debe ser: arenero, bebedero o comedero'
      })
    }

    // Buscar el dispositivo por código
    const device = await Device.query()
      .where('code', data.deviceCode)
      .first()

    if (!device) {
      return response.status(404).json({
        status: 'error',
        message: `No se encontró un dispositivo con el código: ${data.deviceCode}`
      })
    }

    // Verificar que el environment existe y pertenece al usuario
    const environment = await Environment.query()
      .where('id', data.environmentId)
      .where('id_user', user.id)
      .first()

    if (!environment) {
      return response.status(404).json({
        status: 'error',
        message: 'El environment especificado no existe o no tienes permisos'
      })
    }

    // Verificar si el dispositivo ya está asignado a este environment
    const existingAssignment = await DeviceEnvir.query()
      .where('idDevice', device.id)
      .where('idEnvironment', data.environmentId)
      .first()

    if (existingAssignment) {
      return response.status(400).json({
        status: 'error',
        message: 'El dispositivo ya está asignado a este environment'
      })
    }

    // Crear la asignación en device_envir
    const deviceEnvir = await DeviceEnvir.create({
      alias: data.alias,
      type: data.type,
      status: data.status || 'activo',
      idDevice: device.id,
      idEnvironment: data.environmentId
    })

    // Cargar las relaciones para la respuesta
    await deviceEnvir.load('device')
    await deviceEnvir.load('environment')

    return response.status(201).json({
      status: 'success',
      message: 'Dispositivo asignado al environment correctamente',
      data: {
        deviceEnvir,
        device: {
          id: device.id,
          name: device.name,
          code: device.code,
          apiKey: device.apiKey
        },
        environment: {
          id: environment.id,
          name: environment.name,
          color: environment.color
        }
      }
    })
  } catch (error) {
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
      .preload('device')
      .preload('environment')
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

    return response.ok({
      status: 'success',
      data: {
        id: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        status: deviceEnvir.status,
        intervalo: deviceEnvir.intervalo,
        comida: deviceEnvir.comida,
        device: {
          id: deviceEnvir.device.id,
          name: deviceEnvir.device.name,
          code: deviceEnvir.device.code,
          apiKey: deviceEnvir.device.apiKey
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
    const data = request.only(['alias', 'type', 'status', 'intervalo', 'comida', 'environmentId'])

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
          code: deviceEnvir.device.code,
          apiKey: deviceEnvir.device.apiKey
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
      device: {
        id: deviceEnvir.device.id,
        name: deviceEnvir.device.name,
        code: deviceEnvir.device.code
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
}
