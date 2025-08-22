import { Schema, model, Document } from 'mongoose'

interface ILastStatus extends Document {
  identifier: string
  status: string
  timestamp: Date
}

const LastStatusSchema = new Schema<ILastStatus>({
  identifier: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
})

const LastStatus = model<ILastStatus>('LastStatus', LastStatusSchema)

export default LastStatus
