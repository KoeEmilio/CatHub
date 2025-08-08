import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '../../app/models/user.js'
import hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
  async run() {
    // Crear usuario de ejemplo
    await User.create({
      fullName: 'Admin CatHub',
      email: 'admin@cathub.com',
      password: await hash.make('password123')
    })

    console.log('✅ Usuario administrador creado correctamente')
  }
}
  