import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_envirs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Actualizar la columna status para usar un enum con los nuevos valores
      table.string('status').defaultTo('abastecido').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revertir a string simple
      table.string('status').alter()
    })
  }
}