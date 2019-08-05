const moment = require('moment');
const Sequelize = require('sequelize');
const sequelize = require('../../util/sequelize');

const PayableFactory = ({ sequelize }) => {
  const payable = sequelize.define('payables', {
    client_id: Sequelize.INTEGER,
    value: Sequelize.DECIMAL(20, 2),
    status: Sequelize.STRING,
    payment_date: Sequelize.DATEONLY,
    fees: Sequelize.JSON,
    transaction_id: Sequelize.INTEGER
  });

  payable.register = async function({ id: transaction_id, payment_method, value, user, taxes = [] }) {
    const methodTypeMap = {
      credit_card: {
        fee: 0.05,
        daysUntilPayment: 30,
        status: 'waiting_funds'
      },
      debit_card: {
        fee: 0.03,
        status: 'paid'
      }
    };

    const methodDetails = methodTypeMap[payment_method];

    if (!methodDetails) {
      throw { message: 'Payment method not informed' };
    }

    let dbTransaction;

    try {
      dbTransaction = await sequelize.transaction();

      const methodTax = methodDetails.fee;

      taxes.push({ name: 'Payment Method Fee', value: methodTax, type: 'percent' });
  
      const calculatedTaxes = taxes.map((tax) => {
        const calculatedTax = { ...tax };
  
        if (tax.type === 'base') {
          return calculatedTax;
        }
  
        calculatedTax.amount = value * tax.value;
  
        return calculatedTax;
      });
  
      const totalTax = calculatedTaxes.reduce((a, b) => (a.amount + b.amount));

      const payableValue = value - (totalTax.amount || totalTax);
      
      const paymentDate = moment().add(methodDetails.daysUntilPayment || 0, 'days').toISOString();

      const payable = await this.create(
        {
          value: payableValue,
          fees: calculatedTaxes,
          client_id: user.id,
          payment_date: paymentDate,
          status: methodDetails.status,
          transaction_id
        },
        { returning: true, dbTransaction },
      );

      await dbTransaction.commit();

      return payable;
    } catch (error) {
      console.log(error)
      await dbTransaction.rollback();
      throw { message: 'An error has occured. Please try again later' };
    }
  }

  return payable;
};

const factory = (state = { sequelize }) => PayableFactory(state);

module.exports = factory;
