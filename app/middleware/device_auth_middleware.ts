import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Device from '../models/device.js'

export default class DeviceAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const apiKey = ctx.request.header('X-Device-API-Key') || ctx.request.header('Authorization')?.replace('Bearer ', '')

    if (!apiKey) {
      return ctx.response.unauthorized({
        status: 'error',
        message: 'API Key del dispositivo requerida'
      })
    }

    try {
      const device = await Device.query()
        .where('api_key', apiKey)
        .preload('environment')
        .first()

      if (!device) {
        return ctx.response.unauthorized({
          status: 'error',
          message: 'API Key del dispositivo inválida'
        })
      }

      // Agregar el dispositivo al contexto para uso en controladores
      ctx.device = device
      
      await next()
    } catch (error) {
      return ctx.response.internalServerError({
        status: 'error',
        message: 'Error de autenticación del dispositivo'
      })
    }
  }
}
