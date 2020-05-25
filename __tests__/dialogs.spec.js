const cont = require('./mock_data/context');
const flow = require('../app/utils/flow');
const dialogs = require('../app/utils/dialogs');
const attach = require('../app/utils/attach');
const product = require('../app/utils/product');
const { sendMainMenu } = require('../app/utils/mainMenu');
const help = require('../app/utils/helper');

jest.mock('../app/soma_api');
jest.mock('../app/utils/checkQR');
jest.mock('../app/utils/mainMenu');
jest.mock('../app/utils/attach');

const baseBalance = {
	balance: 100,
	user_plastic: 10,
};

const baseRewards = [
	{
		id: '1',
		name: 'Caneta Azul',
		description: 'Uma caneta azul comum',
		score: 10,
		img: 'www.foobar.com',
	},
	{
		id: '2',
		name: 'Estojo',
		description: 'Um estojo',
		score: 12,
		img: 'www.foobar.com',
	},
];

describe('linkUserAPI', () => {
	const cpf = '123';
	it('200 - CPF encontrado - mostra mensagem e manda pro menu', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		await dialogs.linkUserAPI(context, cpf, { statusCode: 200 });

		await expect(context.sendText).toBeCalledWith(flow.joinAsk.success);
		await expect(context.setState).toBeCalledWith({ cpf, linked: true });
		await expect(context.setState).toBeCalledWith({ dialog: 'activateSMS' });
	});

	it('404 - CPF não encontrado - mostra mensagem e pede de novo', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		await dialogs.linkUserAPI(context, cpf, { statusCode: 404 });

		await expect(context.sendText).toBeCalledWith(flow.joinAsk.notFound);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});

	it('409 - CPF repetido - mostra mensagem e pede de novo', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		await dialogs.linkUserAPI(context, cpf, { statusCode: 409 });

		await expect(context.sendText).toBeCalledWith(flow.joinAsk.alreadyLinked);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});

	it('400 - Outro status - mostra mensagem e pede de novo', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		await dialogs.linkUserAPI(context, cpf, { statusCode: 400 });

		await expect(context.sendText).toBeCalledWith(flow.joinAsk.notFound);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});
});

describe('handleCPF', () => {
	it('CPF inválido - mostra mensagem e pede de novo', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.whatWasTyped = 'foobar';
		await dialogs.handleCPF(context);

		await expect(context.sendText).toBeCalledWith(flow.joinAsk.invalid);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});

	// it('CPF válido - verifica se cpf está cadastrado', async () => {
	// 	const context = cont.quickReplyContext('greetings', 'greetings');
	// 	context.state.whatWasTyped = '123.123.123-11';
	// 	await dialogs.handleCPF(context);

	// 	await expect(context.sendText).not.toBeCalledWith(flow.joinAsk.invalid);
	// });
});

describe('schoolPoints', () => {
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

describe('checkData', () => {
	it('Falha ao carregar userBalance - manda msg de erro e volta pro menu', async () => {
		const context = cont.quickReplyContext('foobar');
		const userBalance = null;
		const rewards = null;

		await dialogs.myPoints(context, userBalance, rewards);

		await expect(context.sendText).toBeCalledWith(flow.myPoints.failure);
		await expect(sendMainMenu).toBeCalledWith(context);
	});

	it('Falha ao carregar rewards - manda msg de erro e volta pro menu', async () => {
		const context = cont.quickReplyContext('foobar');
		const userBalance = { foobar: true };
		const rewards = { error: 'foobar' };

		await dialogs.myPoints(context, userBalance, rewards);

		await expect(context.sendText).toBeCalledWith(flow.myPoints.failure);
		await expect(sendMainMenu).toBeCalledWith(context);
	});
});

describe('myPoints', () => {
	it('Usuário não tem nenhum ponto - Vê msg e vai pro menu', async () => {
		const context = cont.quickReplyContext('foobar');
		const userBalance = { ...baseBalance };
		userBalance.balance = 0;
		context.state.userBalance = userBalance;
		const rewards = { ...baseRewards };

		await dialogs.myPoints(context, userBalance, rewards);

		await expect(context.setState).toBeCalledWith({ userBalance });
		await expect(context.sendText).toBeCalledWith(flow.myPoints.noPoints);
		await expect(sendMainMenu).toBeCalledWith(context);
	});

	it('Usuário pode comprar algo - Vê msg que oferece troca', async () => {
		const context = cont.quickReplyContext('foobar');
		const userBalance = { ...baseBalance };
		const rewards = [...baseRewards];
		userBalance.balance = 20;
		context.state.userBalance = userBalance;

		await dialogs.myPoints(context, userBalance, rewards);

		await expect(context.setState).toBeCalledWith({ userBalance });
		await expect(context.sendText).toBeCalledWith(flow.myPoints.showPoints
			.replace('<KILOS>', context.state.userBalance.user_plastic)
			.replace('<POINTS>', context.state.userBalance.balance));
		await expect(context.sendText).toBeCalledWith(flow.myPoints.hasEnough, await attach.getQR(flow.myPoints));
	});

	it('Usuário não pode comprar nada - Vê msg que oferece ver todos', async () => {
		const context = cont.quickReplyContext('foobar');
		const userBalance = { ...baseBalance };
		const rewards = [...baseRewards];
		userBalance.balance = 1;
		context.state.userBalance = userBalance;

		await dialogs.myPoints(context, userBalance, rewards);

		await expect(context.setState).toBeCalledWith({ userBalance });
		await expect(context.sendText).toBeCalledWith(flow.myPoints.showPoints
			.replace('<KILOS>', context.state.userBalance.user_plastic)
			.replace('<POINTS>', context.state.userBalance.balance));

		const cheapest = await product.getSmallestPoint(rewards);
		await expect(context.sendText).toBeCalledWith(flow.myPoints.notEnough.replace('<POINTS>', cheapest), await attach.getQR(flow.notEnough));
	});
});

describe('showProducts', () => {
	it('Usuário pode comprar algo - Vê msg que oferece troca', async () => {
		const context = cont.quickReplyContext('foobar');
		const userBalance = { ...baseBalance };
		const rewards = [...baseRewards];
		userBalance.balance = 20;
		context.state.userBalance = userBalance;

		await dialogs.showProducts(context, userBalance, rewards);

		await expect(context.setState).toBeCalledWith({ userBalance });

		await expect(context.sendText).toBeCalledWith(flow.showProducts.text1, await attach.getQR(flow.showProducts));
	});

	it('Usuário não pode comprar nada - Vê duas msgs e todos os produtos', async () => {
		const context = cont.quickReplyContext('foobar');
		const userBalance = { ...baseBalance };
		const rewards = [...baseRewards];
		userBalance.balance = 1;
		context.state.userBalance = userBalance;

		await dialogs.showProducts(context, userBalance, rewards);

		await expect(context.setState).toBeCalledWith({ userBalance });

		await expect(context.sendText).toBeCalledWith(flow.showProducts.noPoints1);
		await expect(context.sendText).toBeCalledWith(flow.showProducts.noPoints2);
		// viewAllProducts
		await expect(attach.sendAllProductsCarrousel).toBeCalledWith(context, context.state.userBalance.balance, rewards, 1);
		await expect(sendMainMenu).toBeCalledWith(context, null, 1000 * 3);
	});
});

describe('viewAllProducts', () => {
	it('Sucesso - manda o carrousel com todos os produtos e o menu', async () => {
		const context = cont.quickReplyContext('foobar');
		const userBalance = { ...baseBalance };
		const rewards = [...baseRewards];
		const pageNumber = 1;

		await dialogs.viewAllProducts(context, userBalance, rewards, pageNumber);

		await expect(attach.sendAllProductsCarrousel).toBeCalledWith(context, userBalance.balance, rewards, pageNumber);
		await expect(sendMainMenu).toBeCalledWith(context, null, 1000 * 3);
	});
});

describe('viewUserProducts', () => {
	it('Sucesso - manda o carrousel com os produtos do e o menu', async () => {
		const context = cont.quickReplyContext('foobar');
		const userBalance = { ...baseBalance };
		const rewards = [...baseRewards];
		const pageNumber = 1;


		await dialogs.viewUserProducts(context, userBalance, rewards, pageNumber);

		await expect(attach.sendUserProductsCarrousel).toBeCalledWith(context, userBalance.balance, rewards, pageNumber);
		await expect(sendMainMenu).toBeCalledWith(context, null, 1000 * 3);
	});
});
