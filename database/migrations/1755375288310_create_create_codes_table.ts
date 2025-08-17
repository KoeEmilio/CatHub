import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_codes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code', 8).unique().notNullable().comment('Código único del dispositivo de 8 caracteres alfanuméricos')
      table.integer('id_device').unsigned().references('id').inTable('device_environments').onDelete('CASCADE').comment('ID del dispositivo asociado')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}