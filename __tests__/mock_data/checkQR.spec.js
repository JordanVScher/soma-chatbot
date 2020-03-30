const cont = require('./context');
const checkQR = require('../app/utils/checkQR');


jest.mock('../app/utils/prep_api');
jest.mock('../app/utils/consulta');
jest.mock('../app/utils/consulta-aux');

describe('checkMainMenu', async () => {
	it('não acabou publico_interesse, não tem Token de integração -> Vê botões Quiz e Já Tomo PrEP', async () => {
		const context = cont.quickReplyContext('greetings', 'greetings');
		context.state.user = { is_target_audience: 0 }; context.state.currentQuestion = { code: 'a5' };
		context.state.publicoInteresseEnd = false;
		const result = await checkQR.checkMainMenu(context);

		await expect(result.quick_replies.length === 5).toBeTruthy();
		await expect(result.quick_replies[0].title === 'Bater Papo').toBeTruthy();
		await expect(result.quick_replies[1].title === 'Quiz').toBeTruthy();
		await expect(result.quick_replies[1].payload === 'beginQuiz').toBeTruthy();
		await expect(result.quick_replies[2].title === 'Prevenções').toBeTruthy();
		await expect(result.quick_replies[3].title === 'Já Tomo PrEP').toBeTruthy();
		await expect(result.quick_replies[4].title === 'Sobre a Amanda').toBeTruthy();
	});
});
