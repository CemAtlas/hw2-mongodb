import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, _res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const [type, token] = auth.split(' ');
    if (type !== 'Bearer' || !token) throw createHttpError(401, 'Not authorized');

    const session = await Session.findOne({ accessToken: token });
    if (!session) throw createHttpError(401, 'Not authorized');

    const now = new Date();
    if (now > session.accessTokenValidUntil) {
      throw createHttpError(401, 'Access token expired');
    }

    const user = await User.findById(session.userId);
    if (!user) throw createHttpError(401, 'Not authorized');

    req.user = { _id: user._id, email: user.email, name: user.name };
    req.session = { _id: session._id };
    next();
  } catch (err) {
    next(err);
  }
};
