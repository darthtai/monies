const Sequelize = require('sequelize');
const sequelize = require('../../util/sequelize');

const UserFactory = ({ sequelize }) => {
  const User = sequelize.define('users', {
    name: Sequelize.STRING,
    email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true,
      },
    },
    password: Sequelize.STRING,
    access_level: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  });

  return User;
};

const factory = (state = { sequelize }) => UserFactory(state);

module.exports = factory;
