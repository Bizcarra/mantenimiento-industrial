import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    numeroTicket: {
      type: String,
      unique: true,
      sparse: true,
      maxlength: 30,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    estado: {
      type: String,
      enum: ['abierto', 'en_progreso', 'pausado', 'resuelto', 'cerrado'],
      default: 'abierto',
    },
    prioridad: {
      type: String,
      enum: ['baja', 'media', 'alta', 'critica'],
      default: 'media',
    },
    area: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    solicitante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tecnicoAsignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    fechaSolicitud: {
      type: Date,
      default: Date.now,
    },
    fechaAsignacion: {
      type: Date,
      default: null,
    },
    fechaResolucion: {
      type: Date,
      default: null,
    },
    tiempoEstimado: {
      type: Number,
      default: null,
    },
    descripcionSolucion: {
      type: String,
      default: null,
      trim: true,
      maxlength: 5000,
    },
    usuarioSolucion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tiempoTranscurridoMinutos: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true }
);

// Generar número de ticket único ANTES de validar
ticketSchema.pre('validate', async function (next) {
  if (this.isNew && !this.numeroTicket) {
    try {
      const count = await this.constructor.countDocuments();
      this.numeroTicket = `TKT-${String(count + 1).padStart(5, '0')}`;
    } catch (error) {
      this.numeroTicket = `TKT-${Date.now()}`;
    }
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
