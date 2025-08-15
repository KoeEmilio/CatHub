import type { HttpContext } from '@adonisjs/core/http'
import DeviceEnvir from '#models/device_envir'
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

      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)

      // Verificar que sea un arenero
      if (deviceEnvir.type !== 'arenero') {
        return response.badRequest({
          message: 'Solo los areneros pueden tener intervalos de limpieza configurados'
        })
      }

      deviceEnvir.intervalo = intervalo
      await deviceEnvir.save()

      // Emitir evento WebSocket de cambio de intervalo
      WebSocketService.emitIntervalChange(deviceEnvir, intervalo)

      return response.ok({
        message: `Intervalo de limpieza configurado a ${intervalo} minutos`,
        device: deviceEnvir
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
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)

      if (deviceEnvir.type !== 'arenero') {
        return response.badRequest({
          message: 'Solo los areneros tienen intervalos de limpieza'
        })
      }

      return response.ok({
        deviceEnvirId: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        intervalo: deviceEnvir.intervalo,
        intervaloEnHoras: deviceEnvir.intervalo ? Math.round(deviceEnvir.intervalo / 60 * 100) / 100 : null
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
        .preload('environment')

      const arenesosConIntervalo = areneros.map(arenero => ({
        id: arenero.id,
        alias: arenero.alias,
        status: arenero.status,
        intervalo: arenero.intervalo,
        intervaloEnHoras: arenero.intervalo ? Math.round(arenero.intervalo / 60 * 100) / 100 : null,
        device: arenero.device,
        environment: arenero.environment
      }))

      return response.ok({
        message: 'Areneros obtenidos',
        areneros: arenesosConIntervalo
      })
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
   * Configurar cantidad de comida en gramos
   */
  async setComida({ params, request, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const { comida } = request.only(['comida'])

      if (comida === undefined || comida < 0) {
        return response.badRequest({
          message: 'La cantidad de comida debe ser un número positivo o cero'
        })
      }

      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)

      const previousAmount = deviceEnvir.comida
      deviceEnvir.comida = comida
      await deviceEnvir.save()

      // Emitir evento WebSocket de actualización de comida
      WebSocketService.emitFoodUpdate(deviceEnvir, comida, previousAmount)

      // Verificar si necesita alerta de comida baja
      if (comida <= 50) {
        WebSocketService.emitLowFoodAlert(deviceEnvir, comida)
      }

      // Si no hay comida, cambiar estado automáticamente
      if (comida === 0 && deviceEnvir.type === 'comedero') {
        deviceEnvir.status = 'sin_comida'
        await deviceEnvir.save()
        WebSocketService.emitStatusChange(deviceEnvir, 'sin_comida')
      }

      return response.ok({
        message: `Cantidad de comida configurada a ${comida} gramos`,
        device: deviceEnvir,
        previousAmount,
        difference: previousAmount ? comida - previousAmount : comida
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al configurar comida',
        error: error.message
      })
    }
  }

  /**
   * Obtener cantidad de comida de un dispositivo
   */
  async getComida({ params, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)

      return response.ok({
        deviceEnvirId: deviceEnvir.id,
        alias: deviceEnvir.alias,
        type: deviceEnvir.type,
        comida: deviceEnvir.comida,
        status: deviceEnvir.status,
        lastUpdate: deviceEnvir.updatedAt
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al obtener cantidad de comida',
        error: error.message
      })
    }
  }

  /**
   * Agregar comida (incrementar)
   */
  async addComida({ params, request, response }: HttpContext) {
    try {
      const deviceEnvirId = params.id
      const { comida } = request.only(['comida'])

      if (!comida || comida <= 0) {
        return response.badRequest({
          message: 'La cantidad de comida a agregar debe ser un número positivo'
        })
      }

      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)
      const previousAmount = deviceEnvir.comida || 0
      const newAmount = previousAmount + comida

      deviceEnvir.comida = newAmount
      await deviceEnvir.save()

      // Emitir evento WebSocket
      WebSocketService.emitFoodUpdate(deviceEnvir, newAmount, previousAmount)

      // Si se agrega comida y estaba sin comida, cambiar estado
      if (previousAmount === 0 && deviceEnvir.type === 'comedero' && deviceEnvir.status === 'sin_comida') {
        deviceEnvir.status = 'abastecido'
        await deviceEnvir.save()
        WebSocketService.emitStatusChange(deviceEnvir, 'abastecido')
      }

      return response.ok({
        message: `Se agregaron ${comida}g de comida`,
        device: deviceEnvir,
        previousAmount,
        addedAmount: comida,
        newTotal: newAmount
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

      const deviceEnvir = await DeviceEnvir.findOrFail(deviceEnvirId)
      const previousAmount = deviceEnvir.comida || 0
      const newAmount = Math.max(0, previousAmount - comida) // No permitir negativos

      deviceEnvir.comida = newAmount
      await deviceEnvir.save()

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