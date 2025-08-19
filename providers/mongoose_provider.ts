import type { ApplicationService } from '@adonisjs/core/types'
import mongoose from 'mongoose'
import env from '#start/env'

export default class MongooseProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    // No necesitamos registrar mongoose en el contenedor para este caso
  }

  /**
   * The container bindings have booted
   */
  async boot() {
    // Boot logic if needed
  }

  /**
   * The application has been booted
   */
  async start() {
    const mongoUrl = env.get('MONGO_URL', 'mongodb://localhost:27017/adonis')
    
    console.log('🔗 MongoDB URL:', mongoUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')) // Hide credentials
    
    try {
      await mongoose.connect(mongoUrl, {
        // Timeouts más largos para replica set
        serverSelectionTimeoutMS: 60000, // 60 segundos para encontrar el primary
        socketTimeoutMS: 60000, // 60 segundos para operaciones individuales
        connectTimeoutMS: 60000, // 60 segundos para establecer conexión
        
        // Pool settings optimizados para replica set
        maxPoolSize: 10, // Máximo 10 conexiones en el pool
        minPoolSize: 2, // Mínimo 2 conexiones
        maxIdleTimeMS: 30000, // Cerrar conexiones inactivas después de 30s
        
        // Retry settings específicos para replica set
        retryWrites: true,
        retryReads: true,
        
        // Configuración de replica set
        readPreference: 'secondaryPreferred', // Leer de secundarios preferiblemente
        readConcern: { level: 'majority' },
        
        // Heartbeat
        heartbeatFrequencyMS: 10000, // 10 segundos
        
        // Buffer settings
        bufferCommands: false, // No hacer buffer de comandos si no hay conexión
      })
      
      console.log('✅ Connected to MongoDB Replica Set successfully')
      console.log(`📊 Connection state: ${mongoose.connection.readyState}`)
      
      // Manejar eventos de conexión
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error)
      })
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected')
      })
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected')
      })
      
      mongoose.connection.on('connected', () => {
        console.log('🔌 MongoDB connected')
      })
      
      mongoose.connection.on('connecting', () => {
        console.log('🔄 MongoDB connecting...')
      })
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      })
      throw error
    }
  }

  /**
   * The process has been started
   */
  async ready() {
    // Ready logic if needed
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    await mongoose.connection.close()
    console.log('MongoDB connection closed')
  }
}