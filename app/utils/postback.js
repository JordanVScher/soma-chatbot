require('dotenv').config();

const { MessengerClient } = require('messaging-api-messenger');
const config = require('../../bottender.config.js').channels.messenger;
const { sentryError } = require('./helper');

const client = MessengerClient.connect({
	accessToken: config.accessToken,
	appSecret: config.appSecret,
});

async function checkUserOnLabel(UserID, labelID) { // checks if user is on the label
	try {
		const userLabels = await client.getAssociatedLabels(UserID);
		const theOneLabel = await userLabels.data.find(x => x.id === `${labelID}`); // find the one label with the same ID

		if (theOneLabel) { // if we found the label on the user
			return theOneLabel;
		}
		return false;
	} catch (error) {
		return sentryError('Erro em checkUserOnLabel', error);
	}
}

async function checkUserOnLabelName(userID, labelName) { // checks if user is on the label
	try {
		const allLabels = await client.getLabelList();
		if (allLabels && allLabels.data && allLabels.data.length > 0) {
			const theOneLabel = await allLabels.data.find(x => x.name === labelName);
			if (theOneLabel && theOneLabel.id) {
				return checkUserOnLabel(userID, theOneLabel.id);
			}
			return false;
		}
		return false;
	} catch (error) {
		return sentryError('Erro em checkUserOnLabelName', error);
	}
}


async function getLabelID(labelName) {
	try {
		const labelList = await client.getLabelList();

		const theOneLabel = await labelList.data.find(x => x.name === `${labelName}`);
		if (theOneLabel && theOneLabel.id) { // check if label exists
			return theOneLabel.id;
		}
		const newLabel = await client.createLabel(labelName);
		if (newLabel) {
			return newLabel.id;
		}
		return undefined;
	} catch (error) {
		return sentryError('Erro em getLabelID', error);
	}
}

// Associates user to a label. Pass in the custom label id and the user psid
// associatesLabelToUser('123123', process.env.LABEL_ADMIN);
async function associatesLabelToUser(userID, labelName) {
	try {
		const labelID = await getLabelID(labelName);

		if (await checkUserOnLabel(userID, labelID) === true) { return true; }

		// const userLabels = await client.getAssociatedLabels(userID);
		// if (userLabels.data.length >= 20) { // actual facebook limit is 25 (by limit i mean before pagination starts to act up)
		// 	userLabels.data.forEach(async (element) => {
		// 		if (element.id !== process.env.LABEL_ADMIN) { // remove every tag except for admin
		// 			client.dissociateLabel(userID, element.id);
		// 		}
		// 	});
		// }
		try {
			return client.associateLabel(userID, labelID);
		} catch (error) {
			return sentryError('Erro em associateLabel', error);
		}
	} catch (error) {
		return sentryError('Erro em associatesLabelToUser', error);
	}
}

async function printNewLabel(labelName) {
	const newLabel = await client.createLabel(labelName);
	console.log('newLabel =>', newLabel);
	return newLabel;
}

module.exports = {
	checkUserOnLabel, associatesLabelToUser, getLabelID, printNewLabel, checkUserOnLabelName,
};
