const cont = require('./mock_data/context');
const flow = require('../app/utils/flow');
const dialogs = require('../app/utils/dialogs');
const { sendMainMenu } = require('../app/utils/mainMenu');
const help = require('../app/utils/helper');

jest.mock('../app/soma_api');
jest.mock('../app/utils/checkQR');
jest.mock('../app/utils/mainMenu');

describe('linkUserAPI', async () => {
	it('CPF não encontrado - mostra mensagem e pede de novo', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		await dialogs.linkUserAPI(context, { error: 'not_found' });

		await expect(context.sendText).toBeCalledWith(flow.joinAsk.notFound);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});

	it('CPF encontrado - mostra mensagem e manda pro menu', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		await dialogs.linkUserAPI(context, { id: '1' });

		await expect(context.sendText).toBeCalledWith(flow.joinAsk.success);
		await expect(context.setState).toBeCalledWith({ dialog: 'mainMenu' });
	});
});

describe('handleCPF', async () => {
	it('CPF inválido - mostra mensagem e pede de novo', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.whatWasTyped = 'foobar';
		await dialogs.handleCPF(context);

		await expect(context.sendText).toBeCalledWith(flow.joinAsk.invalid);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});

	it('CPF válido - verifica se cpf está cadastrado', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.whatWasTyped = '123.123.123-11';
		await dialogs.handleCPF(context);

		await expect(context.sendText).toBeCalledWith(flow.joinAsk.notFound);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});
});

describe('schoolPoints', async () => {
	it('Fracasso ao recarregar os dados - manda mensagem de erro e vai pro menu', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		const schoolData = null;
		await dialogs.schoolPoints(context, schoolData);

		await expect(context.setState).toBeCalledWith({ schoolData });
		await expect(context.sendText).toBeCalledWith(flow.schoolPoints.failure);
		await expect(sendMainMenu).toBeCalledWith(context, false, 3 * 1000);
	});

	it('Recarrega os dados - manda mensagem e vai pro menu', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		const schoolData = { school_balance: 0, classroom_balance: 10 };

		await dialogs.schoolPoints(context, schoolData);

		await expect(context.setState).toBeCalledWith({ schoolData });
		await expect(context.sendText).toBeCalledWith(flow.schoolPoints.text1);
		const msg = await help.buildSchoolMsg(schoolData.school_balance, schoolData.classroom_balance);
		await expect(context.sendText).toBeCalledWith(msg);
		await expect(sendMainMenu).toBeCalledWith(context, false, 3 * 1000);
	});
});
