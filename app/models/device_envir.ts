import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Device from './device.js'
import Environment from './environment.js'
import Code from './code.js'

export default class DeviceEnvir extends BaseModel {
  static table = 'device_environments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare alias: string

  @column()
  declare type: 'arenero' | 'bebedero' | 'comedero'

  @column()
  declare status: 'sin_comida' | 'sin_arena' | 'sin_agua' | 'abastecido' | 'lleno' | 'sucio'

  @column()
  declare identifier: string | null

  @column()
  declare idDevice: number

  @column()
  declare idEnvironment: number

  @belongsTo(() => Device, {
    foreignKey: 'idDevice',
  })
  declare device: BelongsTo<typeof Device>

  @belongsTo(() => Environment, {
    foreignKey: 'idEnvironment',
  })
  declare environment: BelongsTo<typeof Environment>

  @hasOne(() => Code, {
    foreignKey: 'idDeviceEnvironment',
  })
  declare code: HasOne<typeof Code>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
