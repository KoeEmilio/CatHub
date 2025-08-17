import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sensors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nomenclatura')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nomenclatura').nullable()
    })
  }
}