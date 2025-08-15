import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_envirs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Agregar columna comida para registrar gramos
      table.decimal('comida', 8, 2).nullable().comment('Cantidad de comida en gramos')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('comida')
    })
  }
}