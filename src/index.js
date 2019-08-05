const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const TransactionFactory = require('./factories/services/transaction');
const TransactionControllerFactory = require('./factories/controllers/transaction');
const UserFactory = require('./factories/services/user');
const UserControllerFactory = require('./factories/controllers/user');
const PayableFactory = require('./factories/services/payable');
const PayableControllerFactory = require('./factories/controllers/payable');

const app = express();
const transactionService = TransactionFactory();
const userService = UserFactory();
const payableService = PayableFactory();
console.log(payableService)
const transactionController = TransactionControllerFactory({ transactionService, userService, payableService });
const userController = UserControllerFactory({ service: userService });
const payableController = PayableControllerFactory({ transactionService, userService, payableService });

app.use(helmet());
app.use(bodyParser.json());

app.use(userController);
app.use(transactionController);
app.use(payableController);

app.use((error, req, res, next) => {
  if (error.isJoi) {
    return res.status(400).json(error.details);
  }

  return res.status(500).json(error);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => console.log('Listening on port 3000!'));
}

module.exports = app;
