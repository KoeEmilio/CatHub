import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_codes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('id_device', 'id_device_environment')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('id_device_environment', 'id_device')
    })
  }
}