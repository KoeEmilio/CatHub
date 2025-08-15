import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Device from './device.js'
import Environment from './environment.js'

export default class DeviceEnvir extends BaseModel {
  static table = 'device_envirs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare alias: string

  @column()
  declare code: string

  @column()
  declare type: 'arenero' | 'bebedero' | 'comedero'

  @column()
  declare status: 'sin_comida' | 'sin_arena' | 'sin_agua' | 'abastecido' | 'lleno' | 'sucio'

  @column()
  declare intervalo: number | null

  @column()
  declare comida: number | null

  @column()
  declare idDevice: number

  @column()
  declare idEnvironment: number

  @belongsTo(() => Device, {
    foreignKey: 'idDevice',
  })
  declare device: BelongsTo<typeof Device>

  @belongsTo(() => Environment, {
    foreignKey: 'idEnvironment',
  })
  declare environment: BelongsTo<typeof Environment>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Validar el formato del código antes de guardar
  @beforeSave()
  static async validateCode(deviceEnvir: DeviceEnvir) {
    if (deviceEnvir.code) {
      const codeValidation = DeviceEnvir.validateDeviceCode(deviceEnvir.code, deviceEnvir.type)
      if (!codeValidation.isValid) {
        throw new Error(codeValidation.message)
      }
    }
  }

  // Función estática para validar códigos de dispositivo
  static validateDeviceCode(code: string, type: 'arenero' | 'bebedero' | 'comedero'): {
    isValid: boolean
    message: string
  } {
    // Verificar longitud total (2 letras + 4 números = 6 caracteres)
    if (code.length !== 6) {
      return {
        isValid: false,
        message: 'El código debe tener exactamente 6 caracteres (2 letras + 4 números)'
      }
    }

    // Verificar formato general
    const codePattern = /^[A-Z]{2}\d{4}$/
    if (!codePattern.test(code)) {
      return {
        isValid: false,
        message: 'El código debe tener el formato: 2 letras mayúsculas seguidas de 4 números (ej: AR1234)'
      }
    }

    // Verificar prefijo según el tipo
    const prefix = code.substring(0, 2)
    const expectedPrefixes = {
      'arenero': 'AR',
      'bebedero': 'BE',
      'comedero': 'CO'
    }

    if (prefix !== expectedPrefixes[type]) {
      return {
        isValid: false,
        message: `Para dispositivos tipo "${type}" el código debe iniciar con "${expectedPrefixes[type]}" (ej: ${expectedPrefixes[type]}1234)`
      }
    }

    return {
      isValid: true,
      message: 'Código válido'
    }
  }
}
