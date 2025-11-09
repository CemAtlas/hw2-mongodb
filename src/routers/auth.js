import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import * as authController from '../controllers/auth.js';

const router = Router();

router.post('/register', ctrlWrapper(authController.register));
router.post('/login', ctrlWrapper(authController.login));
router.post('/refresh', ctrlWrapper(authController.refresh));
router.post('/logout', ctrlWrapper(authController.logout));

export default router;
