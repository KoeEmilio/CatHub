import { BaseSeeder } from '@adonisjs/lucid/seeders'
import DeviceEnvir from '../../app/models/device_envir.js'

export default class DeviceEnvirSeeder extends BaseSeeder {
  public async run () {
    // Verificar si ya existen device_envirs para evitar duplicados
    const existingDeviceEnvirs = await DeviceEnvir.query().limit(1)
    
    if (existingDeviceEnvirs.length === 0) {
      // Crear relaciones para los 3 devices existentes
      const deviceEnvirs = [
        {
          alias: 'Bebedero Increíble',
          type: 'bebedero' as const,
          status: 'abastecido' as const,
          idDevice: 1, // Bebedero increible
          idEnvironment: 1, // Sala
        },
        {
          alias: 'Comedor Grande',
          type: 'comedero' as const,
          status: 'abastecido' as const,
          idDevice: 2, // comedor grande
          idEnvironment: 1, // Sala
        },
        {
          alias: 'Arenero Espacioso',
          type: 'arenero' as const,
          status: 'abastecido' as const,
          idDevice: 3, // arenero espacioso
          idEnvironment: 2, // Cuarto de estudio
        },
      ]

      await DeviceEnvir.createMany(deviceEnvirs)
      
      console.log('✅ Device environments creados para 3 dispositivos correctamente')
    } else {
      console.log('ℹ️ Device environments ya existen')
    }
  }
}
