import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_sensors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('sensor_identifier').nullable().comment('Identificador único del sensor en el dispositivo')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sensor_identifier')
    })
  }
}