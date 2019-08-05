const express = require('express');
const Joi = require('joi');
const jwt = require('../../util/jwt');

const router = express.Router();

const createSchema = Joi.object().keys({
  number: Joi.string()
    .min(16)
    .required(),
  bearer_name: Joi.string().required(),
  cvv: Joi.string().required(),
  valid_date: Joi.date()
    .iso()
    .required(),
  value: Joi.number(),
  payment_method: Joi.string().required(),
  description: Joi.string().required(),
  client_id: Joi.number().integer(),
  taxes: Joi.array()
});

const paginationSchema = Joi.object().keys({
  page: Joi.number()
    .integer()
    .default(1),
  pageSize: Joi.number()
    .integer()
    .default(20),
});

const TransactionControllerFactory = ({ userService, payableService, transactionService }) => {
  router.post('/transactions', jwt.authentication({ userService }), async (req, res, next) => {
    try {
      const createData = await Joi.validate(req.body, createSchema);
      const transaction = await transactionService.register({ ...createData, user: req.user, payableService });

      return res.status(201).json(transaction);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/transactions', jwt.authentication({ userService }), async (req, res, next) => {
    try {
      const paginationData = await Joi.validate(req.query, paginationSchema)
      const transactions = await transactionService.findAll({
        where: {
          client_id: req.user.id,
        },
        limit: paginationData.pageSize,
        offset: paginationData.page * paginationData.pageSize - paginationData.pageSize,
      })

      return res.status(200).json(transactions);
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/transactions/:transactionId', jwt.authentication({ userService, allowedAccess: ['admin'] }), async (req, res, next) => {
    try {
      const transactionId = await Joi.validate(
        req.params.transactionId,
        Joi.number()
          .integer()
          .required(),
      );

      await transactionService.delete({ where: { id: transactionId, userId: req.user.id } })

      return res.status(204).end();
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = TransactionControllerFactory;
