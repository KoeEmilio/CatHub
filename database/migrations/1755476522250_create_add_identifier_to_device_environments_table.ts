import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_environments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('identifier').nullable().unique().comment('Identificador único del device environment')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('identifier')
    })
  }
}