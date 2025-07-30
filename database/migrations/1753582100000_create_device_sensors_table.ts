import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'device_sensors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('id_device').unsigned().references('id').inTable('devices').onDelete('CASCADE')
      table.integer('id_sensor').unsigned().references('id').inTable('sensors').onDelete('CASCADE')
      
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      // Índice único para evitar duplicados
      table.unique(['id_device', 'id_sensor'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
