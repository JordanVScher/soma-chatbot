
module.exports = {
	up(queryInterface, Sequelize) {
		return queryInterface.createTable('users_broadcast', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			request: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			result: {
				type: Sequelize.TEXT,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	down(queryInterface) {
		return queryInterface.dropTable('users_broadcast');
	},
};
