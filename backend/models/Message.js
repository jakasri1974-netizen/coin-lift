import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ['text', 'link'],
      default: 'text',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to keep content, text, and message fields in sync
messageSchema.pre('validate', function (next) {
  const mainText = this.content || this.text || this.message;
  if (mainText) {
    if (!this.content) this.content = mainText;
    if (!this.text) this.text = mainText;
    if (!this.message) this.message = mainText;
  }
  next();
});

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;

