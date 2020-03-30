const help = require('../app/utils/helper');

describe('buildSchoolMsg', async () => {
	it('Sem pontos - retorna undefined', async () => {
		const schoolBalance = null;
		const classroomBalance = null;
		const res = await help.buildSchoolMsg(schoolBalance, classroomBalance);

		await expect(res === undefined).toBeTruthy();
	});

	it('Pontos de escola inválidos - retorna undefined', async () => {
		const schoolBalance = 'foobar';
		const classroomBalance = null;
		const res = await help.buildSchoolMsg(schoolBalance, classroomBalance);

		await expect(res === undefined).toBeTruthy();
	});

	it('Pontos de escola zerados - retorna frase adequada', async () => {
		const schoolBalance = '0';
		const classroomBalance = null;
		const res = await help.buildSchoolMsg(schoolBalance, classroomBalance);

		await expect(res && typeof res === 'string').toBeTruthy();
		await expect(res.includes('😟')).toBeTruthy();
	});

	it('Pontos de escola normais, sem turma  - retorna frase adequada', async () => {
		const schoolBalance = '10';
		const classroomBalance = null;
		const res = await help.buildSchoolMsg(schoolBalance, classroomBalance);

		await expect(res && typeof res === 'string').toBeTruthy();
		await expect(res.includes(schoolBalance)).toBeTruthy();
		await expect(res.includes('😊')).toBeTruthy();
	});

	it('Pontos de escola normais e turma zerada  - retorna frase adequada', async () => {
		const schoolBalance = '10';
		const classroomBalance = 0;
		const res = await help.buildSchoolMsg(schoolBalance, classroomBalance);

		await expect(res && typeof res === 'string').toBeTruthy();
		await expect(res.includes(schoolBalance)).toBeTruthy();
		await expect(res.includes('😟')).toBeTruthy();
	});

	it('Pontos de escola normais e turma normais  - retorna frase adequada', async () => {
		const schoolBalance = '10';
		const classroomBalance = 20;
		const res = await help.buildSchoolMsg(schoolBalance, classroomBalance);

		await expect(res && typeof res === 'string').toBeTruthy();
		await expect(res.includes(schoolBalance)).toBeTruthy();
		await expect(res.includes(classroomBalance)).toBeTruthy();
		await expect(res.includes('😊')).toBeTruthy();
	});
});
