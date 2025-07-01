import type { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'

export default class UsersController {
  public async store({ request, response }: HttpContext) {
    try {
      const { name, email, password } = request.only(['name', 'email', 'password'])
      const user = await User.create({ name, email, password, isActive: true })
      return response.created(user)
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }
}
