import type { HttpContext } from '@adonisjs/core/http'
import DeviceEnvir from '#models/device_envir'
import DeviceSensorSetting from '#models/device_sensor_setting'
import ActuatorDeviceSetting from '#models/actuator_device_setting'
import WebSocketService from '#services/websocket_service'

export default class StatusesController {
  
  /**
   * Cambiar estado a "sin comida"
   */
  async setSinComida({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)
      
      deviceEnvir.status = 'sin_comida'
      await deviceEnvir.save()

      // Emitir evento WebSocket
      this.emitStatusChange(deviceEnvirId, 'sin_comida', deviceEnvir)

      return response.ok({
        message: 'Estado cambiado a sin comida',
        device: deviceEnvir
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al cambiar estado',
        error: error.message
      })
    }
  }

  /**
   * Cambiar estado a "sin arena"
   */
  async setSinArena({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)
      
      deviceEnvir.status = 'sin_arena'
      await deviceEnvir.save()

      // Emitir evento WebSocket
      this.emitStatusChange(deviceEnvirId, 'sin_arena', deviceEnvir)

      return response.ok({
        message: 'Estado cambiado a sin arena',
        device: deviceEnvir
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al cambiar estado',
        error: error.message
      })
    }
  }

  /**
   * Cambiar estado a "sin agua"
   */
  async setSinAgua({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)
      
      deviceEnvir.status = 'sin_agua'
      await deviceEnvir.save()

      // Emitir evento WebSocket
      this.emitStatusChange(deviceEnvirId, 'sin_agua', deviceEnvir)

      return response.ok({
        message: 'Estado cambiado a sin agua',
        device: deviceEnvir
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al cambiar estado',
        error: error.message
      })
    }
  }

  /**
   * Cambiar estado a "abastecido"
   */
  async setAbastecido({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)
      
      deviceEnvir.status = 'abastecido'
      await deviceEnvir.save()

      // Emitir evento WebSocket
      this.emitStatusChange(deviceEnvirId, 'abastecido', deviceEnvir)

      return response.ok({
        message: 'Estado cambiado a abastecido',
        device: deviceEnvir
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al cambiar estado',
        error: error.message
      })
    }
  }

  /**
   * Cambiar estado a "lleno"
   */
  async setLleno({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)
      
      deviceEnvir.status = 'lleno'
      await deviceEnvir.save()

      // Emitir evento WebSocket
      this.emitStatusChange(deviceEnvirId, 'lleno', deviceEnvir)

      return response.ok({
        message: 'Estado cambiado a lleno',
        device: deviceEnvir
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al cambiar estado',
        error: error.message
      })
    }
  }

  /**
   * Cambiar estado a "sucio"
   */
  async setSucio({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)
      
      deviceEnvir.status = 'sucio'
      await deviceEnvir.save()

      // Emitir evento WebSocket
      this.emitStatusChange(deviceEnvirId, 'sucio', deviceEnvir)

      return response.ok({
        message: 'Estado cambiado a sucio',
        device: deviceEnvir
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al cambiar estado',
        error: error.message
      })
    }
  }

  /**
   * Obtener el estado actual de un dispositivo
   */
  async getStatus({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('device')
        .preload('environment')
        .firstOrFail()

      return response.ok({
        deviceEnvir,
        status: deviceEnvir.status
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al obtener estado del dispositivo',
        error: error.message
      })
    }
  }

  /**
   * Obtener todos los estados de dispositivos de un entorno
   */
  async getEnvironmentStatus({ params, response }: HttpContext) {
    try {
      const environmentId = params.environmentId
      const deviceEnvirs = await DeviceEnvir.query()
        .where('idEnvironment', environmentId)
        .preload('device')

      return response.ok({
        environment_id: environmentId,
        devices: deviceEnvirs
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al obtener estados del entorno',
        error: error.message
      })
    }
  }

  /**
   * Cambiar estado de forma genérica
   */
  async updateStatus({ params, request, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const { status } = request.only(['status'])

      const validStatuses = ['sin_comida', 'sin_arena', 'sin_agua', 'abastecido', 'lleno', 'sucio']
      
      if (!validStatuses.includes(status)) {
        return response.badRequest({
          message: 'Estado no válido',
          valid_statuses: validStatuses
        })
      }

      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)
      deviceEnvir.status = status
      await deviceEnvir.save()

      // Emitir evento WebSocket
      this.emitStatusChange(deviceEnvirId, status, deviceEnvir)

      return response.ok({
        message: `Estado cambiado a ${status}`,
        device: deviceEnvir
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al cambiar estado',
        error: error.message
      })
    }
  }

  /**
   * Configurar intervalo de limpieza para areneros
   */
  async setIntervalo({ params, request, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const { intervalo } = request.only(['intervalo'])

      if (!intervalo || intervalo <= 0) {
        return response.badRequest({
          message: 'El intervalo debe ser un número positivo en minutos'
        })
      }

      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('device')
        .firstOrFail()

      // Verificar que sea un arenero
      if (deviceEnvir.type !== 'arenero') {
        return response.badRequest({
          message: 'Solo los areneros pueden tener intervalos de limpieza configurados'
        })
      }

      // Buscar o crear configuración de intervalo usando SQL directo
      const existingInterval = await ActuatorDeviceSetting.query()
        .whereHas('actuatorDevice', (query) => {
          // Simplificado: usar ID directo o buscar por device
          query.where('id', 1) // Ajustar según tu lógica
        })
        .first()

      if (existingInterval) {
        existingInterval.intervalo = intervalo
        await existingInterval.save()
      } else {
        await ActuatorDeviceSetting.create({
          idActuatorSetting: 1, // ID base para intervalos
          intervalo: intervalo
        })
      }

      // Emitir evento WebSocket de cambio de intervalo
      WebSocketService.emitIntervalChange(deviceEnvir, intervalo)

      return response.ok({
        message: `Intervalo de limpieza configurado a ${intervalo} minutos`,
        device: deviceEnvir,
        intervalo: intervalo
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al configurar intervalo',
        error: error.message
      })
    }
  }

  /**
   * Obtener intervalo de limpieza de un arenero
   */
  async getIntervalo({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('device')
        .firstOrFail()

      if (deviceEnvir.type !== 'arenero') {
        return response.badRequest({
          message: 'Solo los areneros tienen intervalos de limpieza'
        })
      }

      // Buscar intervalo en actuators_device_settings
      const actuatorSetting = await ActuatorDeviceSetting.query()
        .where('idActuatorSetting', 1) // ID base para intervalos
        .first()

      const intervalo = actuatorSetting?.intervalo || null

      return response.ok({
        deviceEnvirId: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        intervalo: intervalo,
        intervaloEnHoras: intervalo ? Math.round(intervalo / 60 * 100) / 100 : null
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al obtener intervalo',
        error: error.message
      })
    }
  }

  /**
   * Obtener todos los areneros con sus intervalos
   */
  async getAreneros({ response }: HttpContext) {
    try {
      const areneros = await DeviceEnvir.query()
        .where('type', 'arenero')
        .preload('device')
        .preload('code')

      // Obtener configuración de intervalo
      const actuatorSetting = await ActuatorDeviceSetting.query()
        .where('idActuatorSetting', 1) // ID base para intervalos
        .first()

      const intervalo = actuatorSetting?.intervalo || null

      const areData = areneros.map(a => ({
        id: a.id,
        alias: a.alias,
        type: a.type,
        status: a.status,
        intervalo: intervalo,
        intervaloEnHoras: intervalo ? Math.round(intervalo / 60 * 100) / 100 : null,
        dispositivo: {
          id: a.device.id,
          code: a.code?.code || a.identifier, // Usar el código de la relación o el identifier directo
          name: a.device.name
        }
      }))

      return response.ok(areData)
    } catch (error) {
      return response.badRequest({
        message: 'Error al obtener areneros',
        error: error.message
      })
    }
  }

  /**
   * Iniciar limpieza automática (para uso por servicios automatizados)
   */
  async startAutomaticCleaning({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)

      if (deviceEnvir.type !== 'arenero') {
        return response.badRequest({
          message: 'Solo los areneros pueden tener limpieza automática'
        })
      }

      // Cambiar estado a sucio para indicar que necesita limpieza
      deviceEnvir.status = 'sucio'
      await deviceEnvir.save()

      // Emitir eventos WebSocket
      WebSocketService.emitCleaningStarted(deviceEnvir)
      WebSocketService.emitStatusChange(deviceEnvir, 'sucio')

      return response.ok({
        message: `Limpieza automática iniciada para ${deviceEnvir.alias}`,
        device: deviceEnvir
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al iniciar limpieza automática',
        error: error.message
      })
    }
  }

  /**
   * Completar limpieza automática (para uso por servicios automatizados)
   */
  async completeAutomaticCleaning({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)

      if (deviceEnvir.type !== 'arenero') {
        return response.badRequest({
          message: 'Solo los areneros pueden completar limpieza automática'
        })
      }

      // Cambiar estado a abastecido
      deviceEnvir.status = 'abastecido'
      await deviceEnvir.save()

      // Emitir eventos WebSocket
      WebSocketService.emitCleaningCompleted(deviceEnvir)
      WebSocketService.emitStatusChange(deviceEnvir, 'abastecido')

      return response.ok({
        message: `Limpieza automática completada para ${deviceEnvir.alias}`,
        device: deviceEnvir
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al completar limpieza automática',
        error: error.message
      })
    }
  }

  /**
   * Enviar recordatorio de próxima limpieza
   */
  async sendCleaningReminder({ params, request, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const { minutesUntilNext } = request.only(['minutesUntilNext'])

      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)

      if (deviceEnvir.type !== 'arenero') {
        return response.badRequest({
          message: 'Solo los areneros pueden tener recordatorios de limpieza'
        })
      }

      if (!minutesUntilNext || minutesUntilNext <= 0) {
        return response.badRequest({
          message: 'Los minutos hasta la próxima limpieza deben ser un número positivo'
        })
      }

      // Emitir recordatorio por WebSocket
      WebSocketService.emitCleaningReminder(deviceEnvir, minutesUntilNext)

      return response.ok({
        message: `Recordatorio enviado: próxima limpieza en ${minutesUntilNext} minutos`,
        device: deviceEnvir,
        minutesUntilNext
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al enviar recordatorio',
        error: error.message
      })
    }
  }

  /**
   * Configurar cantidad de comida de un sensor de comida
   */
  async setComida({ params, request, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const { comida } = request.only(['comida'])

      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('device', (deviceQuery) => {
          deviceQuery.preload('deviceSensors', (sensorQuery) => {
            sensorQuery.preload('setting')
          })
        })
        .firstOrFail()

      if (deviceEnvir.type !== 'comedero') {
        return response.badRequest({
          message: 'Solo los comederos pueden configurar comida'
        })
      }

      // Buscar sensor de comida (asumiendo que hay uno por device)
      const deviceSensor = deviceEnvir.device.deviceSensors[0]
      
      if (!deviceSensor) {
        return response.badRequest({
          message: 'No se encontró sensor de comida para este comedero'
        })
      }

      // Buscar o crear configuración de comida
      let comidaSetting = deviceSensor.setting
      
      if (!comidaSetting) {
        // Crear nueva configuración
        await DeviceSensorSetting.create({
          idDeviceSensor: deviceSensor.id,
          comida: comida,
        })
        // Actualizar la relación
        await deviceSensor.load('setting')
        comidaSetting = deviceSensor.setting
      } else {
        comidaSetting.comida = comida
        await comidaSetting.save()
      }

      return response.ok({
        message: 'Comida configurada exitosamente',
        deviceEnvirId: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        comida: comida
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al configurar comida',
        error: error.message
      })
    }
  }

  /**
   * Obtener cantidad de comida de un comedero
   */
  async getComida({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('device', (deviceQuery) => {
          deviceQuery.preload('deviceSensors', (sensorQuery) => {
            sensorQuery.preload('setting')
          })
        })
        .firstOrFail()

      if (deviceEnvir.type !== 'comedero') {
        return response.badRequest({
          message: 'Solo los comederos tienen configuración de comida'
        })
      }

      // Buscar sensor de comida
      const deviceSensor = deviceEnvir.device.deviceSensors[0]
      const comida = deviceSensor?.setting?.comida || null

      return response.ok({
        deviceEnvirId: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        comida: comida
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al obtener comida',
        error: error.message
      })
    }
  }

  /**
   * Agregar comida a un comedero
   */
  async addComida({ params, request, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const { cantidad } = request.only(['cantidad'])

      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('device', (deviceQuery) => {
          deviceQuery.preload('deviceSensors', (sensorQuery) => {
            sensorQuery.preload('setting')
          })
        })
        .firstOrFail()

      if (deviceEnvir.type !== 'comedero') {
        return response.badRequest({
          message: 'Solo se puede agregar comida a comederos'
        })
      }

      // Buscar sensor de comida
      const deviceSensor = deviceEnvir.device.deviceSensors[0]
      
      if (!deviceSensor) {
        return response.badRequest({
          message: 'No se encontró sensor de comida para este comedero'
        })
      }

      // Buscar o crear configuración de comida
      let comidaSetting = deviceSensor.setting
      
      if (!comidaSetting) {
        // Crear nueva configuración con la cantidad inicial
        await DeviceSensorSetting.create({
          idDeviceSensor: deviceSensor.id,
          comida: cantidad,
        })
        await deviceSensor.load('setting')
        comidaSetting = deviceSensor.setting
      } else {
        // Agregar cantidad a la existente
        const nuevaCantidad = (comidaSetting.comida || 0) + cantidad
        comidaSetting.comida = nuevaCantidad
        await comidaSetting.save()
      }

      return response.ok({
        message: 'Comida agregada exitosamente',
        deviceEnvirId: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        cantidadAgregada: cantidad,
        comidaTotal: comidaSetting.comida
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al agregar comida',
        error: error.message
      })
    }
  }

  /**
   * Consumir comida (decrementar)
   */
  async consumeComida({ params, request, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const { comida } = request.only(['comida'])

      if (!comida || comida <= 0) {
        return response.badRequest({
          message: 'La cantidad de comida a consumir debe ser un número positivo'
        })
      }

      const deviceEnvir = await DeviceEnvir.query()
        .where('id', deviceEnvirId)
        .preload('device', (deviceQuery) => {
          deviceQuery.preload('deviceSensors', (sensorQuery) => {
            sensorQuery.preload('setting')
          })
        })
        .firstOrFail()

      // Buscar sensor de comida
      const deviceSensor = deviceEnvir.device.deviceSensors[0]
      
      if (!deviceSensor) {
        return response.badRequest({
          message: 'No se encontró sensor de comida para este comedero'
        })
      }

      // Buscar configuración de comida existente
      let comidaSetting = deviceSensor.setting
      const previousAmount = comidaSetting?.comida || 0
      const newAmount = Math.max(0, previousAmount - comida) // No permitir negativos

      if (comidaSetting) {
        comidaSetting.comida = newAmount
        await comidaSetting.save()
      } else {
        // Crear nueva configuración
        await DeviceSensorSetting.create({
          idDeviceSensor: deviceSensor.id,
          comida: newAmount,
        })
        await deviceSensor.load('setting')
        comidaSetting = deviceSensor.setting
      }

      // Emitir evento WebSocket
      WebSocketService.emitFoodUpdate(deviceEnvir, newAmount, previousAmount)

      // Verificar alertas y cambios de estado
      if (newAmount <= 50) {
        WebSocketService.emitLowFoodAlert(deviceEnvir, newAmount)
      }

      if (newAmount === 0 && deviceEnvir.type === 'comedero') {
        deviceEnvir.status = 'sin_comida'
        await deviceEnvir.save()
        WebSocketService.emitStatusChange(deviceEnvir, 'sin_comida')
      }

      return response.ok({
        message: `Se consumieron ${Math.min(comida, previousAmount)}g de comida`,
        device: deviceEnvir,
        previousAmount,
        consumedAmount: Math.min(comida, previousAmount),
        remainingAmount: newAmount
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al consumir comida',
        error: error.message
      })
    }
  }

  /**
   * Emitir evento WebSocket cuando cambia el estado
   */
  private emitStatusChange(deviceEnvirId: number, status: string, deviceEnvir: DeviceEnvir) {
    console.log(`Status changed for device ${deviceEnvirId} to ${status}`)
    
    // Emitir evento WebSocket
    WebSocketService.emitStatusChange(deviceEnvir, status)
    
    // Si es un estado crítico, emitir alerta
    const criticalStates = ['sin_comida', 'sin_agua', 'sin_arena', 'sucio']
    if (criticalStates.includes(status)) {
      WebSocketService.emitCriticalAlert(deviceEnvir, status)
    }
  }
}