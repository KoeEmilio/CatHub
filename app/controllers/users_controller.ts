import type { HttpContext } from '@adonisjs/core/http'
import { UserMongo } from '../models/user.js'

export default class UsersController {
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nombre', 'email', 'password'])
      const user = await UserMongo.create(data)
      return response.created(user)
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }
}
