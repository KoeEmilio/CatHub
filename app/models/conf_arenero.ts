import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ConfArenero extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tipoLimpieza: 'Completa' | 'Normal'

  @column()
  declare dispositivoId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
