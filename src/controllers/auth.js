import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';

// ACCESS ve REFRESH TOKEN süreleri
const ACCESS_TOKEN_TTL = 15 * 60 * 1000; // 15 dakika
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000; // 30 gün

// JWT secret key'leri .env'den okunur
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// 🔹 Yardımcı: Token oluşturma fonksiyonu
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '30d' });

  const accessTokenValidUntil = new Date(Date.now() + ACCESS_TOKEN_TTL);
  const refreshTokenValidUntil = new Date(Date.now() + REFRESH_TOKEN_TTL);

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

// 🔹 REGISTER
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw createHttpError(400, 'All fields are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: 'success',
      message: 'Successfully registered a user!',
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 LOGIN
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid email or password');
    }

    // Eski session varsa sil
    await Session.deleteOne({ userId: user._id });

    // Yeni tokenlar oluştur
    const tokens = generateTokens(user._id);

    await Session.create({
      userId: user._id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenValidUntil: tokens.accessTokenValidUntil,
      refreshTokenValidUntil: tokens.refreshTokenValidUntil,
    });

    // Refresh token cookie’ye kaydet
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: REFRESH_TOKEN_TTL,
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully logged in an user!',
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 REFRESH
export const refreshSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw createHttpError(401, 'No refresh token provided');
    }

    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    const existingSession = await Session.findOne({
      userId: payload.userId,
      refreshToken,
    });

    if (!existingSession) {
      throw createHttpError(401, 'Invalid session');
    }

    // Eski oturumu sil
    await Session.deleteOne({ _id: existingSession._id });

    // Yeni tokenlar oluştur
    const tokens = generateTokens(payload.userId);

    await Session.create({
      userId: payload.userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenValidUntil: tokens.accessTokenValidUntil,
      refreshTokenValidUntil: tokens.refreshTokenValidUntil,
    });

    // Refresh token cookie’yi güncelle
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: REFRESH_TOKEN_TTL,
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully refreshed a session!',
      data: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 LOGOUT
export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET);
      await Session.deleteOne({ userId: payload.userId, refreshToken });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

