import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Device from './device.js'
import DeviceEnvir from './device_envir.js'

export default class Environment extends BaseModel {
  static table = 'environments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare color: string

  @column()
  declare idUser: number

  @belongsTo(() => User, {
    foreignKey: 'idUser',
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Device, {
    foreignKey: 'idEnvironment',
  })
  declare devices: HasMany<typeof Device>

  @hasMany(() => DeviceEnvir, {
    foreignKey: 'idEnvironment',
  })
  declare deviceEnvirs: HasMany<typeof DeviceEnvir>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
