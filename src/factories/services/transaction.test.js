const Sequelize = require('sequelize');
const TransactionFactory = require('./transaction');

describe('Transaction Service', () => {
  it('defines transaction service', () => {
    const sequelize = {
      define: jest.fn(() => ({})),
    }

    const transactionService = TransactionFactory({ sequelize })

    expect(sequelize.define).toBeCalledTimes(1)
    expect(sequelize.define).toBeCalledWith('transactions', {
      number: Sequelize.STRING,
      bearer_name: Sequelize.STRING,
      cvv: Sequelize.STRING,
      value: Sequelize.DECIMAL(20, 6),
      valid_date: Sequelize.DATEONLY,
      client_id: Sequelize.INTEGER,
      payment_method: Sequelize.STRING,
      description: Sequelize.STRING
    })
  })

  it('registers a transaction and creates payable', async () => {
    const transaction = {
      number: "1234 5678 9876 5432",
      bearer_name: "bobby bob",
      cvv: "1245",
      valid_date: "2019-12-12",
      value: 6554.52,
      payment_method: "credit_card",
      description: "machine thingy"
    };

    const transactionDefault = {
      create: jest.fn(() => Promise.resolve({ dataValues: { ...transaction, number: '5432' } })),
      findOne: jest.fn(() => Promise.resolve())
    };
    const dbTransaction = {
      commit: jest.fn(() => Promise.resolve())
    };
    const sequelize = {
      define: jest.fn(() => transactionDefault),
      transaction: jest.fn(() => dbTransaction)
    };
    const transactionService = TransactionFactory({ sequelize });
    const payable = {
      dataValues: {
        id: 1,
        fees: [
            {
                name: 'Payment Method Fee',
                value: 0.05,
                type: 'percent',
                amount: 327.72600000000006
            }
        ],
        value: 6226.79,
        status: 'waiting_funds',
        transactionID: 1,
        paymentDate: '04/09/2019'
     }
    };
    const payableService = {
      register: jest.fn(() => Promise.resolve(payable))
    };
    const user = { id: 42, access_level: 'client' };

    await transactionService.register({
      ...transaction,
      user,
      payableService
    });

    transaction.number = '5432';

    expect(transactionDefault.create).toBeCalledTimes(1);
    expect(transactionDefault.create).toBeCalledWith(
      {
        ...transaction,
        client_id: user.id,
      },
      { returning: true, dbTransaction },
    );

    expect(sequelize.transaction).toBeCalledTimes(1);

    expect(payableService.register).toBeCalledTimes(1);
    expect(payableService.register).toBeCalledWith({ ...transaction, taxes: undefined, user });

    expect(dbTransaction.commit).toBeCalledTimes(1);
  });
})
