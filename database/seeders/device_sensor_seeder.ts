import { BaseSeeder } from '@adonisjs/lucid/seeders'
import DeviceSensor from '../../app/models/device_sensor.js'

export default class DeviceSensorSeeder extends BaseSeeder {
  async run() {
    // Asignar sensores específicos a dispositivos
    await DeviceSensor.createMany([
      // Monitor Sala Principal (Device ID: 1) - Monitoreo general
      { idDevice: 1, idSensor: 1 }, // sen_ultra_01 - Ultrasónico #1
      { idDevice: 1, idSensor: 8 }, // sen_ir - Infrarrojo
      { idDevice: 1, idSensor: 9 }, // sen_hum_temp - Humedad y Temperatura
      { idDevice: 1, idSensor: 10 }, // sen_gas - Sensor de Gas

      // Sensor Comedor (Device ID: 2) - Estación de alimentación
      { idDevice: 2, idSensor: 2 }, // sen_ultra_02 - Ultrasónico #2
      { idDevice: 2, idSensor: 5 }, // sen_agua - Sensor de Agua
      { idDevice: 2, idSensor: 6 }, // drv_bomba_agua - Driver Bomba de Agua
      { idDevice: 2, idSensor: 11 }, // sen_carga - Celda de Carga
      { idDevice: 2, idSensor: 7 }, // drv_motor - Driver Motor

      // Control Dormitorio (Device ID: 3) - Monitoreo nocturno
      { idDevice: 3, idSensor: 3 }, // sen_ultra_03 - Ultrasónico #3
      { idDevice: 3, idSensor: 8 }, // sen_ir - Infrarrojo
      { idDevice: 3, idSensor: 9 }, // sen_hum_temp - Humedad y Temperatura

      // Monitor Jardín (Device ID: 4) - Monitoreo exterior
      { idDevice: 4, idSensor: 4 }, // sen_ultra_04 - Ultrasónico #4
      { idDevice: 4, idSensor: 9 }, // sen_hum_temp - Humedad y Temperatura
      { idDevice: 4, idSensor: 10 }, // sen_gas - Sensor de Gas
      { idDevice: 4, idSensor: 8 }, // sen_ir - Infrarrojo

      // Estación Baño (Device ID: 5) - Sistema de agua y limpieza
      { idDevice: 5, idSensor: 5 }, // sen_agua - Sensor de Agua
      { idDevice: 5, idSensor: 6 }, // drv_bomba_agua - Driver Bomba de Agua
      { idDevice: 5, idSensor: 9 }, // sen_hum_temp - Humedad y Temperatura
      { idDevice: 5, idSensor: 10 } // sen_gas - Sensor de Gas
    ])

    console.log('✅ Sensores específicos asignados a dispositivos correctamente')
    console.log('📋 Configuración completa para sistema CatHub IoT')
  }
}
