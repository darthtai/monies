module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      number: {
        type: Sequelize.STRING
      },
      bearer_name: {
        type: Sequelize.STRING
      },
      cvv: {
        type: Sequelize.STRING
      },
      valid_date: {
        type: Sequelize.DATEONLY
      },
      payment_method: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      value: {
        type: Sequelize.DECIMAL(20, 2)
      },
      client_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('transactions');
  }
};