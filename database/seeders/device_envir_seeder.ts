import { BaseSeeder } from '@adonisjs/lucid/seeders'
import DeviceEnvir from '../../app/models/device_envir.js'

export default class DeviceEnvirSeeder extends BaseSeeder {
  public async run () {
    await DeviceEnvir.createMany([
      {
        alias: 'Arenero Principal',
        type: 'arenero',
        idDevice: 1,
        idEnvironment: 1,
      },
      {
        alias: 'Bebedero Gatos',
        type: 'bebedero',
        idDevice: 2,
        idEnvironment: 1,
      },
      {
        alias: 'Comedero Cocina',
        type: 'comedero',
        idDevice: 3,
        idEnvironment: 2,
      },
    ])
  }
}
