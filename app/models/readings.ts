import { Schema, model, Document } from 'mongoose'

export interface ReadingDocument extends Document {
  sensorName: string
  identifier: string
  value: number
  timestamp: Date
  deviceId: string
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
  deviceId: {
    type: String,
    required: true,
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
