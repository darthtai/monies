const express = require('express');
const Joi = require('joi');
const moment = require('moment');

const jwt = require('../../util/jwt');

const router = express.Router();

const querySchema = Joi.object().keys({
  page: Joi.number()
    .integer()
    .default(1),
  pageSize: Joi.number()
    .integer()
    .default(30),
  status: Joi.string()
});

const PayableControllerFactory = ({ userService, payableService }) => {
  router.get('/payables', jwt.authentication({ userService }), async (req, res, next) => {
    try {
      const queryData = await Joi.validate(req.query, querySchema);

      const clientId = req.user.accessLevel === 'admin' ? req.query.clientId : req.user.id;

      const where = {
        client_id: clientId
      };

      if (queryData.status) {
        where.status = queryData.status;
      }

      const payables = await payableService.findAll({
        where,
        limit: queryData.pageSize,
        offset: queryData.page * (queryData.pageSize - queryData.pageSize),
      });

      return res.status(200).json(
        payables.map(payable => ({
          id: payable.id,
          fees: payable.fees,
          value: payable.value,
          status: payable.status,
          transactionID: payable.transaction_id,
          paymentDate: moment(payable.payment_date).format('DD/MM/YYYY')
        })),
      );
    } catch (error) {
      return next(error);
    }
  });

  return router;
};

module.exports = PayableControllerFactory;
