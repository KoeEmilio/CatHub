import type { HttpContext } from '@adonisjs/core/http'
import Reading from '#models/readings'

export default class SensorsController {

  async getByIdentifier({params, response}: HttpContext) {
    const { id } = params
    const sensor = await Reading.findOne({identifier: id}).sort({_id: -1})

    if (!sensor) {
      return response.notFound({ message: 'Sensor not found' })
    }

    return response.ok({
      message: 'Sensor retrieved successfully',
      data: {
        sensor: sensor
      }
    })
  }

}