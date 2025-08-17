import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Actuator from './actuator.js'
import DeviceEnvir from './device_envir.js'
import ActuatorDeviceSetting from './actuator_device_setting.js'

export default class ActuatorSetting extends BaseModel {
  static table = 'actuators_device'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare idActuator: number

  @column()
  declare idDevice: number

  @belongsTo(() => Actuator, {
    foreignKey: 'idActuator',
  })
  declare actuator: BelongsTo<typeof Actuator>

  @belongsTo(() => DeviceEnvir, {
    foreignKey: 'idDevice',
  })
  declare device: BelongsTo<typeof DeviceEnvir>

  @hasMany(() => ActuatorDeviceSetting, {
    foreignKey: 'idActuatorSetting',
  })
  declare actuatorDeviceSettings: HasMany<typeof ActuatorDeviceSetting>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}