module.exports = (sequelize, DataTypes) => {
	const usersBroadcast = sequelize.define(
		'users_broadcast', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			request: { type: DataTypes.JSON, field: 'request' },
			result: { type: DataTypes.JSON, field: 'result' },
			createdAt: { type: DataTypes.DATE, field: 'created_at' },
			updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
		},
		{
			freezeTableName: true,
		},
	);

	return usersBroadcast;
};
