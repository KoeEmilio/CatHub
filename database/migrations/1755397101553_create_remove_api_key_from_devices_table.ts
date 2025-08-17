import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'devices'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('api_key')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('api_key').unique().nullable()
    })
  }
}