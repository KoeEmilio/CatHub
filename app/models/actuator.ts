import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ActuatorSetting from './actuator_setting.js'

export default class Actuator extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @hasMany(() => ActuatorSetting, {
    foreignKey: 'idActuator',
  })
  declare actuatorSettings: HasMany<typeof ActuatorSetting>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}