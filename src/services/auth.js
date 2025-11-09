import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';

const ACCESS_TTL_MIN = 15; // dakika
const REFRESH_TTL_DAYS = 30;

const now = () => new Date();
const addMinutes = (d, m) => new Date(d.getTime() + m * 60 * 1000);
const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

const createTokens = () => ({
  accessToken: crypto.randomUUID(),
  refreshToken: crypto.randomUUID(),
  accessTokenValidUntil: addMinutes(now(), ACCESS_TTL_MIN),
  refreshTokenValidUntil: addDays(now(), REFRESH_TTL_DAYS),
});

export const register = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw createHttpError(409, 'Email in use');

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  return user;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'Email or password is wrong');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw createHttpError(401, 'Email or password is wrong');

  // Eski oturumları sil
  await Session.deleteMany({ userId: user._id });

  const { accessToken, refreshToken, accessTokenValidUntil, refreshTokenValidUntil } = createTokens();

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken, session };
};

export const refresh = async ({ sessionId, refreshToken }) => {
  if (!sessionId || !refreshToken) throw createHttpError(401, 'No refresh credentials');

  const session = await Session.findById(sessionId);
  if (!session) throw createHttpError(401, 'Session not found');

  const nowDate = now();
  if (
    session.refreshToken !== refreshToken ||
    nowDate > session.refreshTokenValidUntil
  ) {
    // Geçersiz/expired → oturumu temizle
    await Session.findByIdAndDelete(session._id);
    throw createHttpError(401, 'Invalid or expired refresh token');
  }

  // Eski oturumu sil, yenisini oluştur
  await Session.findByIdAndDelete(session._id);

  const { accessToken, refreshToken: newRefreshToken, accessTokenValidUntil, refreshTokenValidUntil } = createTokens();

  const newSession = await Session.create({
    userId: session.userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, newRefreshToken, session: newSession };
};

export const logout = async ({ sessionId, refreshToken }) => {
  if (!sessionId) return;
  await Session.deleteOne({ _id: sessionId, refreshToken });
};
