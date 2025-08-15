import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Device from '../../app/models/device.js'

export default class DeviceSeeder extends BaseSeeder {
  async run() {
    // Crear dispositivos de ejemplo
    await Device.createMany([
      {
        name: 'Monitor Sala Principal',
        apiKey: '550e8400-e29b-41d4-a716-446655440001',
         // Asumiendo que existe un environment con ID 1
      },
      {
        name: 'Sensor Comedor',
        apiKey: '550e8400-e29b-41d4-a716-446655440002',
        
      },
      {
        name: 'Control Dormitorio',
        apiKey: '550e8400-e29b-41d4-a716-446655440003',
         // Asumiendo que existe un environment con ID 2
      },
      {
        name: 'Monitor Jardín',
        apiKey: '550e8400-e29b-41d4-a716-446655440004',
        
      },
      {
        name: 'Estación Baño',
        apiKey: '550e8400-e29b-41d4-a716-446655440005',
         // Asumiendo que existe un environment con ID 3
      }
    ])

    console.log('✅ Dispositivos creados correctamente')
  }
}
