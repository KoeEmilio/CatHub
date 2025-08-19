import { Schema, model, Document } from 'mongoose'

export interface ReadingDocument extends Document {
  sensorName: string
  identifier: string
  value: number
  timestamp: Date
  deviceId: string
  deviceEnvirId: string
  sensorId?: string // Opcional
}

const readingSchema = new Schema({
  sensorName: {
    type: String,
    required: true,
    trim: true
  },
  identifier: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  deviceEnvirId: {
    type: String,
    required: true,
    trim: true
  },
  deviceId: {
    type: String,
    required: true,
    trim: true
  },
  sensorId: {
    type: String,
    required: false, // Hacer opcional para compatibilidad
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
})

// Índices para optimizar consultas
readingSchema.index({ deviceId: 1, timestamp: -1 })
readingSchema.index({ sensorName: 1 })

export const Reading = model<ReadingDocument>('Reading', readingSchema)
export default Reading
