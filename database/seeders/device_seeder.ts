import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Device from '../../app/models/device.js'

export default class DeviceSeeder extends BaseSeeder {
  async run() {
    // Crear dispositivos de ejemplo
    await Device.createMany([
      {
        name: 'Monitor Sala Principal',
        apiKey: '550e8400-e29b-41d4-a716-446655440001',
        idEnvironment: 1 // Asumiendo que existe un environment con ID 1
      },
      {
        name: 'Sensor Comedor',
        apiKey: '550e8400-e29b-41d4-a716-446655440002',
        idEnvironment: 1
      },
      {
        name: 'Control Dormitorio',
        apiKey: '550e8400-e29b-41d4-a716-446655440003',
        idEnvironment: 2 // Asumiendo que existe un environment con ID 2
      },
      {
        name: 'Monitor Jardín',
        apiKey: '550e8400-e29b-41d4-a716-446655440004',
        idEnvironment: 2
      },
      {
        name: 'Estación Baño',
        apiKey: '550e8400-e29b-41d4-a716-446655440005',
        idEnvironment: 3 // Asumiendo que existe un environment con ID 3
      }
    ])

    console.log('✅ Dispositivos creados correctamente')
  }
}
