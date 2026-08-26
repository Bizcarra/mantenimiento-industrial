import mongoose from 'mongoose';

const historyLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    usuarioQueCambia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tipoDeAccion: {
      type: String,
      enum: ['creacion', 'cambio_estado', 'asignacion', 'cambio_prioridad', 'resolucion', 'comentario'],
      required: true,
    },
    detalles: {
      type: String,
      required: true,
    },
    datosAnteriores: mongoose.Schema.Types.Mixed,
    datosNuevos: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

const HistoryLog = mongoose.model('HistoryLog', historyLogSchema);
export default HistoryLog;
