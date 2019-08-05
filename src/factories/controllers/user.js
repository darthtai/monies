const bcrypt = require('bcrypt');
const express = require('express');
const Joi = require('joi');
const jwt = require('../../util/jwt');

const createSchema = Joi.object().keys({
  name: Joi.string()
    .alphanum()
    .required(),
  password: Joi.string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  email: Joi.string()
    .email()
    .required()
});

const loginSchema = Joi.object().keys({
  password: Joi.string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  email: Joi.string()
    .email()
    .required(),
});

const UserControllerFactory = ({ service }) => {
  const router = express.Router();

  router.post('/user', async (req, res, next) => {
    try {
      const createData = await Joi.validate(req.body, createSchema);
      const existingUser = await service.findOne({ where: { email: createData.email } });

      if (existingUser) {
        throw { message: 'User already registered' };
      }

      const user = await service.create(
        {
          ...createData,
          password: await bcrypt.hash(createData.password, 10),
          access_level: createData.access_level || 'client',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { returning: true },
      );

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      return next(error)
    }
  });

  router.post('/user/login', async (req, res, next) => {
    try {
      const loginData = await Joi.validate(req.body, loginSchema);

      const user = await service.findOne({
        where: {
          email: loginData.email,
        },
      });

      if (!user) {
        throw { message: 'The email or password is not incorrect.' };
      }

      const isPasswordCorrect = await bcrypt.compare(loginData.password, user.password);

      if (!isPasswordCorrect) {
        throw { message: 'The email or password is incorrect.' };
      }

      const token = jwt.sign({ user });

      return res.status(200)
        .json({
          token,
          user: {
            id: user.id,
            name: user.name,
          },
        });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = UserControllerFactory
