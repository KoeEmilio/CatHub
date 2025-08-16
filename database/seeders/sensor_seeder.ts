import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Sensor from '../../app/models/sensor.js'

export default class SensorSeeder extends BaseSeeder {
  async run() {
    // Verificar si ya existen sensores para evitar duplicados
    const existingSensors = await Sensor.query().limit(1)
    
    if (existingSensors.length === 0) {
      // Insertar sensores específicos para CatHub
      await Sensor.createMany([
        // Sensores Ultrasónicos (4 unidades)
        {
          tipoSensor: 'Sensor Ultrasónico HC-SR04 #1',
          nomenclatura: 'sen_ultra_01'
        },
        {
          tipoSensor: 'Sensor Ultrasónico HC-SR04 #2',
          nomenclatura: 'sen_ultra_02'
        },
        {
          tipoSensor: 'Sensor Ultrasónico HC-SR04 #3',
          nomenclatura: 'sen_ultra_03'
        },
        {
          tipoSensor: 'Sensor Ultrasónico HC-SR04 #4',
          nomenclatura: 'sen_ultra_04'
        },
        // Sensor de Agua
        {
          tipoSensor: 'Sensor de Nivel de Agua',
          nomenclatura: 'sen_agua'
        },
        // Drivers/Actuadores
        {
          tipoSensor: 'Driver Bomba de Agua',
          nomenclatura: 'drv_bomba_agua'
        },
        {
          tipoSensor: 'Driver Motor',
          nomenclatura: 'drv_motor'
        },
        // Sensor Infrarrojo
        {
          tipoSensor: 'Sensor Infrarrojo',
          nomenclatura: 'sen_ir'
        },
        // Sensor de Humedad y Temperatura (DHT22/DHT11)
        {
          tipoSensor: 'Sensor Humedad y Temperatura DHT22',
          nomenclatura: 'sen_hum_temp'
        },
        // Sensor de Gas
        {
          tipoSensor: 'Sensor de Gas MQ-2',
          nomenclatura: 'sen_gas'
        },
        // Sensor de Carga/Peso
        {
          tipoSensor: 'Celda de Carga con HX711',
          nomenclatura: 'sen_carga'
        }
      ])

      console.log('✅ Sensores específicos para CatHub creados correctamente')
      console.log('📊 Total: 11 sensores y actuadores configurados')
    } else {
      console.log('ℹ️ Sensores ya existen')
    }
  }
}
