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
          tipoSensor: 'Sensor Ultrasónico HC-SR04 #1'
        },
        {
          tipoSensor: 'Sensor Ultrasónico HC-SR04 #2'
        },
        {
          tipoSensor: 'Sensor Ultrasónico HC-SR04 #3'
        },
        {
          tipoSensor: 'Sensor Ultrasónico HC-SR04 #4'
        },
        // Sensor de Agua
        {
          tipoSensor: 'Sensor de Nivel de Agua'
        },
        // Drivers/Actuadores
        {
          tipoSensor: 'Driver Bomba de Agua'
        },
        {
          tipoSensor: 'Driver Motor'
        },
        // Sensor Infrarrojo
        {
          tipoSensor: 'Sensor Infrarrojo'
        },
        // Sensor de Humedad y Temperatura (DHT22/DHT11)
        {
          tipoSensor: 'Sensor Humedad y Temperatura DHT22'
        },
        // Sensor de Gas
        {
          tipoSensor: 'Sensor de Gas MQ-2'
        },
        // Sensor de Carga/Peso
        {
          tipoSensor: 'Celda de Carga con HX711'
        }
      ])

      console.log('✅ Sensores específicos para CatHub creados correctamente')
      console.log('📊 Total: 11 sensores y actuadores configurados')
    } else {
      console.log('ℹ️ Sensores ya existen')
    }
  }
}
