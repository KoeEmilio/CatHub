import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Environment from './environment.js'
import DeviceEnvir from './device_envir.js'
import DeviceSetting from './device_setting.js'

export default class Device extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare apiKey: string  // Token único para cada dispositivo

  @column()
  declare idEnvironment: number

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
