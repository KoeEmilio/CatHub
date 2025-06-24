import { Schema, model, Document } from 'mongoose'

export interface UserDocument extends Document {
  name: string
  email: string
  password: string
  isActive: boolean
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, 
  versionKey: false 
})

export const User = model<UserDocument>('User', userSchema)

// Exportación por defecto
export default User