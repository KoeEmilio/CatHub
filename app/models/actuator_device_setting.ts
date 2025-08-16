import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ActuatorSetting from './actuator_setting.js'

export default class ActuatorDeviceSetting extends BaseModel {
  static table = 'actuators_device_settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare idActuatorSetting: number

  @column()
  declare intervalo: number | null

  @belongsTo(() => ActuatorSetting, {
    foreignKey: 'idActuatorSetting',
  })
  declare actuatorSetting: BelongsTo<typeof ActuatorSetting>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}