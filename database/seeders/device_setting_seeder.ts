import { BaseSeeder } from '@adonisjs/lucid/seeders'
import DeviceSetting from '../../app/models/device_setting.js'

export default class DeviceSettingSeeder extends BaseSeeder {
  async run() {
    // Asignar configuraciones específicas a dispositivos
    await DeviceSetting.createMany([
      // Monitor Sala Principal (Device ID: 1) - Monitoreo general
      { idDevice: 1, idSettings: 1 }, // ultrasonic_trigger_distance
      { idDevice: 1, idSettings: 2 }, // ultrasonic_max_distance
      { idDevice: 1, idSettings: 3 }, // temp_threshold_min
      { idDevice: 1, idSettings: 4 }, // temp_threshold_max
      { idDevice: 1, idSettings: 5 }, // humidity_threshold_min
      { idDevice: 1, idSettings: 6 }, // humidity_threshold_max
      { idDevice: 1, idSettings: 13 }, // gas_threshold
      { idDevice: 1, idSettings: 14 }, // gas_alert_enabled
      { idDevice: 1, idSettings: 15 }, // reading_interval
      { idDevice: 1, idSettings: 16 }, // alert_enabled
      { idDevice: 1, idSettings: 18 }, // ir_detection_threshold

      // Sensor Comedor (Device ID: 2) - Estación de alimentación
      { idDevice: 2, idSettings: 1 }, // ultrasonic_trigger_distance
      { idDevice: 2, idSettings: 7 }, // water_level_min
      { idDevice: 2, idSettings: 8 }, // water_level_max
      { idDevice: 2, idSettings: 9 }, // pump_duration
      { idDevice: 2, idSettings: 10 }, // weight_calibration_factor
      { idDevice: 2, idSettings: 11 }, // food_empty_threshold
      { idDevice: 2, idSettings: 12 }, // food_refill_threshold
      { idDevice: 2, idSettings: 15 }, // reading_interval
      { idDevice: 2, idSettings: 17 }, // motor_speed
      { idDevice: 2, idSettings: 19 }, // auto_feed_enabled
      { idDevice: 2, idSettings: 20 }, // feed_schedule

      // Control Dormitorio (Device ID: 3) - Monitoreo nocturno
      { idDevice: 3, idSettings: 1 }, // ultrasonic_trigger_distance
      { idDevice: 3, idSettings: 2 }, // ultrasonic_max_distance
      { idDevice: 3, idSettings: 3 }, // temp_threshold_min
      { idDevice: 3, idSettings: 4 }, // temp_threshold_max
      { idDevice: 3, idSettings: 5 }, // humidity_threshold_min
      { idDevice: 3, idSettings: 6 }, // humidity_threshold_max
      { idDevice: 3, idSettings: 15 }, // reading_interval
      { idDevice: 3, idSettings: 18 }, // ir_detection_threshold

      // Monitor Jardín (Device ID: 4) - Monitoreo exterior
      { idDevice: 4, idSettings: 1 }, // ultrasonic_trigger_distance
      { idDevice: 4, idSettings: 3 }, // temp_threshold_min
      { idDevice: 4, idSettings: 4 }, // temp_threshold_max
      { idDevice: 4, idSettings: 5 }, // humidity_threshold_min
      { idDevice: 4, idSettings: 6 }, // humidity_threshold_max
      { idDevice: 4, idSettings: 13 }, // gas_threshold
      { idDevice: 4, idSettings: 14 }, // gas_alert_enabled
      { idDevice: 4, idSettings: 15 }, // reading_interval
      { idDevice: 4, idSettings: 18 }, // ir_detection_threshold

      // Estación Baño (Device ID: 5) - Sistema de agua y limpieza
      { idDevice: 5, idSettings: 7 }, // water_level_min
      { idDevice: 5, idSettings: 8 }, // water_level_max
      { idDevice: 5, idSettings: 9 }, // pump_duration
      { idDevice: 5, idSettings: 3 }, // temp_threshold_min
      { idDevice: 5, idSettings: 4 }, // temp_threshold_max
      { idDevice: 5, idSettings: 5 }, // humidity_threshold_min
      { idDevice: 5, idSettings: 6 }, // humidity_threshold_max
      { idDevice: 5, idSettings: 13 }, // gas_threshold
      { idDevice: 5, idSettings: 15 } // reading_interval
    ])

    console.log('✅ Configuraciones específicas asignadas a dispositivos correctamente')
    console.log('📋 Configuración completa para sensores CatHub IoT')
  }
}
