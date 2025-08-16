import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Device from './device.js'

export default class Code extends BaseModel {
  static table = 'codes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare idDevice: number

  @belongsTo(() => Device, {
    foreignKey: 'idDevice',
  })
  declare device: BelongsTo<typeof Device>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Validar el formato del código antes de guardar
  @beforeSave()
  static async validateCode(code: Code) {
    if (code.code) {
      const codeValidation = Code.validateDeviceCode(code.code)
      if (!codeValidation.isValid) {
        throw new Error(codeValidation.message)
      }
    }
  }

  // Función estática para validar códigos de dispositivo
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
}