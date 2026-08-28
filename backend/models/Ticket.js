import mongoose from 'mongoose';

const evidenciaFotoSchema = new mongoose.Schema(
  {
    archivo: {
      type: String,
      required: true,
      match: /^[0-9a-f-]{36}\.(?:jpg|png)$/,
    },
    tipoMime: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png'],
    },
    tamano: {
      type: Number,
      required: true,
      min: 1,
      max: 5 * 1024 * 1024,
    },
    sha256: {
      type: String,
      required: true,
      match: /^[a-f0-9]{64}$/,
    },
    fechaCarga: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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
    evidenciaFoto: {
      type: evidenciaFotoSchema,
      default: null,
    },
    eliminarDespuesDe: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ eliminarDespuesDe: 1 });

ticketSchema.set('toJSON', {
  transform: (documento, objeto) => {
    if (objeto.evidenciaFoto) {
      delete objeto.evidenciaFoto.archivo;
      delete objeto.evidenciaFoto.sha256;
    }
    return objeto;
  },
});

ticketSchema.pre('validate', async function (next) {
  if (this.isNew && !this.numeroTicket) {
    try {
      let siguienteNumero = (await this.constructor.countDocuments()) + 1;
      let numeroCandidato = `TKT-${String(siguienteNumero).padStart(5, '0')}`;

      while (await this.constructor.exists({ numeroTicket: numeroCandidato })) {
        siguienteNumero += 1;
        numeroCandidato = `TKT-${String(siguienteNumero).padStart(5, '0')}`;
      }

      this.numeroTicket = numeroCandidato;
    } catch (error) {
      this.numeroTicket = `TKT-${Date.now()}`;
    }
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
