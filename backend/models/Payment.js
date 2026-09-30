import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collaboration',
      required: true,
      index: true,
    },
    agreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agreement',
      default: null,
      index: true,
    },
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USDC',
      trim: true,
    },
    method: {
      type: String,
      enum: ['crypto_escrow', 'fiat_escrow', 'simulated_escrow', 'direct_transfer'],
      default: 'simulated_escrow',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'authorized',
        'held',
        'released',
        'failed',
        'refunded',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    transactionReference: {
      type: String,
      default: null,
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    releasedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ collaborationId: 1, status: 1 });
paymentSchema.index({ payerId: 1, createdAt: -1 });
paymentSchema.index({ payeeId: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
