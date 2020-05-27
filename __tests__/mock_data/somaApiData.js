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
