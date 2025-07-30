import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Environment from '../../app/models/environment.js'

export default class EnvironmentSeeder extends BaseSeeder {
  async run() {
    // Crear ambientes de ejemplo
    await Environment.createMany([
      {
        name: 'Sala Principal',
        color: '#4F46E5',
        idUser: 1 // Asumiendo que existe un usuario con ID 1
      },
      {
        name: 'Dormitorio',
        color: '#7C3AED',
        idUser: 1
      },
      {
        name: 'Jardín',
        color: '#059669',
        idUser: 1
      },
      {
        name: 'Cocina',
        color: '#DC2626',
        idUser: 1
      },
      {
        name: 'Baño',
        color: '#0891B2',
        idUser: 1
      }
    ])

    console.log('✅ Ambientes creados correctamente')
  }
}
