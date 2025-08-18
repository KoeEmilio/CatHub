import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_codes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('identifier')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('identifier').nullable().unique()
    })
  }
}