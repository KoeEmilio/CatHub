import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Device from './device.js'
import Sensor from './sensor.js'
import DeviceSensorSetting from './device_sensor_setting.js'

export default class DeviceSensor extends BaseModel {
  public static table = 'device_sensors'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare idDevice: number

  @column()
  declare idSensor: number

  @column({ columnName: 'sensor_identifier' })
  declare sensorIdentifier: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Device, {
    foreignKey: 'idDevice',
  })
  declare device: BelongsTo<typeof Device>

  @belongsTo(() => Sensor, {
    foreignKey: 'idSensor',
  })
  declare sensor: BelongsTo<typeof Sensor>

  @hasOne(() => DeviceSensorSetting, {
    foreignKey: 'idDeviceSensor',
  })
  declare setting: HasOne<typeof DeviceSensorSetting>
}
