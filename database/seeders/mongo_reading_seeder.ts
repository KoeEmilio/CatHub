import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { Reading } from '../../app/models/readings.js'
import mongoose from 'mongoose'

export default class MongoReadingSeeder extends BaseSeeder {
  public async run() {
    // Asegurar que MongoDB esté conectado
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB no está conectado, saltando seeder de readings')
      return
    }

    // Limpiar colección existente (opcional)
    await Reading.deleteMany({})

    // Crear readings de ejemplo para diferentes sensores
    const sampleReadings = [
      // Sensores ultrasónicos
      {
        sensorName: 'Sensor Ultrasónico HC-SR04 #1',
        identifier: 'sen_ultra_01',
        value: 15.5,
        deviceId: '1',
        timestamp: new Date(Date.now() - 3600000) // 1 hora atrás
      },
      {
        sensorName: 'Sensor Ultrasónico HC-SR04 #1',
        identifier: 'sen_ultra_01',
        value: 16.2,
        deviceId: '1',
        timestamp: new Date(Date.now() - 1800000) // 30 min atrás
      },
      {
        sensorName: 'Sensor Ultrasónico HC-SR04 #1',
        identifier: 'sen_ultra_01',
        value: 14.8,
        deviceId: '1',
        timestamp: new Date()
      },

      // Sensor de temperatura y humedad
      {
        sensorName: 'Sensor Humedad y Temperatura DHT22',
        identifier: 'sen_hum_temp',
        value: 23.5, // Temperatura
        deviceId: '2',
        timestamp: new Date(Date.now() - 900000) // 15 min atrás
      },
      {
        sensorName: 'Sensor Humedad y Temperatura DHT22',
        identifier: 'sen_hum_temp',
        value: 65.2, // Humedad
        deviceId: '2',
        timestamp: new Date(Date.now() - 900000) // 15 min atrás
      },

      // Sensor de gas
      {
        sensorName: 'Sensor de Gas MQ-2',
        identifier: 'sen_gas',
        value: 245.0,
        deviceId: '1',
        timestamp: new Date(Date.now() - 600000) // 10 min atrás
      },
      {
        sensorName: 'Sensor de Gas MQ-2',
        identifier: 'sen_gas',
        value: 238.5,
        deviceId: '1',
        timestamp: new Date()
      },

      // Sensor de peso/carga
      {
        sensorName: 'Celda de Carga con HX711',
        identifier: 'sen_carga',
        value: 1250.0, // gramos
        deviceId: '2', // Cambiado de 3 a 2 (Comedor grande)
        timestamp: new Date(Date.now() - 1200000) // 20 min atrás
      },
      {
        sensorName: 'Celda de Carga con HX711',
        identifier: 'sen_carga',
        value: 1180.5,
        deviceId: '2', // Cambiado de 3 a 2 (Comedor grande)
        timestamp: new Date()
      },

      // Sensor de nivel de agua
      {
        sensorName: 'Sensor de Nivel de Agua',
        identifier: 'sen_agua',
        value: 75.0, // porcentaje
        deviceId: '2',
        timestamp: new Date(Date.now() - 300000) // 5 min atrás
      },
      {
        sensorName: 'Sensor de Nivel de Agua',
        identifier: 'sen_agua',
        value: 73.2,
        deviceId: '2',
        timestamp: new Date()
      },

      // Sensor infrarrojo
      {
        sensorName: 'Sensor Infrarrojo',
        identifier: 'sen_ir',
        value: 1, // 1 = detectado, 0 = no detectado
        deviceId: '1',
        timestamp: new Date(Date.now() - 120000) // 2 min atrás
      },
      {
        sensorName: 'Sensor Infrarrojo',
        identifier: 'sen_ir',
        value: 0,
        deviceId: '1',
        timestamp: new Date()
      },

      // Sensores para el dispositivo 3 (Arenero espacioso)
      {
        sensorName: 'Sensor Ultrasónico HC-SR04 #3',
        identifier: 'sen_ultra_03',
        value: 18.2,
        deviceId: '3',
        timestamp: new Date(Date.now() - 2400000) // 40 min atrás
      },
      {
        sensorName: 'Sensor Ultrasónico HC-SR04 #3',
        identifier: 'sen_ultra_03',
        value: 17.8,
        deviceId: '3',
        timestamp: new Date()
      },
      {
        sensorName: 'Sensor Humedad y Temperatura DHT22',
        identifier: 'sen_hum_temp',
        value: 22.1, // Temperatura
        deviceId: '3',
        timestamp: new Date(Date.now() - 1800000) // 30 min atrás
      },
      {
        sensorName: 'Sensor de Gas MQ-2',
        identifier: 'sen_gas',
        value: 210.3,
        deviceId: '3',
        timestamp: new Date(Date.now() - 900000) // 15 min atrás
      }
    ]

    // Insertar los readings en MongoDB
    const insertedReadings = await Reading.insertMany(sampleReadings)

    console.log(`✅ Se crearon ${insertedReadings.length} readings en MongoDB`)
    console.log('📊 Datos de sensores simulados insertados correctamente')
  }
}
