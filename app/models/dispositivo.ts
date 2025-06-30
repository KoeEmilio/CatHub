const mongoose = require('mongoose');

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
    index: true // Para búsquedas eficientes por entorno
  },
  type: {
    type: String,
    required: true,
    enum: ['arenero', 'bebedero', 'comedero']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error'],
    default: 'active'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  location: {
    x: Number,
    y: Number,
    zone: String
  }
}, {
  timestamps: true,
  discriminatorKey: 'type' // Para usar herencia con discriminadores
});

const Device = mongoose.model('Device', deviceSchema);

// Modelo específico para Arenero
const areneroSchema = new mongoose.Schema({
  usageCount: {
    type: Number,
    default: 0
  },
  lastCleaned: {
    type: Date,
    default: Date.now
  },
  wasteLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  cleaningRequired: {
    type: Boolean,
    default: false
  },
  usageHistory: [{
    timestamp: Date,
    duration: Number, // en segundos
    catId: String // ID del gato si se puede identificar
  }],
  sensorData: {
    weight: Number,
    humidity: Number,
    temperature: Number
  }
});

const Arenero = Device.discriminator('arenero', areneroSchema);

// Modelo específico para Bebedero
const bebederoSchema = new mongoose.Schema({
  waterLevel: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  capacity: {
    type: Number,
    required: true // en mililitros
  },
  temperature: {
    type: Number
  },
  flowRate: {
    type: Number // ml/min
  },
  filterStatus: {
    type: String,
    enum: ['good', 'needs_change', 'expired'],
    default: 'good'
  },
  lastRefill: {
    type: Date,
    default: Date.now
  },
  consumptionHistory: [{
    timestamp: Date,
    amount: Number, // ml consumidos
    catId: String
  }],
  alerts: {
    lowWater: {
      type: Boolean,
      default: false
    },
    filterChange: {
      type: Boolean,
      default: false
    }
  }
});

const Bebedero = Device.discriminator('bebedero', bebederoSchema);

// Modelo específico para Comedero
const comederoSchema = new mongoose.Schema({
  foodLevel: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  capacity: {
    type: Number,
    required: true // en gramos
  },
  portionSize: {
    type: Number,
    default: 50 // gramos por porción
  },
  scheduledMeals: [{
    time: String, // formato "HH:MM"
    portion: Number,
    enabled: Boolean
  }],
  lastFed: {
    type: Date
  },
  feedingHistory: [{
    timestamp: Date,
    amount: Number, // gramos dispensados
    scheduled: Boolean, // true si fue automático, false si fue manual
    catId: String
  }],
  foodType: {
    type: String,
    trim: true
  },
  alerts: {
    lowFood: {
      type: Boolean,
      default: false
    },
    jamDetected: {
      type: Boolean,
      default: false
    }
  }
});

const Comedero = Device.discriminator('comedero', comederoSchema);

deviceSchema.index({ entornoId: 1, type: 1 });
deviceSchema.index({ entornoId: 1, status: 1 });
deviceSchema.index({ lastActivity: -1 });

module.exports = {
  Device,
  Arenero,
  Bebedero,
  Comedero
};