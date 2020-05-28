module.exports = {
	linkUser: {
		12312312311: {
			statusCode: 200,
		},
		1: {
			statusCode: 200,
		},
		2: {
			statusCode: 404,
		},
		3: {
			statusCode: 409,
		},
		4: {
			statusCode: 400,
		},
	},
	activateToken: {
		1: { id: 1, statusCode: 200 },
		2: { statusCode: 404 },
	},
	getUserRewards: [
		{
			id: '1',
			name: 'Caderno',
			description: 'Capa Amarela',
			score: 500,
			imageUrl: null,
			category: 'Material',
		},
		{
			id: '2',
			name: '50% de desconto nos cursos de inglês e alemão + matrícula',
			description: '',
			score: 1500,
			imageUrl: null,
			category: 'Cursos',
		},
		{
			id: '3',
			name: 'Arroz 5kg',
			description: 'Branco',
			score: 600,
			imageUrl: null,
			category: 'Alimentação',
		},
	],

	getUserBalance: {
		1: {
			balance: 10000,
			residues: [
				{
					name: 'Caixa De Leite',
					amount: 10,
					unitType: 'Unit',
				},
				{
					name: 'Latinhas de Alumínio',
					amount: 10,
					unitType: 'Kilogram',
				},
				{
					name: 'Papel',
					amount: 8,
					unitType: 'Kilogram',
				},
			],
		},
		2: {
			balance: 100,
			residues: [
				{
					name: 'Caixa De Leite',
					amount: 5,
					unitType: 'Unit',
				},
			],
		},
		3: {
			balance: 0,
			residues: [
				{
					name: 'Caixa De Leite',
					amount: 5,
					unitType: 'Unit',
				},
			],
		},
	},
	getSchoolBalance: {
		1: {
			statusCode: 200,
			balance: 1000,
			residues: [
				{
					name: 'Foo',
					amount: 10,
					unitType: 'Kilogram',
				},
				{
					name: 'Bar',
					amount: 15,
					unitType: 'Kilogram',
				},
				{
					name: 'Baz',
					amount: 15,
					unitType: 'Gram',
				},
			],
		},
		2: {
			statusCode: 200,
			balance: 1000,
			residues: [
				{
					name: 'Baz',
					amount: 15,
					unitType: 'Gram',
				},
			],
		},
		3: { statusCode: 404 },
	},
};
