import { BaseSeeder } from '@adonisjs/lucid/seeders'
import DeviceSensor from '../../app/models/device_sensor.js'

export default class DeviceSensorSeeder extends BaseSeeder {
  async run() {
    // Asignar sensores específicos a dispositivos con sus identificadores
    await DeviceSensor.createMany([
      // Arenero increible (Device ID: 1) - Monitoreo del arenero
      { idDevice: 1, idSensor: 1, sensorIdentifier: 'sen_ultra_01' }, // Ultrasónico #1
      { idDevice: 1, idSensor: 8, sensorIdentifier: 'sen_ir' }, // Infrarrojo
      { idDevice: 1, idSensor: 9, sensorIdentifier: 'sen_hum_temp' }, // Humedad y Temperatura
      { idDevice: 1, idSensor: 10, sensorIdentifier: 'sen_gas' }, // Sensor de Gas

      // Comedor grande (Device ID: 2) - Estación de alimentación
      { idDevice: 2, idSensor: 2, sensorIdentifier: 'sen_ultra_02' }, // Ultrasónico #2
      { idDevice: 2, idSensor: 5, sensorIdentifier: 'sen_agua' }, // Sensor de Agua
      { idDevice: 2, idSensor: 6, sensorIdentifier: 'drv_bomba_agua' }, // Driver Bomba de Agua
      { idDevice: 2, idSensor: 11, sensorIdentifier: 'sen_carga' }, // Celda de Carga
      { idDevice: 2, idSensor: 7, sensorIdentifier: 'drv_motor' }, // Driver Motor

      // Arenero espacioso (Device ID: 3) - Arenero adicional
      { idDevice: 3, idSensor: 3, sensorIdentifier: 'sen_ultra_03' }, // Ultrasónico #3
      { idDevice: 3, idSensor: 8, sensorIdentifier: 'sen_ir_2' }, // Infrarrojo (diferente instancia)
      { idDevice: 3, idSensor: 9, sensorIdentifier: 'sen_hum_temp_2' }, // Humedad y Temperatura (diferente instancia)
      { idDevice: 3, idSensor: 10, sensorIdentifier: 'sen_gas_2' }, // Sensor de Gas (diferente instancia)
    ])

    console.log('✅ Sensores específicos asignados a 3 dispositivos correctamente')
    console.log('📋 Configuración completa para sistema CatHub IoT')
  }
}
