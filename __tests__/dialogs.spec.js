const cont = require('./mock_data/context');
const flow = require('../app/utils/flow');
const dialogs = require('../app/utils/dialogs');
const attach = require('../app/utils/attach');
const { sendMainMenu } = require('../app/utils/mainMenu');
const help = require('../app/utils/helper');
const somaAPI = require('../app/soma_api');
const assistenteAPI = require('../app/chatbot_api');
const somaApiData = require('./mock_data/somaApiData');

jest.mock('../app/utils/checkQR');
jest.mock('../app/utils/mainMenu');
jest.mock('../app/utils/attach');
jest.mock('../app/soma_api');
jest.mock('../app/chatbot_api');

jest
	.spyOn(somaAPI, 'linkUser')
	.mockImplementation((fbId, cpf) => somaApiData.linkUser[cpf]);

jest
	.spyOn(somaAPI, 'activateToken')
	.mockImplementation((fbId, cpf, token) => somaApiData.activateToken[token]);

jest
	.spyOn(somaAPI, 'getUserRewards')
	.mockImplementation(() => somaApiData.getUserRewards);

jest
	.spyOn(somaAPI, 'getUserBalance')
	.mockImplementation((fbId, userId) => somaApiData.getUserBalance[userId]);

jest
	.spyOn(somaAPI, 'getSchoolBalance')
	.mockImplementation((fbId, userId) => somaApiData.getSchoolBalance[userId]);

jest
	.spyOn(assistenteAPI, 'getTicketTypes')
	.mockImplementation(() => [{ ticket_type_id: 1, id: 1 }, { ticket_type_id: 2, id: 2 }]);
jest
	.spyOn(assistenteAPI, 'postNewTicket')
	.mockImplementation(id => (id === 1 ? { id: 1000 } : false));


describe('sendPointsMsg', () => {
	const fullMsg = flow.schoolPoints.text2;
	const pointMsg = flow.schoolPoints.text3;

	it('No kilos - send pointMsg', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		const userBalance = 100;
		const residues = [];
		await dialogs.sendPointsMsg(context, residues, userBalance, fullMsg, pointMsg);

		await expect(context.sendText).toBeCalledWith(pointMsg.replace('<POINTS>', userBalance));
	});

	it('With kilos - send fullMsg', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		const userBalance = 100;
		const residues = [
			{ name: 'foo', amount: 10, unitType: 'Kilogram' },
			{ name: 'bar', amount: 15, unitType: 'Kilogram' },
		];
		const expectedKilos = 25;
		await dialogs.sendPointsMsg(context, residues, userBalance, fullMsg, pointMsg);

		await expect(context.sendText).toBeCalledWith(fullMsg.replace('<KILOS>', expectedKilos).replace('<POINTS>', userBalance));
	});
});

describe('schoolPoints', () => {
	const fullMsg = flow.schoolPoints.text2;
	const pointMsg = flow.schoolPoints.text3;
	it('schoolData has kilos and points - send full message and goes to menu', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.somaUser = { id: 1 };
		const expectedKilos = 25;
		const expectedBalance = 1000;

		await dialogs.schoolPoints(context);

		await expect(context.setState).toBeCalled();
		await expect(context.sendText).toBeCalledWith(flow.schoolPoints.text1);

		await expect(context.sendText).toBeCalledWith(fullMsg.replace('<KILOS>', expectedKilos).replace('<POINTS>', expectedBalance));
		await expect(context.sendText).not.toBeCalledWith(flow.schoolPoints.failure);
		await expect(sendMainMenu).toBeCalledWith(context, false, 3 * 1000);
	});

	it('schoolData has no kilos - send points message and goes to menu', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.somaUser = { id: 2 };
		const expectedBalance = 1000;

		await dialogs.schoolPoints(context);

		await expect(context.setState).toBeCalled();
		await expect(context.sendText).toBeCalledWith(flow.schoolPoints.text1);

		await expect(context.sendText).toBeCalledWith(pointMsg.replace('<POINTS>', expectedBalance));
		await expect(context.sendText).not.toBeCalledWith(flow.schoolPoints.failure);
		await expect(sendMainMenu).toBeCalledWith(context, false, 3 * 1000);
	});

	it('Failure retrieving schoolData - send failure message and goes to menu', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.somaUser = { id: 3 };

		await dialogs.schoolPoints(context);

		await expect(context.setState).toBeCalled();
		await expect(context.sendText).not.toBeCalledWith(flow.schoolPoints.text1);
		await expect(context.sendText).toBeCalledWith(flow.schoolPoints.failure);
		await expect(sendMainMenu).toBeCalledWith(context, false, 3 * 1000);
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

	it('CPF válido - verifica se cpf está cadastrado', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.whatWasTyped = '123.123.123-11';
		await dialogs.handleCPF(context);

		await expect(context.sendText).not.toBeCalledWith(flow.joinAsk.invalid);
	});
});

describe('linkUserAPI', () => {
	it('200 - CPF encontrado - mostra mensagem e manda pro menu', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		const cpf = 1;
		await dialogs.linkUserAPI(context, cpf);

		await expect(somaAPI.linkUser).toBeCalledWith(context.session.user.id, cpf);
		await expect(context.sendText).toBeCalledWith(flow.joinAsk.success);
		await expect(context.setState).toBeCalledWith({ cpf, linked: true });
		await expect(context.setState).toBeCalledWith({ dialog: 'activateSMS' });
	});

	it('404 - CPF não encontrado - mostra mensagem de erro e pede de novo', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		const cpf = 2;
		await dialogs.linkUserAPI(context, cpf);

		await expect(somaAPI.linkUser).toBeCalledWith(context.session.user.id, cpf);
		await expect(context.sendText).toBeCalledWith(flow.joinAsk.notFound);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});

	it('409 - CPF repetido - mostra mensagem de erro e pede de novo', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		const cpf = 3;
		await dialogs.linkUserAPI(context, cpf);

		await expect(somaAPI.linkUser).toBeCalledWith(context.session.user.id, cpf);
		await expect(context.sendText).toBeCalledWith(flow.joinAsk.alreadyLinked);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});

	it('400 - Outro status - mostra mensagem de erro e pede de novo', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		const cpf = 4;
		await dialogs.linkUserAPI(context, cpf);

		await expect(somaAPI.linkUser).toBeCalledWith(context.session.user.id, cpf);
		await expect(context.sendText).toBeCalledWith(flow.joinAsk.notFound);
		await expect(context.setState).toBeCalledWith({ dialog: 'joinAsk' });
	});
});

describe('handleSMS', () => {
	it('Valid Token - manda mensagem, salva somaUser e vai pro menu', async () => {
		const context = cont.quickReplyContext();
		context.state.whatWasTyped = 1;
		const somaUser = somaApiData.activateToken[context.state.whatWasTyped];
		await dialogs.handleSMS(context);

		await expect(somaAPI.activateToken).toBeCalledWith(context.session.user.id, context.state.cpf, context.state.whatWasTyped);
		await expect(context.sendText).toBeCalledWith(flow.SMSToken.success);
		await expect(context.setState).toBeCalledWith({ somaUser });
		await expect(context.setState).toBeCalledWith({ dialog: 'mainMenu' });
	});

	it('invalid Token - manda mensagem de erro e tenta de novo', async () => {
		const context = cont.quickReplyContext();
		context.state.whatWasTyped = 2;
		await dialogs.handleSMS(context);

		await expect(somaAPI.activateToken).toBeCalledWith(context.session.user.id, context.state.cpf, context.state.whatWasTyped);
		await expect(context.sendText).toBeCalledWith(flow.SMSToken.error);
		await expect(context.setState).toBeCalledWith({ dialog: 'activateSMSAsk' });
	});
});

describe('checkData', () => {
	it('Tudo certo - segue fluxo', async () => {
		const context = cont.quickReplyContext();
		const userBalance = { balance: 10 };
		const rewards = [{ id: 1 }];

		const res = await dialogs.checkData(context, userBalance, rewards);
		await expect(context.setState).toBeCalledWith({ userBalance, rewards });
		await expect(res).toBe(true);
	});

	it('Falha ao carregar userBalance - manda msg de erro e volta pro menu', async () => {
		const context = cont.quickReplyContext();
		const userBalance = null;
		const rewards = [{ id: 1 }];

		const res = await dialogs.checkData(context, userBalance, rewards);
		await expect(context.setState).toBeCalledWith({ userBalance, rewards });
		await expect(context.sendText).toBeCalledWith(flow.myPoints.failure);
		await expect(sendMainMenu).toBeCalledWith(context);
		await expect(res).toBe(false);
	});

	it('Falha ao carregar rewards - manda msg de erro e volta pro menu', async () => {
		const context = cont.quickReplyContext();
		const userBalance = { balance: 10 };
		const rewards = null;

		const res = await dialogs.checkData(context, userBalance, rewards);
		await expect(context.setState).toBeCalledWith({ userBalance, rewards });
		await expect(context.sendText).toBeCalledWith(flow.myPoints.failure);
		await expect(sendMainMenu).toBeCalledWith(context);
		await expect(res).toBe(false);
	});
});

describe('viewUserProducts', () => {
	it('Request deu certo - manda Products Carrousel', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: 1 };

		jest.spyOn(help, 'getAffortableRewards');
		jest.spyOn(help, 'orderRewards');

		await dialogs.viewUserProducts(context, 1);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(help.getAffortableRewards).toBeCalled();
		await expect(help.orderRewards).toBeCalled();
		await expect(attach.sendUserProductsCarrousel).toBeCalled();
		await expect(sendMainMenu).toBeCalledWith(context, null, 1000 * 3);
	});

	it('Request deu errado - não manda Products Carrousel e vai pro menu', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: null };

		await dialogs.viewUserProducts(context, 1);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(sendMainMenu).toBeCalledWith(context);
	});
});

describe('viewAllProducts', () => {
	it('Request deu certo - manda Products Carrousel', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: 1 };

		await dialogs.viewAllProducts(context, 1);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(attach.sendUserProductsCarrousel).toBeCalled();
		await expect(sendMainMenu).toBeCalledWith(context, null, 1000 * 3);
	});

	it('Request deu errado - não manda Products Carrousel e vai pro menu', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: null };

		await dialogs.viewAllProducts(context, 1);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(sendMainMenu).toBeCalledWith(context);
	});
});

describe('showProducts', () => {
	jest.spyOn(help, 'getSmallestPoint');
	jest.spyOn(dialogs, 'viewAllProducts');

	it('Usuário consegue trocar - vê opções de escolha', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: 1 };

		await dialogs.showProducts(context);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(help.getSmallestPoint).toBeCalled();
		await expect(context.sendText).toBeCalledWith(flow.showProducts.text1, await attach.getQR(flow.showProducts));
	});

	it('Usuário não consegue trocar - vê duas mensagens e Carrousel como todos os produtos', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: 2 };

		await dialogs.showProducts(context);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(help.getSmallestPoint).toBeCalled();
		await expect(context.sendText).toBeCalledWith(flow.showProducts.noPoints1);
		await expect(context.sendText).toBeCalledWith(flow.showProducts.noPoints2);
		await expect(dialogs.viewAllProducts).toBeCalled();
	});

	it('Request deu errado - não manda Products Carrousel e vai pro menu', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: null };

		await dialogs.showProducts(context, 1);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(sendMainMenu).toBeCalledWith(context);
	});
});

describe('myPoints', () => {
	const fullMsg = flow.myPoints.showPoints;
	const pointMsg = flow.myPoints.onlyPoints;

	jest.spyOn(help, 'getSmallestPoint');

	it('Usuário pode comprar e tem kilos - vê mensagem completa e opções de escolha', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: 1 };
		const expectedKilos = 18;
		const expectedBalance = 10000;

		await dialogs.myPoints(context);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(context.sendText).toBeCalledWith(fullMsg.replace('<KILOS>', expectedKilos).replace('<POINTS>', expectedBalance));
		await expect(help.getSmallestPoint).toBeCalled();
		await expect(context.sendText).toBeCalledWith(flow.myPoints.hasEnough, await attach.getQR(flow.myPoints));
	});

	it('Usuário não pode comprar e não tem kilos - vê mensagem de pontos e outras opções', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: 2 };
		const expectedBalance = 100;
		const cheapestScore = 500;

		await dialogs.myPoints(context);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(context.sendText).toBeCalledWith(pointMsg.replace('<POINTS>', expectedBalance));
		await expect(help.getSmallestPoint).toBeCalled();
		await expect(context.sendText).toBeCalledWith(flow.myPoints.notEnough.replace('<POINTS>', cheapestScore), await attach.getQR(flow.notEnough));
	});

	it('Usuário não tem ponto nenhum - vê mensagem avisando e vai pro menu', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: 3 };

		await dialogs.myPoints(context);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(context.sendText).toBeCalledWith(flow.myPoints.noPoints);
		await expect(sendMainMenu).toBeCalledWith(context);
	});
});

describe('productBuyHelp', () => {
	it('Salva informações do produto escolhido', async () => {
		const button = 'productBuy1';
		const context = cont.quickReplyContext('', button);

		await dialogs.productBuyHelp(context, button);
		await expect(context.setState).toBeCalledWith({ dialog: 'productBuy', productId: button.replace('productBuy', '') });
		await expect(context.setState).toBeCalledWith({ productBtnClicked: button, paginationNumber: 0 });
	});
});

describe('sendRewardtext', () => {
	jest.spyOn(help, 'buildProductView');

	it('Tem recompensa - Manda mensagem', async () => {
		const context = cont.quickReplyContext();
		const reward = { id: 1, name: 'Foobar' };
		await dialogs.sendRewardtext(context, reward);
		await expect(help.buildProductView).toBeCalledWith(reward);
		await expect(context.sendText).toBeCalled();
	});

	it('Não tem recompensa - Não manda mensagem', async () => {
		const context = cont.quickReplyContext();
		const reward = {};
		await dialogs.sendRewardtext(context, reward);
		await expect(help.buildProductView).toBeCalledWith(reward);
		await expect(context.sendText).not.toBeCalled();
	});
});

describe('productBuy', () => {
	jest.spyOn(help, 'calculateProductUnits');
	jest.spyOn(help, 'buildQtdButtons');
	jest.spyOn(dialogs, 'sendRewardtext');

	it('Tudo certo - vê texto do produto e manda confirmação', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: 1 };
		context.state.productId = 1;
		const desiredRewardName = somaApiData.getUserRewards[0].name;

		await dialogs.productBuy(context);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(dialogs.sendRewardtext).toBeCalled();
		await expect(help.calculateProductUnits).toBeCalled();
		await expect(help.buildQtdButtons).toBeCalled();

		await expect(context.sendText).toBeCalledWith(
			flow.rewardQtd.text1.replace('<PRODUTO>', desiredRewardName), await attach.buildQtdButtons(context.state.qtdButtons, 3, 1),
		);
	});

	it('Usuário não tem mais pontos pra comprar o produto - vê texto do produto, mensagem de erro e lista com todas as opções', async () => {
		const context = cont.quickReplyContext();
		context.state.somaUser = { id: 2 };
		context.state.productId = 1;

		await dialogs.productBuy(context);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(dialogs.sendRewardtext).toBeCalled();
		await expect(help.calculateProductUnits).toBeCalled();

		await expect(context.sendText).toBeCalledWith(flow.rewardQtd.priceChanged);
		await expect(dialogs.viewAllProducts).toBeCalled();
	});

	it('Produto não encontrado - vê msg de erro e lista com todas as opções', async () => {
		const context = cont.quickReplyContext();

		context.state.somaUser = { id: 1 };
		context.state.productId = 2666;

		await dialogs.productBuy(context);
		await expect(somaAPI.getUserRewards).toBeCalledWith(context.session.user.id, context.state.somaUser.id);
		await expect(somaAPI.getUserBalance).toBeCalledWith(context.session.user.id, context.state.somaUser.id);

		await expect(context.sendText).toBeCalledWith(flow.rewardQtd.notFound);
		await expect(dialogs.viewAllProducts).toBeCalled();
	});
});


describe('rewardQtd', () => {
	it('salva dados e manda mensagem', async () => {
		const context = cont.quickReplyContext();
		context.state.desiredReward = {};
		context.state.userBalance = {};

		await dialogs.rewardQtd(context);
		await expect(context.setState).toBeCalledWith({ rewardPrice: context.state.desiredReward.score * context.state.rewardQtd });
		await expect(context.setState).toBeCalledWith({ userPointsLeft: context.state.userBalance.balance - context.state.rewardPrice });

		await expect(context.sendText).toBeCalled();
	});
});
