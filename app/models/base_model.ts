import { Schema, Document, Model } from 'mongoose'

export interface BaseDocument extends Document {
  createdAt: Date
  updatedAt: Date
}

export const baseSchemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (ret: any) => {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    },
  },
}

export abstract class BaseModel {
  protected static schema: Schema
  protected static model: Model<any>

  static getModel() {
    return this.model
  }

  static create(data: any) {
    return this.model.create(data)
  }

  static find(filter = {}) {
    return this.model.find(filter)
  }

  static findOne(filter: any) {
    return this.model.findOne(filter)
  }

  static findById(id: string) {
    return this.model.findById(id)
  }

  static findByIdAndUpdate(id: string, update: any, options = { new: true }) {
    return this.model.findByIdAndUpdate(id, update, options)
  }

  static findByIdAndDelete(id: string) {
    return this.model.findByIdAndDelete(id)
  }

  static deleteMany(filter: any) {
    return this.model.deleteMany(filter)
  }

  static countDocuments(filter = {}) {
    return this.model.countDocuments(filter)
  }

  static aggregate(pipeline: any[]) {
    return this.model.aggregate(pipeline)
  }
}
