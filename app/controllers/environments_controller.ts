import { HttpContext } from '@adonisjs/core/http'
import Environment from '../models/environment.js'

export default class EnvironmentsController {
  /**
   * Crear un nuevo entorno
   */
  public async store({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const data = request.only(['name', 'color'])
      
      // Validar datos
      if (!data.name || !data.color) {
        return response.status(400).json({
          status: 'error',
          message: 'Los campos name y color son obligatorios'
        })
      }
      
      // Crear nuevo entorno asociado al usuario autenticado
      const environment = await Environment.create({
        name: data.name,
        color: data.color,
        idUser: user.id
      })
      
      return response.status(201).json({
        status: 'success',
        message: 'Entorno creado correctamente',
        data: environment
      })
    } catch (error) {
      console.error('Error al crear entorno:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al procesar la solicitud',
        error: error.message
      })
    }
  }

  /**
   * Obtener entornos del usuario autenticado
   */
  public async index({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const environments = await Environment.query()
        .where('id_user', user.id)

      return response.ok({
        status: 'success',
        data: environments
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener entornos',
        error: error.message
      })
    }
  }

  /**
   * Obtener un entorno específico
   */
  public async show({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const environment = await Environment.query()
        .where('id', params.id)
        .where('id_user', user.id)
        .first()

      if (!environment) {
        return response.status(404).json({
          status: 'error',
          message: 'Entorno no encontrado'
        })
      }

      return response.ok({
        status: 'success',
        data: environment
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener entorno',
        error: error.message
      })
    }
  }

  /**
   * Actualizar un entorno
   */
  public async update({ params, request, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const environment = await Environment.query()
        .where('id', params.id)
        .where('id_user', user.id)
        .first()

      if (!environment) {
        return response.status(404).json({
          status: 'error',
          message: 'Entorno no encontrado'
        })
      }

      const data = request.only(['name', 'color'])
      environment.merge(data)
      await environment.save()

      return response.ok({
        status: 'success',
        message: 'Entorno actualizado correctamente',
        data: environment
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al actualizar entorno',
        error: error.message
      })
    }
  }

  /**
   * Eliminar un entorno
   */
  public async destroy({ params, auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const environment = await Environment.query()
        .where('id', params.id)
        .where('id_user', user.id)
        .first()

      if (!environment) {
        return response.status(404).json({
          status: 'error',
          message: 'Entorno no encontrado'
        })
      }

      await environment.delete()

      return response.ok({
        status: 'success',
        message: 'Entorno eliminado correctamente'
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al eliminar entorno',
        error: error.message
      })
    }
  }
}
