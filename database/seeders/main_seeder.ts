import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserSeeder from './user_seeder.js'
import EnvironmentSeeder from './environment_seeder.js'
import SensorSeeder from './sensor_seeder.js'
import SettingSeeder from './setting_seeder.js'
import DeviceSeeder from './device_seeder.js'
import DeviceSettingSeeder from './device_setting_seeder.js'
import DeviceSensorSeeder from './device_sensor_seeder.js'
import DeviceEnvirSeeder from './device_envir_seeder.js'

export default class MainSeeder extends BaseSeeder {
  private async runSeeder(seeder: typeof BaseSeeder, name: string) {
    console.log(`🌱 Ejecutando ${name}...`)
    await new seeder(this.client).run()
  }

  async run() {
    console.log('🚀 Iniciando seeders de CatHub...\n')

    // Ejecutar seeders en orden correcto (respetando dependencias)
    await this.runSeeder(UserSeeder, 'UserSeeder')
    await this.runSeeder(EnvironmentSeeder, 'EnvironmentSeeder')
    await this.runSeeder(SensorSeeder, 'SensorSeeder')
    await this.runSeeder(SettingSeeder, 'SettingSeeder')
    await this.runSeeder(DeviceSeeder, 'DeviceSeeder')

  await this.runSeeder(DeviceSettingSeeder, 'DeviceSettingSeeder')
  await this.runSeeder(DeviceSensorSeeder, 'DeviceSensorSeeder')
  await this.runSeeder(DeviceEnvirSeeder, 'DeviceEnvirSeeder')

    console.log('\n✅ Todos los seeders ejecutados correctamente!')
    console.log('📊 Base de datos poblada con datos de ejemplo')
  }
}
