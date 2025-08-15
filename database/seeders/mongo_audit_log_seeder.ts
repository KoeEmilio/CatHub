import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { AuditLog } from '../../app/models/auditlogs.js'
import mongoose from 'mongoose'

export default class MongoAuditLogSeeder extends BaseSeeder {
  public async run() {
    // Asegurar que MongoDB esté conectado
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB no está conectado, saltando seeder de audit logs')
      return
    }

    // Limpiar colección existente (opcional)
    await AuditLog.deleteMany({})

    // Crear audit logs de ejemplo
    const sampleAuditLogs = [
      {
        actor: 'admin@cathub.com',
        action: 'create',
        collection: 'users',
        targetId: '1',
        after: {
          fullName: 'Admin CatHub',
          email: 'admin@cathub.com'
        },
        timestamp: new Date(Date.now() - 86400000) // 1 día atrás
      },
      {
        actor: 'admin@cathub.com',
        action: 'create',
        collection: 'environments',
        targetId: '1',
        after: {
          name: 'Sala Principal',
          color: '#4F46E5',
          idUser: 1
        },
        timestamp: new Date(Date.now() - 82800000) // 23 horas atrás
      },
      {
        actor: 'admin@cathub.com',
        action: 'create',
        collection: 'devices',
        targetId: '1',
        after: {
          name: 'CatHub Device #1',
          idEnvironment: 1,
          apiKey: 'device_key_001'
        },
        timestamp: new Date(Date.now() - 79200000) // 22 horas atrás
      },
      {
        actor: 'admin@cathub.com',
        action: 'update',
        collection: 'devices',
        targetId: '1',
        before: {
          name: 'CatHub Device #1'
        },
        after: {
          name: 'CatHub Arenero Principal'
        },
        timestamp: new Date(Date.now() - 75600000) // 21 horas atrás
      },
      {
        actor: 'system',
        action: 'create',
        collection: 'readings',
        targetId: 'reading_001',
        after: {
          sensorName: 'Sensor Ultrasónico HC-SR04 #1',
          identifier: 'sen_ultra_01',
          value: 15.5,
          deviceId: '1'
        },
        timestamp: new Date(Date.now() - 3600000) // 1 hora atrás
      },
      {
        actor: 'admin@cathub.com',
        action: 'update',
        collection: 'device_settings',
        targetId: '1',
        before: {
          configValue: '300'
        },
        after: {
          configValue: '250'
        },
        timestamp: new Date(Date.now() - 1800000) // 30 min atrás
      },
      {
        actor: 'system',
        action: 'create',
        collection: 'readings',
        targetId: 'reading_002',
        after: {
          sensorName: 'Sensor de Gas MQ-2',
          identifier: 'sen_gas',
          value: 245.0,
          deviceId: '1'
        },
        timestamp: new Date(Date.now() - 600000) // 10 min atrás
      },
      {
        actor: 'admin@cathub.com',
        action: 'create',
        collection: 'device_envirs',
        targetId: '1',
        after: {
          alias: 'Arenero Principal',
          type: 'arenero',
          idDevice: 1,
          idEnvironment: 1
        },
        timestamp: new Date(Date.now() - 300000) // 5 min atrás
      }
    ]

    // Insertar los audit logs en MongoDB
    const insertedLogs = await AuditLog.insertMany(sampleAuditLogs)

    console.log(`✅ Se crearon ${insertedLogs.length} audit logs en MongoDB`)
    console.log('📋 Logs de auditoría de ejemplo insertados correctamente')
  }
}
