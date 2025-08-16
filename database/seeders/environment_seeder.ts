import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Environment from '../../app/models/environment.js'
import User from '../../app/models/user.js'

export default class EnvironmentSeeder extends BaseSeeder {
  async run() {
    // Verificar que existe al menos un usuario
    const user = await User.query().first()
    
    if (!user) {
      console.log('❌ No se puede crear environments: no existe ningún usuario')
      return
    }

    // Verificar si ya existen environments para evitar duplicados
    const existingEnvironments = await Environment.query().where('id_user', user.id).limit(1)
    
    if (existingEnvironments.length === 0) {
      // Crear ambientes de ejemplo
      await Environment.createMany([
        {
          name: 'Sala Principal',
          color: '#4F46E5',
          idUser: user.id
        },
        {
          name: 'Dormitorio',
          color: '#7C3AED',
          idUser: user.id
        },
        {
          name: 'Jardín',
          color: '#059669',
          idUser: user.id
        },
        {
          name: 'Cocina',
          color: '#DC2626',
          idUser: user.id
        },
        {
          name: 'Baño',
          color: '#0891B2',
          idUser: user.id
        }
      ])

      console.log('✅ Ambientes creados correctamente')
    } else {
      console.log('ℹ️ Ambientes ya existen')
    }
  }
}
