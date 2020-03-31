const attach = require('../app/utils/attach');

describe('buildPagination', () => {
	const pivot = 7;
	it('Just one page', async () => {
		const totalProducts = 5;
		const pageNumber = 1;

		const { startAt, limit } = await attach.buildPagination(totalProducts, pageNumber);

		await expect(startAt).toBe(0);
		await expect(limit).toBe(totalProducts);
	});

	it('3 pages - on the first', async () => {
		const totalProducts = 20;
		const pageNumber = 1;

		const { startAt, limit } = await attach.buildPagination(totalProducts, pageNumber);

		await expect(startAt).toBe(0);
		await expect(limit).toBe(pivot);
		await expect(limit < totalProducts).toBeTruthy();
	});

	it('3 pages - on the second', async () => {
		const totalProducts = 20;
		const pageNumber = 2;

		const { startAt, limit } = await attach.buildPagination(totalProducts, pageNumber);

		await expect(startAt).toBe(8);
		await expect(limit < totalProducts).toBeTruthy();
		await expect(limit).toBe(startAt + pivot);
	});

	it('3 pages - on the third', async () => {
		const totalProducts = 20;
		const pageNumber = 3;

		const { startAt, limit } = await attach.buildPagination(totalProducts, pageNumber);
		await expect(startAt).toBe(16);
		await expect(limit).toBe(totalProducts);
	});
});

describe('addPaginationButtons', () => {
	const elements = [{}];
	const payload = 'foobar';
	it('First page, no more rewards - adds nothing', async () => {
		const pageNumber = 1;
		const res = await attach.addPaginationButtons([...elements], pageNumber, false, payload);

		await expect(res.length).toBe(1);
	});

	it('First page, more rewards - adds Próximo', async () => {
		const pageNumber = 1;
		const res = await attach.addPaginationButtons([...elements], pageNumber, true, payload);

		await expect(res.length).toBe(2);
		await expect(res[1].buttons[0].title).toBe('Próximo');
		await expect(res[1].buttons[0].payload).toBe(`${payload}${pageNumber + 1}`);
	});

	it('Second page, no more rewards - adds Anterior', async () => {
		const pageNumber = 2;
		const res = await attach.addPaginationButtons([...elements], pageNumber, false, payload);

		await expect(res.length).toBe(2);
		await expect(res[0].buttons[0].title).toBe('Anterior');
		await expect(res[0].buttons[0].payload).toBe(`${payload}${pageNumber - 1}`);
	});

	it('Second page, more rewards - adds Anterior and Próximo', async () => {
		const pageNumber = 2;
		const res = await attach.addPaginationButtons([...elements], pageNumber, true, payload);

		await expect(res.length).toBe(3);
		await expect(res[0].buttons[0].title).toBe('Anterior');
		await expect(res[0].buttons[0].payload).toBe(`${payload}${pageNumber - 1}`);
		await expect(res[2].buttons[0].title).toBe('Próximo');
		await expect(res[2].buttons[0].payload).toBe(`${payload}${pageNumber + 1}`);
	});
});
