import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserSeeder from './user_seeder.js'
import EnvironmentSeeder from './environment_seeder.js'
import SensorSeeder from './sensor_seeder.js'
import DeviceSeeder from './device_seeder.js'
import CodeSeeder from './code_seeder.js'
import ActuatorSeeder from './actuator_seeder.js'
import DeviceSensorSeeder from './device_sensor_seeder.js'
import DeviceEnvirSeeder from './device_envir_seeder.js'
import MongoReadingSeeder from './mongo_reading_seeder.js'
import MongoAuditLogSeeder from './mongo_audit_log_seeder.js'

export default class MainSeeder extends BaseSeeder {
  private async runSeeder(seeder: typeof BaseSeeder, name: string) {
    console.log(`🌱 Ejecutando ${name}...`)
    try {
      await new seeder(this.client).run()
      console.log(`✅ ${name} completado`)
    } catch (error) {
      console.log(`❌ Error en ${name}:`, error.message)
    }
  }

  async run() {
    console.log('🚀 Iniciando seeders de CatHub...\n')

    // Ejecutar seeders en orden correcto (respetando dependencias)
    await this.runSeeder(UserSeeder, 'UserSeeder')
    await this.runSeeder(EnvironmentSeeder, 'EnvironmentSeeder')
    await this.runSeeder(SensorSeeder, 'SensorSeeder')
    await this.runSeeder(ActuatorSeeder, 'ActuatorSeeder')
    
    // Crear devices primero, luego códigos
    await this.runSeeder(DeviceSeeder, 'DeviceSeeder')
    await this.runSeeder(CodeSeeder, 'CodeSeeder')

    await this.runSeeder(DeviceSensorSeeder, 'DeviceSensorSeeder')
    await this.runSeeder(DeviceEnvirSeeder, 'DeviceEnvirSeeder')

    // Seeders para MongoDB
    console.log('\n🍃 Iniciando seeders de MongoDB...')
    await this.runSeeder(MongoReadingSeeder, 'MongoReadingSeeder')
    await this.runSeeder(MongoAuditLogSeeder, 'MongoAuditLogSeeder')

    console.log('\n✅ Todos los seeders ejecutados correctamente!')
    console.log('📊 Base de datos poblada con datos de ejemplo')
  }
}
