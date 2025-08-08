import { Schema, model } from 'mongoose'

export interface AuditLogDocument {
  actor: string // Quién hizo la acción (ej: email o id)
  action: string // 'create', 'update', 'delete'
  collection: string // Colección afectada (ej: 'users')
  targetId: string // ID del documento afectado
  before?: any // Estado antes del cambio (opcional)
  after?: any // Estado después del cambio (opcional)
  timestamp: Date
}

const auditLogSchema = new Schema<AuditLogDocument>({
  actor: { type: String, required: true },
  action: { type: String, required: true },
  collection: { type: String, required: true },
  targetId: { type: String, required: true },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
})

export const AuditLog = model<AuditLogDocument>('AuditLog', auditLogSchema)
