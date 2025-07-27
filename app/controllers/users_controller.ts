import type { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'
import Environment from '../models/environment.js'

export default class UsersController {
  /**
   * Crear un nuevo usuario
   */
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['fullName', 'email', 'password'])
      
      // Validar que el email no esté en uso
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        return response.status(400).json({
          status: 'error',
          message: 'El email ya está en uso'
        })
      }
      
      const user = await User.create(data)
      return response.status(201).json({
        status: 'success',
        message: 'Usuario creado correctamente',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email
        }
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al crear usuario',
        error: error.message
      })
    }
  }

  /**
   * Obtener información del usuario autenticado con sus entornos
   */
  public async me({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      // Cargar entornos del usuario
      const environments = await Environment.query().where('id_user', user.id)

      return response.ok({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName
          },
          environments
        }
      })
    } catch (error) {
      return response.internalServerError({ 
        status: 'error',
        message: 'Error al obtener información del usuario',
        error: error.message 
      })
    }
  }

  /**
   * Actualizar usuario
   */
  public async update({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const data = request.only(['fullName', 'email'])
      
      // Si se está actualizando el email, verificar que no esté en uso
      if (data.email && data.email !== user.email) {
        const existingUser = await User.findBy('email', data.email)
        if (existingUser) {
          return response.status(400).json({
            status: 'error',
            message: 'El email ya está en uso'
          })
        }
      }

      user.merge(data)
      await user.save()

      return response.ok({
        status: 'success',
        message: 'Usuario actualizado correctamente',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email
        }
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al actualizar usuario',
        error: error.message
      })
    }
  }

  /**
   * Eliminar usuario
   */
  public async destroy({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      await user.delete()

      return response.ok({
        status: 'success',
        message: 'Usuario eliminado correctamente'
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al eliminar usuario',
        error: error.message
      })
    }
  }
}
