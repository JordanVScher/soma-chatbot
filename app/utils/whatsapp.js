function isWhatsapp() {
	if (this && this.session && this.session.platform === 'whatsapp') return true;
	return false;
}

async function sendMedia(mediaUrl, msg = '') {
	await this.sendText(msg, { mediaUrl: [mediaUrl] });
}


function buildWhatsappQR(qr) {
	if (!qr || !qr.quick_replies || qr.quick_replies.length === 0) return {};
	let qrText = '';
	const qrOptions = {};

	qr.quick_replies.forEach((e, i) => {
		qrText += `\n*${i + 1}.* ${e.title}`;
		qrOptions[i + 1] = { title: e.title, payload: e.payload };
	});

	return { qrText, qrOptions };
}

async function sendMsg(text, qr) {
	if (this.session.platform === 'messenger') {
		await this.sendText(text, qr);
	} else if (this.session.platform === 'whatsapp') {
		const { qrText, qrOptions } = buildWhatsappQR(qr);
		if (qrText) {
			const newText = `${text}\n${qrText}`;
			await this.sendText(newText);
			await this.setState({ qrOptions, pbOptions: null });
		} else {
			await this.sendText(text);
		}
	}
}

async function image(mediaUrl, msg = '') {
	if (this.isWhatsapp()) {
		const opt = {};
		if (mediaUrl) opt.mediaUrl = [mediaUrl];
		await this.sendText(msg, opt);
	} else {
		await this.sendImage(mediaUrl);
		if (msg) await this.sendText(msg);
	}
}

async function sendAttachment(data) {
	if (data && data.payload && data.payload.elements) {
		const { elements } = data.payload;
		const menuOption = { title: 'Voltar ao Menu', payload: 'mainMenu' };
		let text = '';
		const pbOptions = {};

		// adds menu return msg and button
		text += `*0. ${menuOption.title}*\n\n`;
		pbOptions['0'] = { title: menuOption.title, payload: menuOption.payload };

		elements.forEach((e, i) => {
			let aux = `*${i + 1}. ${e.title}*`;
			if (e.subtitle) aux += `\n${e.subtitle.trim()}`;

			text += `${aux}\n\n`;

			pbOptions[i + 1] = { title: e.title, payload: e.buttons[0].payload };
		});


		await this.sendText(text);
		await this.setState({ pbOptions, qrOptions: null });
		return { text, pbOptions };
	}

	return null;
}

async function handleWhatsapp(context) {
	context.sendMsg = sendMsg;
	context.Image = image;
	context.isWhatsapp = isWhatsapp;

	if (context.isWhatsapp()) {
		context.typing = () => { };
		context.typingOn = () => { };
		context.typingOff = () => { };

		context.sendVideo = sendMedia;
		context.sendAudio = sendMedia;
		context.sendFile = sendMedia;
		context.sendAttachment = sendAttachment;

		const profile = {};
		profile.profilePic = '';
		profile.id = context.session.user.id;
		profile.name = context.session.user.id;
		const separate = profile.name.split(':');
		profile.firstName = separate[0]; // eslint-disable-line
		profile.lastName = separate[1]; // eslint-disable-line

		await context.setState({ sessionUser: profile });
		await context.setState({ fbID: profile.lastName.replace('+', '') });

		console.log('context.state.sessionUser', context.state.sessionUser);
		console.log('context.state.fbID', context.state.fbID);
	} else if (context.session.platform === 'messenger') {
		await context.setState({ sessionUser: { ...await context.getUserProfile() } });
	}
}

module.exports = { isWhatsapp, handleWhatsapp };
