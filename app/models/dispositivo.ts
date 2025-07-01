import { model } from "mongoose";

const mongoose = require('mongoose');

export interface Device {
  deviceId: string;
  entornoId: string;
  type: 'arenero' | 'bebedero' | 'comedero';
}

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  entornoId: {
    type: String,
    required: true,
    index: true 
  },
  type: {
    type: String,
    required: true,
    enum: ['arenero', 'bebedero', 'comedero']
  },
  
}, {
  timestamps: true,
});

export const Dispositivo = model<Device>('Dispositivo', deviceSchema);