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
    // IDs basados en el orden del sensor_seeder: 
    // 1-4: sen_ultra_01-04, 5: sen_agua, 6-7: drivers, 8: sen_ir, 9: sen_hum_temp, 10: sen_gas, 11: sen_carga
    const sampleReadings = [
      // Sensores ultrasónicos (sensorId: 1)
      {
        sensorName: 'ultrasonico',
        identifier: 'sen_ultra_01',
        value: 15.5,
        deviceId: '1',
        deviceEnvirId: '1',
        sensorId: '1', // sen_ultra_01 en la tabla sensors
        timestamp: new Date(Date.now() - 3600000) // 1 hora atrás
      },
      {
        sensorName: 'ultrasonico',
        identifier: 'sen_ultra_01',
        value: 16.2,
        deviceId: '1',
        deviceEnvirId: '1',
        sensorId: '1',
        timestamp: new Date(Date.now() - 1800000) // 30 min atrás
      },
      {
        sensorName: 'ultrasonico',
        identifier: 'sen_ultra_01',
        value: 14.8,
        deviceId: '1',
        deviceEnvirId: '1',
        sensorId: '1',
        timestamp: new Date()
      },

      // Sensor de temperatura y humedad (sensorId: 9)
      {
        sensorName: 'humedad_temp',
        identifier: 'sen_hum_temp',
        value: 23.5, // Temperatura
        deviceId: '2',
        deviceEnvirId: '2',
        sensorId: '9', // sen_hum_temp en la tabla sensors
        timestamp: new Date(Date.now() - 900000) // 15 min atrás
      },
      {
        sensorName: 'humedad_temp',
        identifier: 'sen_hum_temp',
        value: 65.2, // Humedad
        deviceId: '2',
        deviceEnvirId: '2',
        sensorId: '9',
        timestamp: new Date(Date.now() - 900000) // 15 min atrás
      },

      // Sensor de gas (sensorId: 10)
      {
        sensorName: 'gas',
        identifier: 'sen_gas',
        value: 245.0,
        deviceId: '1',
        deviceEnvirId: '1',
        sensorId: '10', // sen_gas en la tabla sensors
        timestamp: new Date(Date.now() - 600000) // 10 min atrás
      },
      {
        sensorName: 'gas',
        identifier: 'sen_gas',
        value: 238.5,
        deviceId: '1',
        deviceEnvirId: '1',
        sensorId: '10',
        timestamp: new Date()
      },

      // Sensor de peso/carga (sensorId: 11)
      {
        sensorName: 'carga',
        identifier: 'sen_carga',
        value: 1250.0, // gramos
        deviceId: '2',
        deviceEnvirId: '2',
        sensorId: '11', // sen_carga en la tabla sensors
        timestamp: new Date(Date.now() - 1200000) // 20 min atrás
      },
      {
        sensorName: 'carga',
        identifier: 'sen_carga',
        value: 1180.5,
        deviceId: '2',
        deviceEnvirId: '2',
        sensorId: '11',
        timestamp: new Date()
      },

      // Sensor de nivel de agua (sensorId: 5)
      {
        sensorName: 'agua',
        identifier: 'sen_agua',
        value: 75.0, // porcentaje
        deviceId: '2',
        deviceEnvirId: '2',
        sensorId: '5', // sen_agua en la tabla sensors
        timestamp: new Date(Date.now() - 300000) // 5 min atrás
      },
      {
        sensorName: 'agua',
        identifier: 'sen_agua',
        value: 73.2,
        deviceId: '2',
        deviceEnvirId: '2',
        sensorId: '5',
        timestamp: new Date()
      },

      // Sensor infrarrojo (sensorId: 8)
      {
        sensorName: 'infrarrojo',
        identifier: 'sen_ir',
        value: 1, // 1 = detectado, 0 = no detectado
        deviceId: '1',
        deviceEnvirId: '1',
        sensorId: '8', // sen_ir en la tabla sensors
        timestamp: new Date(Date.now() - 120000) // 2 min atrás
      },
      {
        sensorName: 'infrarrojo',
        identifier: 'sen_ir',
        value: 0,
        deviceId: '1',
        deviceEnvirId: '1',
        sensorId: '8',
        timestamp: new Date()
      },

      // Sensores para el dispositivo 3 (sensorId: 3)
      {
        sensorName: 'ultrasonico',
        identifier: 'sen_ultra_03',
        value: 18.2,
        deviceId: '3',
        deviceEnvirId: '3',
        sensorId: '3', // sen_ultra_03 en la tabla sensors
        timestamp: new Date(Date.now() - 2400000) // 40 min atrás
      },
      {
        sensorName: 'ultrasonico',
        identifier: 'sen_ultra_03',
        value: 17.8,
        deviceId: '3',
        deviceEnvirId: '3',
        sensorId: '3',
        timestamp: new Date()
      },
      {
        sensorName: 'humedad_temp',
        identifier: 'sen_hum_temp',
        value: 22.1, // Temperatura
        deviceId: '3',
        deviceEnvirId: '3',
        sensorId: '9', // sen_hum_temp en la tabla sensors
        timestamp: new Date(Date.now() - 1800000) // 30 min atrás
      },
      {
        sensorName: 'gas',
        identifier: 'sen_gas',
        value: 210.3,
        deviceId: '3',
        deviceEnvirId: '3',
        sensorId: '10', // sen_gas en la tabla sensors
        timestamp: new Date(Date.now() - 900000) // 15 min atrás
      }
    ]

    // Insertar los readings en MongoDB
    const insertedReadings = await Reading.insertMany(sampleReadings)

    console.log(`✅ Se crearon ${insertedReadings.length} readings en MongoDB`)
    console.log('📊 Datos de sensores simulados insertados correctamente')
  }
}
