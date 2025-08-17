import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Code from '#models/code'
import DeviceEnvir from '#models/device_envir'

export default class extends BaseSeeder {
  async run() {
    // Verificar si ya existen códigos para evitar duplicados
    const existingCodes = await Code.query().limit(1)
    
    if (existingCodes.length === 0) {
      // Obtener los device_environments existentes
      const deviceEnvirs = await DeviceEnvir.query().orderBy('id', 'asc')
      
      if (deviceEnvirs.length === 0) {
        console.log('❌ No hay device environments existentes. Ejecuta primero el device_envir_seeder.')
        return
      }

      // Crear 8 códigos únicos de 8 caracteres
      const codes = [
        'A1B2C3D4',
        'E5F6G7H8', 
        'I9J0K1L2',
        'M3N4O5P6',
        'Q7R8S9T0',
        'U1V2W3X4',
        'Y5Z6A7B8',
        'C9D0E1F2'
      ]

      // Insertar códigos para los device_environments existentes (máximo 8)
      const maxCodes = Math.min(deviceEnvirs.length, codes.length)
      
      for (let i = 0; i < maxCodes; i++) {
        await Code.create({
          code: codes[i],
          idDevice: deviceEnvirs[i].id,
        })
      }

      console.log(`✅ Creados ${maxCodes} códigos únicos para device environments existentes`)
    } else {
      console.log('ℹ️ Códigos ya existen')
    }
  }
}