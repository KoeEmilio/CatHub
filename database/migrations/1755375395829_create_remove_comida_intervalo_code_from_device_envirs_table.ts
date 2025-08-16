import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_envirs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('comida')
      table.dropColumn('intervalo')
      table.dropColumn('code')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('comida', 8, 2).nullable().comment('Cantidad de comida en gramos')
      table.integer('intervalo').nullable().comment('Intervalo de limpieza en minutos (solo para areneros)')
      table.string('code', 6).unique().nullable()
    })
  }
}