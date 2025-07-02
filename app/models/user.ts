import { Schema, model } from 'mongoose'
import { BaseModel, baseSchemaOptions, BaseDocument } from './base_model.js'

export interface UserMongoDocument extends BaseDocument {
  nombre: string
  email: string
  password: string
}

const userSchema = new Schema<UserMongoDocument>(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  baseSchemaOptions
)

export class UserMongo extends BaseModel {
  protected static schema = userSchema
  protected static model = model<UserMongoDocument>('User', userSchema)
}
