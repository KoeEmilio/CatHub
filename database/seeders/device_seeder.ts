import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Device from '../../app/models/device.js'

export default class DeviceSeeder extends BaseSeeder {
  async run() {
    // Crear dispositivos de ejemplo
    await Device.createMany([
      {
        name: 'Bebedero increible',
        apiKey: '550e8400-e29b-41d4-a716-446655440001',
        code: 'BE0001',
         // Asumiendo que existe un environment con ID 1
      },
      {
        name: 'comedor grande',
        apiKey: '550e8400-e29b-41d4-a716-446655440002',
        code: 'CO0001',

      },
      {
        name: 'arenero espacioso',
        apiKey: '550e8400-e29b-41d4-a716-446655440003',
        code: 'AR0001',
         // Asumiendo que existe un environment con ID 2
      },

    ])

    console.log('✅ Dispositivos creados correctamente')
  }
}
