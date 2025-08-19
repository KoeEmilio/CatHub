import { ChangeStream, ChangeStreamDocument } from 'mongodb'
import webSocketServiceInstance from './websocket_service.js'
import mongoose from 'mongoose'

class MongoChangeStreamService {
  private static instance: MongoChangeStreamService
  private changeStreams: Map<string, ChangeStream> = new Map()
  private webSocketService: any

  static getInstance(): MongoChangeStreamService {
    if (!MongoChangeStreamService.instance) {
      MongoChangeStreamService.instance = new MongoChangeStreamService()
    }
    return MongoChangeStreamService.instance
  }

  constructor() {
    this.webSocketService = webSocketServiceInstance
  }

  /**
   * Inicializar el servicio de change streams
   */
  async initialize() {
    try {
      console.log('🔄 Inicializando MongoDB Change Streams...')
      
      // Esperar a que mongoose esté conectado
      if (mongoose.connection.readyState !== 1) {
        await new Promise((resolve) => {
          mongoose.connection.once('connected', resolve)
        })
      }

      // Configurar change streams para las colecciones importantes
      await this.setupReadingsChangeStream()
      await this.setupDeviceEnvironmentsChangeStream()
      await this.setupDevicesChangeStream()
      
      console.log('✅ MongoDB Change Streams inicializados correctamente')
    } catch (error) {
      console.error('❌ Error al inicializar MongoDB Change Streams:', error)
    }
  }

  /**
   * Configurar change stream para la colección readings (lecturas de sensores)
   */
  private async setupReadingsChangeStream() {
    try {
      const db = mongoose.connection.db
      if (!db) throw new Error('No hay conexión a MongoDB')

      const readingsCollection = db.collection('readings')
      
      // Configurar pipeline para filtrar solo inserciones
      const pipeline = [
        {
          $match: {
            operationType: { $in: ['insert'] }
          }
        }
      ]

      const changeStream = readingsCollection.watch(pipeline, {
        fullDocument: 'updateLookup'
      })

      changeStream.on('change', (change: ChangeStreamDocument) => {
        console.log('📊 Nueva lectura detectada:', change.operationType)
        this.handleReadingChange(change)
      })

      changeStream.on('error', (error) => {
        console.error('❌ Error en readings change stream:', error)
      })

      this.changeStreams.set('readings', changeStream)
      console.log('✅ Change stream para readings configurado')
    } catch (error) {
      console.error('❌ Error configurando readings change stream:', error)
    }
  }

  /**
   * Configurar change stream para device_environments (cambios de estado)
   */
  private async setupDeviceEnvironmentsChangeStream() {
    try {
      const db = mongoose.connection.db
      if (!db) throw new Error('No hay conexión a MongoDB')

      const deviceEnvirsCollection = db.collection('device_environments')
      
      const pipeline = [
        {
          $match: {
            operationType: { $in: ['update', 'replace'] },
            'updateDescription.updatedFields.status': { $exists: true }
          }
        }
      ]

      const changeStream = deviceEnvirsCollection.watch(pipeline, {
        fullDocument: 'updateLookup'
      })

      changeStream.on('change', (change: ChangeStreamDocument) => {
        console.log('🔄 Cambio de estado detectado:', change.operationType)
        this.handleDeviceEnvironmentChange(change)
      })

      changeStream.on('error', (error) => {
        console.error('❌ Error en device_environments change stream:', error)
      })

      this.changeStreams.set('device_environments', changeStream)
      console.log('✅ Change stream para device_environments configurado')
    } catch (error) {
      console.error('❌ Error configurando device_environments change stream:', error)
    }
  }

  /**
   * Configurar change stream para devices (nuevos dispositivos)
   */
  private async setupDevicesChangeStream() {
    try {
      const db = mongoose.connection.db
      if (!db) throw new Error('No hay conexión a MongoDB')

      const devicesCollection = db.collection('devices')
      
      const pipeline = [
        {
          $match: {
            operationType: { $in: ['insert'] }
          }
        }
      ]

      const changeStream = devicesCollection.watch(pipeline, {
        fullDocument: 'updateLookup'
      })

      changeStream.on('change', (change: ChangeStreamDocument) => {
        console.log('🆕 Nuevo dispositivo detectado:', change.operationType)
        this.handleDeviceChange(change)
      })

      changeStream.on('error', (error) => {
        console.error('❌ Error en devices change stream:', error)
      })

      this.changeStreams.set('devices', changeStream)
      console.log('✅ Change stream para devices configurado')
    } catch (error) {
      console.error('❌ Error configurando devices change stream:', error)
    }
  }

  /**
   * Manejar cambios en readings
   */
  private handleReadingChange(change: ChangeStreamDocument) {
    try {
      if (change.operationType === 'insert' && change.fullDocument) {
        const reading = change.fullDocument
        
        // Emitir por WebSocket
        this.webSocketService.emitDatabaseChange({
          type: 'reading_inserted',
          collection: 'readings',
          data: {
            id: reading._id,
            deviceId: reading.deviceId,
            sensorType: reading.sensorName,
            sensorName: reading.sensorName,
            value: reading.value,
            timestamp: reading.timestamp,
            identifier: reading.identifier
          }
        })

        // También emitir evento específico de nueva lectura
        this.webSocketService.emitNewSensorReading({
          deviceId: reading.deviceId,
          sensorType: reading.sensorName,
          sensorName: reading.sensorName,
          value: reading.value,
          identifier: reading.identifier,
          timestamp: reading.timestamp
        })
      }
    } catch (error) {
      console.error('❌ Error manejando cambio en readings:', error)
    }
  }

  /**
   * Manejar cambios en device_environments
   */
  private handleDeviceEnvironmentChange(change: ChangeStreamDocument) {
    try {
      if ((change.operationType === 'update' || change.operationType === 'replace') && change.fullDocument) {
        const deviceEnvir = change.fullDocument
        
        // Emitir por WebSocket
        this.webSocketService.emitDatabaseChange({
          type: 'device_environment_updated',
          collection: 'device_environments',
          data: {
            id: deviceEnvir._id,
            deviceId: deviceEnvir.id_device,
            environmentId: deviceEnvir.id_environment,
            status: deviceEnvir.status,
            alias: deviceEnvir.alias,
            type: deviceEnvir.type,
            updatedFields: (change as any).updateDescription?.updatedFields || {}
          }
        })

        // Si cambió el status, emitir evento específico
        if ((change as any).updateDescription?.updatedFields?.status) {
          this.webSocketService.emitStatusChange(deviceEnvir as any, deviceEnvir.status)
        }
      }
    } catch (error) {
      console.error('❌ Error manejando cambio en device_environments:', error)
    }
  }

  /**
   * Manejar cambios en devices
   */
  private handleDeviceChange(change: ChangeStreamDocument) {
    try {
      if (change.operationType === 'insert' && change.fullDocument) {
        const device = change.fullDocument
        
        // Emitir por WebSocket
        this.webSocketService.emitDatabaseChange({
          type: 'device_inserted',
          collection: 'devices',
          data: {
            id: device._id,
            name: device.name,
            createdAt: device.created_at
          }
        })

        // Emitir evento específico de nuevo dispositivo
        this.webSocketService.emitNewDevice({
          id: device._id,
          name: device.name,
          createdAt: device.created_at
        })
      }
    } catch (error) {
      console.error('❌ Error manejando cambio en devices:', error)
    }
  }

  /**
   * Cerrar todos los change streams
   */
  async close() {
    console.log('🔄 Cerrando MongoDB Change Streams...')
    
    for (const [name, stream] of this.changeStreams) {
      try {
        await stream.close()
        console.log(`✅ Change stream ${name} cerrado`)
      } catch (error) {
        console.error(`❌ Error cerrando change stream ${name}:`, error)
      }
    }
    
    this.changeStreams.clear()
    console.log('✅ Todos los change streams cerrados')
  }

  /**
   * Reiniciar change streams
   */
  async restart() {
    await this.close()
    await this.initialize()
  }
}

export default MongoChangeStreamService
