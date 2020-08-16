const Sequelize = require('sequelize');
const config = require('../config/config');
const usersBroadcastModel = require('./users_broadcast');

const sequelizeArgs = [config.database, config.username, config.password, config];

const sequelize = new Sequelize(...sequelizeArgs);
const models = {
	usersBroadcast: usersBroadcastModel.init(sequelize, Sequelize),
};

Object.values(models)
	.filter(model => typeof model.associate === 'function')
	.forEach(model => model.associate(models));

const { usersBroadcast } = models;

module.exports = {
	sequelize,
	Sequelize,
	usersBroadcast,
};
