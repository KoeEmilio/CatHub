import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '../../app/models/user.js'
import hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
  async run() {
    // Verificar si ya existe el usuario para evitar duplicados
    const existingUser = await User.query().where('email', 'admin@cathub.com').first()
    
    if (!existingUser) {
      await User.create({
        fullName: 'Admin CatHub',
        email: 'admin@cathub.com',
        password: await hash.make('password123')
      })
      console.log('✅ Usuario administrador creado correctamente')
    } else {
      console.log('ℹ️ Usuario administrador ya existe')
    }
  }
}
  