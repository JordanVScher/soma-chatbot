const mockProduct = [
	{ id: 1, name: 'Caneta', score: 5, description: 'Uma caneta extremamente comum', image: 'https://assets.carimflex.com.br/img/produtos/600/8500001-1.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 2, name: 'Mochila', score: 70, description: 'Mochila preta', image: 'https://http2.mlstatic.com/mochila-masculina-executiva-alca-cabo-de-aco-reforcada-preta-D_NQ_NP_650373-MLB31119343404_062019-F.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 3, name: 'Caderno', score: 20, description: 'Surfista é uma conspiração do governo pra vender caderno', image: 'https://www.ohe.com.br/img/products/caderno-universitario-espiral-capa-dura-1-materia-96-folhas-linha-mais-surf-tilibra_1_1200.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 4, name: 'Estojo', score: 15, description: 'Uma estojo preto, cuidado para não perder', image: 'https://tokstok.vteximg.com.br/arquivos/ids/1834386-1000-1000/Estojo-Preto-Chat.jpg?v=637016668945630000' }, // eslint-disable-line object-curly-newline
	{ id: 5, name: 'Caneta', score: 5, description: 'Uma caneta extremamente comum', image: 'https://assets.carimflex.com.br/img/produtos/600/8500001-1.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 6, name: 'Mochila', score: 70, description: 'Mochila preta', image: 'https://http2.mlstatic.com/mochila-masculina-executiva-alca-cabo-de-aco-reforcada-preta-D_NQ_NP_650373-MLB31119343404_062019-F.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 7, name: 'Caderno', score: 20, description: 'Surfista é uma conspiração do governo pra vender caderno', image: 'https://www.ohe.com.br/img/products/caderno-universitario-espiral-capa-dura-1-materia-96-folhas-linha-mais-surf-tilibra_1_1200.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 8, name: 'Estojo', score: 15, description: 'Uma estojo preto, cuidado para não perder', image: 'https://tokstok.vteximg.com.br/arquivos/ids/1834386-1000-1000/Estojo-Preto-Chat.jpg?v=637016668945630000' }, // eslint-disable-line object-curly-newline
	{ id: 9, name: 'Caneta', score: 5, description: 'Uma caneta extremamente comum', image: 'https://assets.carimflex.com.br/img/produtos/600/8500001-1.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 10, name: 'Mochila', score: 70, description: 'Mochila preta', image: 'https://http2.mlstatic.com/mochila-masculina-executiva-alca-cabo-de-aco-reforcada-preta-D_NQ_NP_650373-MLB31119343404_062019-F.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 11, name: 'Caneta', score: 5, description: 'Uma caneta extremamente comum', image: 'https://assets.carimflex.com.br/img/produtos/600/8500001-1.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 12, name: 'Mochila', score: 70, description: 'Mochila preta', image: 'https://http2.mlstatic.com/mochila-masculina-executiva-alca-cabo-de-aco-reforcada-preta-D_NQ_NP_650373-MLB31119343404_062019-F.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 13, name: 'Caderno', score: 20, description: 'Surfista é uma conspiração do governo pra vender caderno', image: 'https://www.ohe.com.br/img/products/caderno-universitario-espiral-capa-dura-1-materia-96-folhas-linha-mais-surf-tilibra_1_1200.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 14, name: 'Estojo', score: 15, description: 'Uma estojo preto, cuidado para não perder', image: 'https://tokstok.vteximg.com.br/arquivos/ids/1834386-1000-1000/Estojo-Preto-Chat.jpg?v=637016668945630000' }, // eslint-disable-line object-curly-newline
	{ id: 15, name: 'Caneta', score: 5, description: 'Uma caneta extremamente comum', image: 'https://assets.carimflex.com.br/img/produtos/600/8500001-1.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 16, name: 'Mochila', score: 70, description: 'Mochila preta', image: 'https://http2.mlstatic.com/mochila-masculina-executiva-alca-cabo-de-aco-reforcada-preta-D_NQ_NP_650373-MLB31119343404_062019-F.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 17, name: 'Caderno', score: 20, description: 'Surfista é uma conspiração do governo pra vender caderno', image: 'https://www.ohe.com.br/img/products/caderno-universitario-espiral-capa-dura-1-materia-96-folhas-linha-mais-surf-tilibra_1_1200.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 18, name: 'Estojo', score: 15, description: 'Uma estojo preto, cuidado para não perder', image: 'https://tokstok.vteximg.com.br/arquivos/ids/1834386-1000-1000/Estojo-Preto-Chat.jpg?v=637016668945630000' }, // eslint-disable-line object-curly-newline
	{ id: 19, name: 'Caneta', score: 5, description: 'Uma caneta extremamente comum', image: 'https://assets.carimflex.com.br/img/produtos/600/8500001-1.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 20, name: 'Mochila', score: 70, description: 'Mochila preta', image: 'https://http2.mlstatic.com/mochila-masculina-executiva-alca-cabo-de-aco-reforcada-preta-D_NQ_NP_650373-MLB31119343404_062019-F.jpg' }, // eslint-disable-line object-curly-newline
];

/**
 * Returns the score from the product with the smallest number of score. (Expects array to be sorted by score asc)
 * @param {array} productList A list with all the user products
 * @returns {Number} product score
 */
async function getSmallestPoint(productList) {
	return productList && productList[0] ? productList[0].score : '';
	// return productList.reduce((a, b) => (a.score < b.score ? a : b)).id;
}


module.exports = { mockProduct, getSmallestPoint };
