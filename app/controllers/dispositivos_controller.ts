import { HttpContext } from '@adonisjs/core/http'
import { Dispositivo } from '../models/dispositivo.js'

export default class DispositivosController {
  /**
   * Agrega un nuevo dispositivo
   */
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['deviceId', 'entornoId', 'type'])
      
      if (!['arenero', 'bebedero', 'comedero'].includes(data.type)) {
        return response.status(400).json({
          status: 'error',
          message: 'El tipo de dispositivo debe ser arenero, bebedero o comedero'
        })
      }
      
      const dispositivoExistente = await Dispositivo.findOne({ deviceId: data.deviceId })
      if (dispositivoExistente) {
        return response.status(400).json({
          status: 'error',
          message: 'Ya existe un dispositivo con este ID'
        })
      }
      
      const dispositivo = new Dispositivo(data)
      await dispositivo.save()
      
      return response.status(201).json({
        status: 'success',
        message: 'Dispositivo agregado correctamente',
        data: dispositivo
      })
    } catch (error) {
      console.error('Error al agregar dispositivo:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Error al procesar la solicitud',
        error: error.message
      })
    }
  }
}