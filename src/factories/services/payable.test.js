const moment = require('moment')
const Sequelize = require('sequelize')
const PayableFactory = require('./payable')

describe('Payable Service', () => {
  it('defines payable service', () => {
    const sequelize = {
      define: jest.fn(() => ({})),
    }
    const payableService = PayableFactory({ sequelize })

    expect(sequelize.define).toBeCalledTimes(1)
    expect(sequelize.define).toBeCalledWith('payables', {
      client_id: Sequelize.INTEGER,
      value: Sequelize.DECIMAL(20, 2),
      status: Sequelize.STRING,
      payment_date: Sequelize.DATEONLY,
      fees: Sequelize.JSON,
      transaction_id: Sequelize.INTEGER
    })
  });

  it('registers a payable', async () => {
    const transaction = {
      number: "1234 5678 9876 5432",
      bearer_name: "bobby bob",
      cvv: "1245",
      valid_date: "2019-12-12",
      value: 6554.52,
      payment_method: "credit_card",
      description: "machine thingy",
      id: 42
    };

    const user = { id: 44 };
    const payableValue = '1300.25'
    const transactionDefault = {
      create: jest.fn(() => Promise.resolve()),
      findOne: jest.fn(() => Promise.resolve())
    };
    const dbTransaction = {
      commit: jest.fn(() => Promise.resolve())
    };
    const sequelize = {
      define: jest.fn(() => transactionDefault),
      transaction: jest.fn(() => dbTransaction)
    };
    const payableService = PayableFactory({ sequelize });

    await payableService.register({ ...transaction, user });

    expect(sequelize.transaction).toBeCalledTimes(1);

    const payableResult = {  
      "client_id":44,
      "fees":[  
        {  
          "amount":327.72600000000006,
          "name":"Payment Method Fee",
          "type":"percent",
          "value":0.05
        }
      ],
      "status":"waiting_funds",
      "transaction_id":42,
      "value":6226.794000000001
    };

    expect(transactionDefault.create).toBeCalledTimes(1);
    expect(transactionDefault.create.mock.calls[0][0]).toMatchObject(payableResult);

    expect(dbTransaction.commit).toBeCalledTimes(1);
  });
});
