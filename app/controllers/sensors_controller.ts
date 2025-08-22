import type { HttpContext } from '@adonisjs/core/http'
import Reading from '#models/readings'
import LastStatus from '../mongo-models/lastStatus.js'

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

  async getLastStatusForDevice({params, response}: HttpContext) {
    const { id } = params
    const lastStatus = await LastStatus.findOne({identifier: id}).sort({_id: -1})

    if (!lastStatus) {
      return response.notFound({ message: 'Last status not found' })
    }

    return response.ok({
      message: 'Last status retrieved successfully',
      data: {
        lastStatus: lastStatus
      }
    })
  }

}