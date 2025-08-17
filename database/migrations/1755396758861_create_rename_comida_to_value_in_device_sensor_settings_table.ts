import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_sensor_settings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('comida', 'value')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('value', 'comida')
    })
  }
}