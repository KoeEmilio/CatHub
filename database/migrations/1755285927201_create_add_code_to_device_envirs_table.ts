import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_envirs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('code', 6).unique().nullable() // Empezar como nullable para migrar datos existentes
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('code')
    })
  }
}