import { HttpContext } from '@adonisjs/core/http'
import DeviceSetting from '../models/device_setting.js'
import Setting from '../models/setting.js'

export default class DeviceConfigController {
  /**
   * Obtener configuraciones del dispositivo autenticado
   */
  public async getConfigurations({ device, response }: HttpContext) {
    try {
      if (!device) {
        return response.unauthorized({
          status: 'error',
          message: 'Dispositivo no autenticado'
        })
      }

      const deviceSettings = await DeviceSetting.query()
        .where('id_device', device.id)
        .preload('setting')

      const configurations = deviceSettings.map(ds => ({
        key: ds.setting.configKey,
        value: ds.setting.configValue,
        dataType: ds.setting.dataType
      }))

      return response.ok({
        status: 'success',
        data: {
          deviceId: device.id,
          deviceName: device.name,
          configurations
        }
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al obtener configuraciones',
        error: error.message
      })
    }
  }

  /**
   * Actualizar una configuración específica del dispositivo
   */
  public async updateConfiguration({ device, request, response }: HttpContext) {
    try {
      if (!device) {
        return response.unauthorized({
          status: 'error',
          message: 'Dispositivo no autenticado'
        })
      }

      const { configKey, configValue } = request.only(['configKey', 'configValue'])

      if (!configKey || configValue === undefined) {
        return response.status(400).json({
          status: 'error',
          message: 'configKey y configValue son requeridos'
        })
      }

      // Buscar la configuración global
      const setting = await Setting.findBy('config_key', configKey)
      if (!setting) {
        return response.status(404).json({
          status: 'error',
          message: 'Configuración no encontrada'
        })
      }

      // Buscar o crear la relación dispositivo-configuración
      let deviceSetting = await DeviceSetting.query()
        .where('id_device', device.id)
        .where('id_settings', setting.id)
        .first()

      if (!deviceSetting) {
        deviceSetting = await DeviceSetting.create({
          idDevice: device.id,
          idSettings: setting.id
        })
      }

      // Actualizar el valor en la configuración global
      setting.configValue = configValue.toString()
      await setting.save()

      return response.ok({
        status: 'success',
        message: 'Configuración actualizada correctamente',
        data: {
          deviceId: device.id,
          configKey: setting.configKey,
          configValue: setting.configValue
        }
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al actualizar configuración',
        error: error.message
      })
    }
  }

  /**
   * Enviar datos de sensor desde el dispositivo
   */
  public async sendSensorData({ device, request, response }: HttpContext) {
    try {
      if (!device) {
        return response.unauthorized({
          status: 'error',
          message: 'Dispositivo no autenticado'
        })
      }

      const data = request.only(['sensorName', 'identifier', 'value'])
      
      // Importar Reading dinámicamente para evitar problemas de importación
      const Reading = (await import('../models/readings.js')).default

      const reading = new Reading({
        sensorName: data.sensorName,
        identifier: data.identifier,
        value: data.value,
        deviceId: device.id.toString(),
        timestamp: new Date()
      })

      await reading.save()

      return response.status(201).json({
        status: 'success',
        message: 'Datos de sensor registrados correctamente',
        data: {
          deviceId: device.id,
          deviceName: device.name,
          reading: {
            sensorName: reading.sensorName,
            identifier: reading.identifier,
            value: reading.value,
            timestamp: reading.timestamp
          }
        }
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Error al registrar datos del sensor',
        error: error.message
      })
    }
  }
}
