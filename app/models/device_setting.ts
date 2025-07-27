import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Device from './device.js'
import Setting from './setting.js'

export default class DeviceSetting extends BaseModel {
  static table = 'device_settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare idDevice: number

  @column()
  declare idSettings: number

  @belongsTo(() => Device, {
    foreignKey: 'idDevice',
  })
  declare device: BelongsTo<typeof Device>

  @belongsTo(() => Setting, {
    foreignKey: 'idSettings',
  })
  declare setting: BelongsTo<typeof Setting>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
