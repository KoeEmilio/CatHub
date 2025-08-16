import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_sensors_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_device_sensor').unsigned().references('id').inTable('device_sensors').onDelete('CASCADE').comment('ID de la relación device-sensor')
      table.decimal('comida', 8, 2).nullable().comment('Cantidad de comida en gramos')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}