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
    
    try {
      await mongoose.connect(mongoUrl)
      console.log('Connected to MongoDB')
    } catch (error) {
      console.error('MongoDB connection error:', error)
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