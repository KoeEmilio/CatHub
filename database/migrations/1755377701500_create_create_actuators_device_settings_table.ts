import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'actuators_device_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_actuator_setting').unsigned().references('id').inTable('actuators_settings').onDelete('CASCADE').comment('ID de la configuración del actuador')
      table.integer('intervalo').nullable().comment('Intervalo de limpieza en minutos (para areneros)')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}