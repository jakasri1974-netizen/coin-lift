import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createOrGetConversation,
  getConversations,
  getConversationById,
  getMessages,
  sendMessageREST,
  markMessageRead,
  markConversationReadAll,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const chatMessageLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 100,
  skip: (req) => req.headers['x-test-bypass'] === 'true',
  message: {
    success: false,
    message: 'Too many messages sent in a short time. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(protect);

router.post('/conversations', createOrGetConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', chatMessageLimiter, sendMessageREST);
router.put('/messages/:id/read', markMessageRead);
router.put('/conversations/:id/read-all', markConversationReadAll);

export default router;
