import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Device from './device.js'
import Environment from './environment.js'

export default class DeviceEnvir extends BaseModel {
  static table = 'device_envirs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare alias: string

  @column()
  declare type: 'arenero' | 'bebedero' | 'comedero'

  @column()
  declare status: 'sin_comida' | 'sin_arena' | 'sin_agua' | 'abastecido' | 'lleno' | 'sucio'

  @column()
  declare intervalo: number | null

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
