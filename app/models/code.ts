import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import DeviceEnvir from './device_envir.js'

export default class Code extends BaseModel {
  static table = 'device_codes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column({ columnName: 'id_device_environment' })
  declare idDeviceEnvironment: number

  @belongsTo(() => DeviceEnvir, {
    foreignKey: 'idDeviceEnvironment',
  })
  declare deviceEnvironment: BelongsTo<typeof DeviceEnvir>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  static async validateCode(code: Code) {
    if (code.code) {
      const codeValidation = Code.validateDeviceCode(code.code)
      if (!codeValidation.isValid) {
        throw new Error(codeValidation.message)
      }
    }
  }

  static validateDeviceCode(code: string): {
    isValid: boolean
    message: string
  } {
    // Verificar longitud (debe ser UUID de 8 caracteres)
    if (code.length !== 8) {
      return {
        isValid: false,
        message: 'El código debe tener exactamente 8 caracteres'
      }
    }

    // Verificar que solo contenga caracteres alfanuméricos
    const codePattern = /^[A-Za-z0-9]{8}$/
    if (!codePattern.test(code)) {
      return {
        isValid: false,
        message: 'El código debe contener solo letras y números (8 caracteres alfanuméricos)'
      }
    }

    return {
      isValid: true,
      message: 'Código válido'
    }
  }

  // Generar un código UUID de 8 caracteres
  static generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generar un identificador único de 12 caracteres para el dispositivo
  static generateUniqueIdentifier(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Validar formato del identificador
  static validateIdentifier(identifier: string): {
    isValid: boolean
    message: string
  } {
    // Verificar longitud
    if (identifier.length !== 12) {
      return {
        isValid: false,
        message: 'El identificador debe tener exactamente 12 caracteres'
      }
    }

    // Verificar que solo contenga caracteres alfanuméricos
    const identifierPattern = /^[A-Za-z0-9]{12}$/
    if (!identifierPattern.test(identifier)) {
      return {
        isValid: false,
        message: 'El identificador debe contener solo letras y números (12 caracteres alfanuméricos)'
      }
    }

    return {
      isValid: true,
      message: 'Identificador válido'
    }
  }
}