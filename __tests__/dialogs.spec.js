const cont = require('./mock_data/context');
const flow = require('../app/utils/flow');
const dialogs = require('../app/utils/dialogs');

jest.mock('../app/utils/checkQR');
jest.mock('../app/soma_api.js');

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
