import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'devices'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('code')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('code').nullable()
    })
  }
}