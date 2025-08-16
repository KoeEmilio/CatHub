import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Actuator from '#models/actuator'

export default class extends BaseSeeder {
  async run() {
    // Crear actuadores de ejemplo
    const actuators = [
      { nombre: 'Motor de Limpieza Arenero' },
      { nombre: 'Bomba de Agua' },
      { nombre: 'Dispensador de Comida' },
      { nombre: 'Motor de Agitación' },
      { nombre: 'Sensor de Proximidad' },
      { nombre: 'Válvula de Control' }
    ]

    await Actuator.createMany(actuators)
    
    console.log('✅ Creados actuadores de ejemplo')
  }
}