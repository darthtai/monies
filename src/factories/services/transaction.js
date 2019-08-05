const Sequelize = require('sequelize');
const sequelize = require('../../util/sequelize');

const TransactionFactory = ({ sequelize }) => {
  const transactions = sequelize.define('transactions', {
    number: Sequelize.STRING,
    bearer_name: Sequelize.STRING,
    cvv: Sequelize.STRING,
    value: Sequelize.DECIMAL(20, 6),
    valid_date: Sequelize.DATEONLY,
    client_id: Sequelize.INTEGER,
    payment_method: Sequelize.STRING,
    description: Sequelize.STRING
  });

  transactions.register = async function({
    number,
    bearer_name,
    cvv,
    valid_date,
    value,
    user,
    payment_method,
    taxes,
    description,
    payableService
  }) {
    let dbTransaction;

    const numbersWithSpace = number.split(' ');

    const cardNumber = numbersWithSpace.length === 1
      ? number.slice(number.length - 4, number.length)
      : numbersWithSpace[numbersWithSpace.length - 1]; 

    try {
      dbTransaction = await sequelize.transaction();

      const transaction = await this.create(
        {
          number: cardNumber,
          bearer_name,
          cvv,
          valid_date,
          payment_method,
          value,
          description,
          client_id: user.id
        },
        { returning: true, dbTransaction },
      );

      const payable = await payableService.register({ ...transaction.dataValues, taxes, user });

      await dbTransaction.commit();

      transaction.dataValues.payable_value = payable.value;
      transaction.dataValues.fees = payable.fees;

      return transaction;
    } catch (error) {
      console.log(error);
      await dbTransaction.rollback();
      throw { message: 'There was an error. Please try again later' };
    }
  }

  transactions.delete = async function({
    transactionId,
    payableService
  }) {
    let dbTransaction;

    try {
      dbTransaction = await sequelize.transaction();

      const payableDeleted = await payableService.destroy({ where: { transaction_id: transactionId } }, { dbTransaction });

      const transactionDeleted = await this.destroy(
        {
          where: {
            id,
          },
        },
        { transaction },
      );

      if (!payableDeleted || !transactionDeleted) {
        return await dbTransaction.rollback();
      }

      return await dbTransaction.commit();
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  return transactions;
};

const factory = (state = { sequelize }) => TransactionFactory(state);

module.exports = factory;
