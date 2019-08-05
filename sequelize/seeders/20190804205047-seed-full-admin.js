const bcrypt = require('bcrypt')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'Addy',
          email: 'oof@baboof.troy',
          password: await bcrypt.hash('pewpew', 10),
          access_level: 'admin',
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ],
      { logging: true },
    )
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('users', null, {})
  },
}
