import express from 'express';
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../controllers/auth.js';

const router = express.Router();

// Kullanıcı kayıt
router.post('/register', registerUser);

// Giriş yap
router.post('/login', loginUser);

// Token yenileme
router.post('/refresh', refreshSession);

// Çıkış yap
router.post('/logout', logoutUser);

export default router;
