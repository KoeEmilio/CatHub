import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Device from '../../app/models/device.js'

export default class DeviceSeeder extends BaseSeeder {
  async run() {
    // Crear dispositivos de ejemplo
    await Device.createMany([
      {
        name: 'Bebedero increible',
      },
      {
        name: 'comedor grande',
      },
      {
        name: 'arenero espacioso',
      },
    ])

    console.log('✅ Dispositivos creados correctamente')
  }
}
