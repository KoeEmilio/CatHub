import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import type DeviceEnvir from '#models/device_envir'

class WebSocketService {
  private io: SocketIOServer | null = null
  private static instance: WebSocketService

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  initialize(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*", // En producción, especifica los dominios permitidos
        methods: ["GET", "POST"]
      }
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      console.log('🟢 Cliente conectado:', socket.id)

      // Manejar solicitud de datos iniciales
      socket.on('request_initial_data', async (data) => {
        console.log('📊 Cliente solicita datos iniciales:', data)
        await this.sendInitialData(socket, data)
      })

      // Manejar suscripción a dispositivo específico
      socket.on('subscribe_device', (deviceId) => {
        console.log(`📡 Cliente se suscribe al dispositivo: ${deviceId}`)
        socket.join(`device_${deviceId}`)
      })

      // Manejar desuscripción de dispositivo
      socket.on('unsubscribe_device', (deviceId) => {
        console.log(`📡 Cliente se desuscribe del dispositivo: ${deviceId}`)
        socket.leave(`device_${deviceId}`)
      })

      // Manejar acciones del comedero en tiempo real
      socket.on('start_dispense_food', (data) => {
        console.log('🍽️ Iniciando dispensar comida:', data)
        this.emitDeviceAction('start_dispense_food', data)
      })

      socket.on('stop_dispense_food', (data) => {
        console.log('🛑 Deteniendo dispensar comida:', data)
        this.emitDeviceAction('stop_dispense_food', data)
      })

      // Manejar mensaje de prueba
      socket.on('test_message', (data) => {
        console.log('🧪 Mensaje de prueba recibido:', data)
        socket.emit('test_response', { message: 'Conexión WebSocket funcionando correctamente', timestamp: new Date().toISOString() })
      })

      socket.on('disconnect', (reason) => {
        console.log('🔴 Cliente desconectado:', socket.id, 'Razón:', reason)
      })
    })
  }

  // Enviar datos iniciales cuando un cliente se conecta
  private async sendInitialData(socket: any, requestData: any) {
    try {
      // Aquí puedes llamar directamente a MongoDB para obtener datos recientes
      const Reading = (await import('../models/readings.js')).default

      const { deviceIds, limit = 10 } = requestData

      let query: any = {}
      if (deviceIds && Array.isArray(deviceIds)) {
        query.deviceId = { $in: deviceIds.map((id: any) => id.toString()) }
      }

      // Obtener últimas lecturas por dispositivo
      const recentReadings = await Reading.aggregate([
        { $match: query },
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: '$deviceId',
            readings: { $push: '$$ROOT' },
            lastReading: { $first: '$$ROOT' }
          }
        },
        {
          $project: {
            deviceId: '$_id',
            readings: { $slice: ['$readings', limit] },
            lastReading: 1,
            _id: 0
          }
        }
      ])

      // Enviar datos iniciales al cliente específico
      socket.emit('initial_data', {
        type: 'sensor_readings',
        data: recentReadings,
        timestamp: new Date().toISOString(),
        message: 'Datos iniciales enviados'
      })

      console.log(`📊 Datos iniciales enviados a cliente: ${socket.id}`)
    } catch (error) {
      console.error('❌ Error enviando datos iniciales:', error)
      socket.emit('error', {
        type: 'initial_data_error',
        message: 'Error al obtener datos iniciales',
        timestamp: new Date().toISOString()
      })
    }
  }

  // Emitir cambio de estado a todos los clientes conectados
  emitStatusChange(deviceEnvir: DeviceEnvir, newStatus: string) {
    if (!this.io) {
      console.warn('WebSocket no inicializado')
      return
    }

    const eventData = {
      deviceEnvirId: deviceEnvir.id,
      environmentId: deviceEnvir.idEnvironment,
      deviceId: deviceEnvir.idDevice,
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      status: newStatus,
      timestamp: new Date().toISOString()
    }

    // Emitir a todos los clientes conectados
    this.io.emit('device_status_changed', eventData)

    console.log(`Estado emitido: dispositivo ${deviceEnvir.alias} cambió a ${newStatus}`)
  }

  // Emitir alerta crítica
  emitCriticalAlert(deviceEnvir: DeviceEnvir, status: string) {
    if (!this.io) return

    const alertData = {
      deviceEnvirId: deviceEnvir.id,
      environmentId: deviceEnvir.idEnvironment,
      deviceId: deviceEnvir.idDevice,
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      status: status,
      severity: this.getAlertSeverity(status),
      message: this.getAlertMessage(deviceEnvir.type, status),
      timestamp: new Date().toISOString()
    }

    // Emitir alerta crítica a todos los clientes
    this.io.emit('critical_alert', alertData)

    console.log(`Alerta crítica emitida: ${alertData.message}`)
  }

  // Obtener la severidad de la alerta según el estado
  private getAlertSeverity(status: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (status) {
      case 'sin_comida':
      case 'sin_agua':
        return 'critical'
      case 'sin_arena':
      case 'sucio':
        return 'high'
      case 'abastecido':
        return 'low'
      case 'lleno':
        return 'medium'
      default:
        return 'medium'
    }
  }

  // Generar mensaje de alerta según el tipo de dispositivo y estado
  private getAlertMessage(type: string, status: string): string {
    const deviceName = type === 'comedero' ? 'comedero' : 
                      type === 'bebedero' ? 'bebedero' : 'arenero'

    switch (status) {
      case 'sin_comida':
        return `¡Atención! El ${deviceName} está sin comida`
      case 'sin_agua':
        return `¡Atención! El ${deviceName} está sin agua`
      case 'sin_arena':
        return `¡Atención! El ${deviceName} está sin arena`
      case 'sucio':
        return `¡Atención! El ${deviceName} está sucio y necesita limpieza`
      case 'abastecido':
        return `El ${deviceName} ha sido abastecido correctamente`
      case 'lleno':
        return `El ${deviceName} está lleno`
      default:
        return `Estado del ${deviceName} actualizado a ${status}`
    }
  }

  // Emitir datos de sensores en tiempo real
  emitSensorData(deviceId: number, sensorData: any) {
    if (!this.io) return

    const eventData = {
      deviceId,
      sensorData,
      timestamp: new Date().toISOString()
    }

    this.io.emit('sensor_data', eventData)
  }

  // Emitir cambio de intervalo de arenero
  emitIntervalChange(deviceEnvir: DeviceEnvir, newInterval: number) {
    if (!this.io) {
      console.warn('WebSocket no inicializado')
      return
    }

    const eventData = {
      deviceEnvirId: deviceEnvir.id,
      environmentId: deviceEnvir.idEnvironment,
      deviceId: deviceEnvir.idDevice,
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      intervalo: newInterval,
      intervaloEnHoras: Math.round(newInterval / 60 * 100) / 100,
      timestamp: new Date().toISOString()
    }

    // Emitir a todos los clientes conectados
    this.io.emit('interval_changed', eventData)

    console.log(`Intervalo cambiado: arenero ${deviceEnvir.alias} configurado a ${newInterval} minutos`)
  }

  // Emitir evento de limpieza automática iniciada
  emitCleaningStarted(deviceEnvir: DeviceEnvir) {
    if (!this.io) return

    const eventData = {
      deviceEnvirId: deviceEnvir.id,
      environmentId: deviceEnvir.idEnvironment,
      deviceId: deviceEnvir.idDevice,
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      message: `Limpieza automática iniciada para ${deviceEnvir.alias}`,
      timestamp: new Date().toISOString()
    }

    this.io.emit('cleaning_started', eventData)
    console.log(`Limpieza automática iniciada: ${deviceEnvir.alias}`)
  }

  // Emitir evento de limpieza automática completada
  emitCleaningCompleted(deviceEnvir: DeviceEnvir) {
    if (!this.io) return

    const eventData = {
      deviceEnvirId: deviceEnvir.id,
      environmentId: deviceEnvir.idEnvironment,
      deviceId: deviceEnvir.idDevice,
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      message: `Limpieza automática completada para ${deviceEnvir.alias}`,
      timestamp: new Date().toISOString()
    }

    this.io.emit('cleaning_completed', eventData)
    console.log(`Limpieza automática completada: ${deviceEnvir.alias}`)
  }

  // Emitir recordatorio de próxima limpieza
  emitCleaningReminder(deviceEnvir: DeviceEnvir, minutesUntilNext: number) {
    if (!this.io) return

    const eventData = {
      deviceEnvirId: deviceEnvir.id,
      environmentId: deviceEnvir.idEnvironment,
      deviceId: deviceEnvir.idDevice,
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      minutesUntilNext,
      hoursUntilNext: Math.round(minutesUntilNext / 60 * 100) / 100,
      message: `Próxima limpieza de ${deviceEnvir.alias} en ${minutesUntilNext} minutos`,
      timestamp: new Date().toISOString()
    }

    this.io.emit('cleaning_reminder', eventData)
    console.log(`Recordatorio de limpieza: ${deviceEnvir.alias} en ${minutesUntilNext} minutos`)
  }

  // Emitir evento de actualización de comida
  emitFoodUpdate(deviceEnvir: DeviceEnvir, newAmount: number, previousAmount: number | null) {
    if (!this.io) {
      console.warn('WebSocket no inicializado')
      return
    }

    const eventData = {
      deviceEnvirId: deviceEnvir.id,
      environmentId: deviceEnvir.idEnvironment,
      deviceId: deviceEnvir.idDevice,
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      comidaGramos: newAmount,
      comidaAnterior: previousAmount,
      diferencia: previousAmount ? newAmount - previousAmount : newAmount,
      mensaje: this.getFoodUpdateMessage(deviceEnvir.alias, newAmount, previousAmount),
      timestamp: new Date().toISOString()
    }

    // Emitir a todos los clientes conectados
    this.io.emit('food_updated', eventData)

    console.log(`Comida actualizada: ${deviceEnvir.alias} ahora tiene ${newAmount}g`)
  }

  // Emitir alerta de comida baja
  emitLowFoodAlert(deviceEnvir: DeviceEnvir, currentAmount: number, threshold: number = 50) {
    if (!this.io) return

    const alertData = {
      deviceEnvirId: deviceEnvir.id,
      environmentId: deviceEnvir.idEnvironment,
      deviceId: deviceEnvir.idDevice,
      alias: deviceEnvir.alias,
      type: deviceEnvir.type,
      comidaActual: currentAmount,
      umbral: threshold,
      severity: currentAmount <= 0 ? 'critical' : currentAmount <= 20 ? 'high' : 'medium',
      message: this.getLowFoodMessage(deviceEnvir.alias, currentAmount),
      timestamp: new Date().toISOString()
    }

    this.io.emit('low_food_alert', alertData)
    console.log(`Alerta de comida baja: ${deviceEnvir.alias} tiene ${currentAmount}g`)
  }

  // Generar mensaje de actualización de comida
  private getFoodUpdateMessage(alias: string, newAmount: number, previousAmount: number | null): string {
    if (previousAmount === null) {
      return `${alias}: comida configurada a ${newAmount}g`
    }
    
    const difference = newAmount - previousAmount
    if (difference > 0) {
      return `${alias}: se agregaron ${difference}g de comida (total: ${newAmount}g)`
    } else if (difference < 0) {
      return `${alias}: se consumieron ${Math.abs(difference)}g de comida (quedan: ${newAmount}g)`
    } else {
      return `${alias}: cantidad de comida actualizada (${newAmount}g)`
    }
  }

  // Generar mensaje de comida baja
  private getLowFoodMessage(alias: string, currentAmount: number): string {
    if (currentAmount <= 0) {
      return `¡CRÍTICO! ${alias} está completamente sin comida`
    } else if (currentAmount <= 20) {
      return `¡ALERTA! ${alias} tiene muy poca comida (${currentAmount}g)`
    } else {
      return `AVISO: ${alias} tiene poca comida (${currentAmount}g)`
    }
  }

  // Obtener número de clientes conectados
  getConnectedClients(): number {
    return this.io ? this.io.engine.clientsCount : 0
  }

  // Emitir cambios generales en la base de datos
  emitDatabaseChange(changeData: any) {
    if (!this.io) {
      console.warn('WebSocket no inicializado')
      return
    }

    console.log('📡 Emitiendo cambio en BD:', changeData.type)
    
    this.io.emit('database_change', {
      timestamp: new Date().toISOString(),
      ...changeData
    })
  }

  // Emitir nueva lectura de sensor
  emitNewSensorReading(readingData: any) {
    if (!this.io) {
      console.warn('WebSocket no inicializado')
      return
    }

    console.log('📊 Emitiendo nueva lectura de sensor:', readingData.sensorType)
    
    // Emitir a todos los clientes
    this.io.emit('new_sensor_reading', {
      timestamp: new Date().toISOString(),
      ...readingData
    })

    // Emitir a canal específico del dispositivo (solo clientes suscritos)
    this.io.to(`device_${readingData.deviceId}`).emit('device_reading', {
      timestamp: new Date().toISOString(),
      ...readingData
    })

    // También mantener compatibilidad con el evento anterior
    this.io.emit(`device_${readingData.deviceId}_reading`, {
      timestamp: new Date().toISOString(),
      ...readingData
    })
  }

  // Emitir nuevo dispositivo
  emitNewDevice(deviceData: any) {
    if (!this.io) {
      console.warn('WebSocket no inicializado')
      return
    }

    console.log('🆕 Emitiendo nuevo dispositivo:', deviceData.name)
    
    this.io.emit('new_device', {
      timestamp: new Date().toISOString(),
      ...deviceData
    })
  }

  // Emitir acción de dispositivo a script Python
  emitDeviceAction(action: string, data: any) {
    if (!this.io) {
      console.warn('WebSocket no inicializado')
      return
    }

    const actionData = {
      action: action,
      deviceEnvirId: data.deviceEnvirId,
      deviceId: data.deviceId,
      type: data.type, // 'comedero', 'bebedero', etc.
      timestamp: new Date().toISOString(),
      ...data
    }

    // Emitir acción a todos los clientes (incluido script Python)
    this.io.emit('device_action', actionData)

    console.log(`🎬 Acción de dispositivo emitida: ${action}`, actionData)
  }

  // Emitir nueva lectura de sensor en tiempo real
  emitNewReading(readingData: any) {
    if (!this.io) {
      console.warn('WebSocket no inicializado')
      return
    }

    const realtimeData = {
      type: 'new_reading',
      sensorName: readingData.sensorName,
      identifier: readingData.identifier,
      value: readingData.value,
      deviceId: readingData.deviceId,
      deviceEnvirId: readingData.deviceEnvirId,
      timestamp: readingData.timestamp || new Date().toISOString()
    }

    // Emitir nueva lectura a todos los clientes conectados
    this.io.emit('realtime_reading', realtimeData)

    console.log(`📊 Nueva lectura emitida en tiempo real: ${readingData.sensorName} = ${readingData.value}`)
  }
}

export default WebSocketService.getInstance()
