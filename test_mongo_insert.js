/**
 * Script para probar inserciones directas en MongoDB
 * Esto debería activar el Change Stream y enviar WebSocket
 */

import mongoose from 'mongoose'

// Esquema de Reading (debe coincidir con tu modelo)
const readingSchema = new mongoose.Schema({
  deviceId: String,
  sensorName: String,
  sensorId: String, 
  identifier: String,
  value: Number,
  timestamp: { type: Date, default: Date.now }
})

const Reading = mongoose.model('Reading', readingSchema)

async function testMongoInsert() {
  try {
    // Conectar a MongoDB (usa tu string de conexión)
    console.log('🔄 Conectando a MongoDB...')
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/cathub')
    console.log('✅ Conectado a MongoDB')

    // Insertar datos de prueba
    console.log('📊 Insertando datos de prueba...')
    
    const testReadings = [
      {
        deviceId: "test_device_1",
        sensorName: "temperatura_test",
        sensorId: "sensor_temp_001",
        identifier: "temp_test_001", 
        value: Math.random() * 30 + 15, // Temperatura aleatoria entre 15-45°C
        timestamp: new Date()
      },
      {
        deviceId: "test_device_1", 
        sensorName: "humedad_test",
        sensorId: "sensor_hum_001",
        identifier: "hum_test_001",
        value: Math.random() * 40 + 30, // Humedad aleatoria entre 30-70%
        timestamp: new Date()
      },
      {
        deviceId: "test_device_2",
        sensorName: "peso_test", 
        sensorId: "sensor_peso_001",
        identifier: "weight_test_001",
        value: Math.random() * 500 + 100, // Peso aleatorio entre 100-600g
        timestamp: new Date()
      }
    ]

    // Insertar una por una con delay para ver las notificaciones
    for (const reading of testReadings) {
      console.log(`📤 Insertando: ${reading.sensorName} = ${reading.value}`)
      
      const newReading = new Reading(reading)
      await newReading.save()
      
      console.log(`✅ Insertado: ${newReading._id}`)
      
      // Esperar 2 segundos entre inserciones
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    console.log('🎉 Todas las inserciones completadas')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado de MongoDB')
    process.exit(0)
  }
}

// Ejecutar el test
testMongoInsert()
