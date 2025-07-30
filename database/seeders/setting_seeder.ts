import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Setting from '../../app/models/setting.js'

export default class SettingSeeder extends BaseSeeder {
  async run() {
    // Insertar configuraciones específicas para sensores CatHub
    await Setting.createMany([
      // Configuraciones de Sensores Ultrasónicos
      {
        configKey: 'ultrasonic_trigger_distance',
        configValue: '10.0',
        dataType: 'float'
      },
      {
        configKey: 'ultrasonic_max_distance',
        configValue: '400.0',
        dataType: 'float'
      },
      
      // Configuraciones de Temperatura y Humedad
      {
        configKey: 'temp_threshold_min',
        configValue: '18.0',
        dataType: 'float'
      },
      {
        configKey: 'temp_threshold_max',
        configValue: '28.0',
        dataType: 'float'
      },
      {
        configKey: 'humidity_threshold_min',
        configValue: '40.0',
        dataType: 'float'
      },
      {
        configKey: 'humidity_threshold_max',
        configValue: '70.0',
        dataType: 'float'
      },

      // Configuraciones de Agua
      {
        configKey: 'water_level_min',
        configValue: '20.0',
        dataType: 'float'
      },
      {
        configKey: 'water_level_max',
        configValue: '80.0',
        dataType: 'float'
      },
      {
        configKey: 'pump_duration',
        configValue: '5',
        dataType: 'integer'
      },

      // Configuraciones de Carga/Peso
      {
        configKey: 'weight_calibration_factor',
        configValue: '2280.0',
        dataType: 'float'
      },
      {
        configKey: 'food_empty_threshold',
        configValue: '50.0',
        dataType: 'float'
      },
      {
        configKey: 'food_refill_threshold',
        configValue: '500.0',
        dataType: 'float'
      },

      // Configuraciones de Gas
      {
        configKey: 'gas_threshold',
        configValue: '300',
        dataType: 'integer'
      },
      {
        configKey: 'gas_alert_enabled',
        configValue: 'true',
        dataType: 'boolean'
      },

      // Configuraciones Generales
      {
        configKey: 'reading_interval',
        configValue: '30',
        dataType: 'integer'
      },
      {
        configKey: 'alert_enabled',
        configValue: 'true',
        dataType: 'boolean'
      },
      {
        configKey: 'motor_speed',
        configValue: '150',
        dataType: 'integer'
      },
      {
        configKey: 'ir_detection_threshold',
        configValue: '500',
        dataType: 'integer'
      },
      {
        configKey: 'auto_feed_enabled',
        configValue: 'false',
        dataType: 'boolean'
      },
      {
        configKey: 'feed_schedule',
        configValue: '08:00,14:00,20:00',
        dataType: 'string'
      }
    ])

    console.log('✅ Configuraciones específicas para CatHub creadas correctamente')
    console.log('📊 Total: 20 configuraciones para sensores IoT')
  }
}
