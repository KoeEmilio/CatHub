import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'actuator_device_environment'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_actuator').unsigned().references('id').inTable('actuators').onDelete('CASCADE').comment('ID del actuador')
      table.integer('id_device').unsigned().references('id').inTable('device_environments').onDelete('CASCADE').comment('ID del dispositivo')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}