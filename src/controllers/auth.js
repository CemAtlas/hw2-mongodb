import createHttpError from 'http-errors';
import * as authService from '../services/auth.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw createHttpError(400, 'Missing required fields');

  const user = await authService.register({ name, email, password });
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw createHttpError(400, 'Missing required fields');

  const { accessToken, refreshToken, session } = await authService.login({ email, password });

  // Refresh token ve sessionId'yi cookie'lere yaz
  const refreshMaxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 gün
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    secure: true,       // Render HTTPS -> true
    sameSite: 'None',   // cross-site çağrılar için
    maxAge: refreshMaxAgeMs,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: refreshMaxAgeMs,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

export const refresh = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies || {};
  const { accessToken, newRefreshToken, session } = await authService.refresh({ sessionId, refreshToken });

  const refreshMaxAgeMs = 30 * 24 * 60 * 60 * 1000;
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: refreshMaxAgeMs,
  });
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: refreshMaxAgeMs,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

export const logout = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies || {};
  await authService.logout({ sessionId, refreshToken });

  res.clearCookie('sessionId', { httpOnly: true, secure: true, sameSite: 'None' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'None' });

  res.status(204).send();
};
