import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ActuatorDevice from './actuator_device.js'

export default class ActuatorDeviceSetting extends BaseModel {
  static table = 'actuator_device_settings'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'id_actuator_device_environment' })
  declare idActuatorDeviceEnvironment: number

  @column()
  declare intervalo: number | null

  @belongsTo(() => ActuatorDevice, {
    foreignKey: 'idActuatorDeviceEnvironment',
  })
  declare actuatorDevice: BelongsTo<typeof ActuatorDevice>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}