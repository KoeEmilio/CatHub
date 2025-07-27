import type Device from '../app/models/device.js'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    device?: Device
  }
}
