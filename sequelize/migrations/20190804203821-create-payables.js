module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('payables', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      fees: {
        type: Sequelize.JSON
      },
      value: {
        type: Sequelize.DECIMAL(20, 2)
      },
      payment_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      client_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'transactions',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('payables')
  },
}
