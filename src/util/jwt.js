const jwtDefault = require('jsonwebtoken')

const JWT_SECRET = process.env.jwtSecret || 'secrets'

const authentication = ({ allowedAccess = ['client', 'admin'], jwt = jwtDefault, userService }) => async (
  req,
  res,
  next,
) => {
  if (!req.headers.authorization) {
    return next({ message: 'Not authorized' })
  }

  const token = req.headers.authorization.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userService.findById(decoded.id);

    if (!user || !allowedAccess.includes(user.dataValues.access_level)) {
      return next({ message: 'Not authorized' });
    }

    req.user = user.dataValues;
  } catch (error) {
    return next({ message: 'Not authorized' })
  }

  return next()
}

const sign = ({ user, jwt = jwtDefault }) => {
  const accessLevel = user.access_level || 'client';

  const token = jwt.sign(
    {
      id: user.id,
      accessLevel
    },
    JWT_SECRET,
    { expiresIn: '12h' },
  );

  return token;
}

module.exports = { authentication, sign }
