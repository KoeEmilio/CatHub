import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import DeviceSensor from './device_sensor.js'

export default class DeviceSensorSetting extends BaseModel {
  static table = 'device_sensors_settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare idDeviceSensor: number

  @column()
  declare comida: number | null

  @belongsTo(() => DeviceSensor, {
    foreignKey: 'idDeviceSensor',
  })
  declare deviceSensor: BelongsTo<typeof DeviceSensor>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}