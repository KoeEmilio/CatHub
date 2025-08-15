import { BaseSeeder } from '@adonisjs/lucid/seeders'
import DeviceEnvir from '../../app/models/device_envir.js'

export default class DeviceEnvirSeeder extends BaseSeeder {
  public async run () {
    await DeviceEnvir.createMany([
      {
        alias: 'Arenero Principal',
        type: 'arenero',
        status: 'activo',
        idDevice: 1, // Arenero increible
        idEnvironment: 1,
      },
      {
        alias: 'Bebedero Gatos',
        type: 'bebedero',
        status: 'activo',
        idDevice: 2, // Comedor grande
        idEnvironment: 1,
      },
      {
        alias: 'Arenero Secundario',
        type: 'arenero',
        status: 'activo',
        idDevice: 3, // Arenero espacioso
        idEnvironment: 2,
      },
    ])
    
    console.log('✅ Device environments creados para 3 dispositivos correctamente')
  }
}
