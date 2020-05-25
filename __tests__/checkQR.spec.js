const cont = require('./mock_data/context');
const checkQR = require('../app/utils/checkQR');

describe('buildMainMenu', () => {
	it('Não faz parte - vê botão Participar', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.linked = false;
		let res = await checkQR.buildMainMenu(context);
		res = res.quick_replies;

		await expect(res.length === 1).toBeTruthy();
		await expect(res[0].title === 'Participar').toBeTruthy();
		await expect(res[0].payload === 'join').toBeTruthy();
	});

	it('Já linkou mas não entrou token - vê botão Entrar SMS', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.linked = true;
		let res = await checkQR.buildMainMenu(context);
		res = res.quick_replies;

		await expect(res.length === 1).toBeTruthy();
		await expect(res[0].title === 'Entrar SMS').toBeTruthy();
		await expect(res[0].payload === 'activateSMS').toBeTruthy();
	});

	it('Faz parte - vê botão Meus Pontos', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.somaUser = { id: 1 };
		let res = await checkQR.buildMainMenu(context);
		res = res.quick_replies;

		await expect(res.length === 1).toBeTruthy();
		await expect(res[0].title === 'Meus Pontos').toBeTruthy();
		await expect(res[0].payload === 'myPoints').toBeTruthy();
	});

	it('Faz parte e tem dados da escola - vê botão Meus Pontos e Minha Escola', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.somaUser = { id: 1 };
		context.state.schoolData = { name: 'foobar', points: '10', turmaPoints: '10' };
		let res = await checkQR.buildMainMenu(context);
		res = res.quick_replies;

		await expect(res.length === 2).toBeTruthy();
		await expect(res[0].title === 'Meus Pontos').toBeTruthy();
		await expect(res[0].payload === 'myPoints').toBeTruthy();
		await expect(res[1].title === 'Minha Escola').toBeTruthy();
		await expect(res[1].payload === 'schoolPoints').toBeTruthy();
	});
});
