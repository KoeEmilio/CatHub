import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Environment from './environment.js'
import DeviceEnvir from './device_envir.js'
import DeviceSetting from './device_setting.js'
import Sensor from './sensor.js'

export default class Device extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare apiKey: string  // Token único para cada dispositivo

  @belongsTo(() => Environment, {
    foreignKey: 'idEnvironment',
  })
  declare environment: BelongsTo<typeof Environment>

  @hasMany(() => DeviceEnvir, {
    foreignKey: 'idDevice',
  })
  declare deviceEnvirs: HasMany<typeof DeviceEnvir>

  @hasMany(() => DeviceSetting, {
    foreignKey: 'idDevice',
  })
  declare deviceSettings: HasMany<typeof DeviceSetting>

  @manyToMany(() => Sensor, {
    pivotTable: 'device_sensors',
    localKey: 'id',
    pivotForeignKey: 'id_device',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_sensor',
  })
  declare sensors: ManyToMany<typeof Sensor>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
