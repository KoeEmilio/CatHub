import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_envirs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Agregar columna intervalo para areneros (en minutos)
      table.integer('intervalo').nullable().comment('Intervalo de limpieza en minutos (solo para areneros)')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('intervalo')
    })
  }
}