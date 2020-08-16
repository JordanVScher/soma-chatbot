const { Model } = require('sequelize');

const usersBroadcast = class ApiData extends Model {
	static init(sequelize, DataTypes) {
		return super.init({
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			request: {
				type: DataTypes.JSON,
				field: 'request',
			},
			result: {
				type: DataTypes.JSON,
				field: 'result',
			},
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE,
				field: 'created_at',
			},
			updatedAt: {
				allowNull: false,
				type: DataTypes.DATE,
				field: 'updated_at',
			},
		}, {
			sequelize,
			modelName: 'users_broadcast',
			freezeTableName: true,
		});
	}
};

module.exports = usersBroadcast;
