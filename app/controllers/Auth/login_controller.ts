import { HttpContext } from '@adonisjs/core/http'
import User from '../../models/user.js'

export default class LoginController {
  /**
   * Maneja el proceso de login y genera un token de acceso
   */
  public async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    
    // Validar que se proporcionen ambos campos
    if (!email || !password) {
      return response.status(400).json({
        status: 'error',
        message: 'Email y contraseña son requeridos'
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return response.status(400).json({
        status: 'error',
        message: 'El formato del email no es válido'
      })
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return response.status(400).json({
        status: 'error',
        message: 'La contraseña debe tener al menos 6 caracteres'
      })
    }
    
    try {
      // Convertir email a minúsculas para la búsqueda
      const user = await User.verifyCredentials(email.toLowerCase(), password)
      
      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '6 hours',
      })
      
      return response.ok({
        status: 'success',
        message: 'Login exitoso',
        data: {
          token: token.value!.release(),
          type: 'bearer',
          expiresAt: token.expiresAt,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName
          }
        }
      })
    } catch (error) {
      console.error('Error durante el login:', error)
      
      return response.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      })
    }
  }

  /**
   * Cierra la sesión invalidando el token
   */
  public async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
      
      return response.ok({
        status: 'success',
        message: 'Sesión cerrada correctamente'
      })
    } catch (error) {
      console.error('Error durante el logout:', error)
      
      return response.badRequest({
        status: 'error',
        message: 'Error al cerrar sesión',
        error: error.message
      })
    }
  }


  public async me({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      
      return response.ok({
        status: 'success',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        }
      })
    } catch (error) {
      console.error('Error al obtener información del usuario:', error)
      
      return response.unauthorized({
        status: 'error',
        message: 'No autorizado',
        error: error.message
      })
    }
  }
}