import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Device from './device.js'

export default class Sensor extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tipoSensor: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Device, {
    pivotTable: 'device_sensors',
    localKey: 'id',
    pivotForeignKey: 'id_sensor',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_device',
  })
  declare devices: ManyToMany<typeof Device>
}
