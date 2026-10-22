import { Router } from 'express';
import { createUser, getAllUsers, getUserById } from '../controllers/userController.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema } from '../utils/validators.js';

const router = Router();

router.post('/', validate(createUserSchema), createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);

export default router;
