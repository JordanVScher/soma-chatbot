const mockProduct = [
	{ id: 1, name: 'Caneta', points: 5, image: 'https://assets.carimflex.com.br/img/produtos/600/8500001-1.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 2, name: 'Mochila', points: 70, image: 'https://http2.mlstatic.com/mochila-masculina-executiva-alca-cabo-de-aco-reforcada-preta-D_NQ_NP_650373-MLB31119343404_062019-F.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 3, name: 'Caderno', points: 20, image: 'https://www.ohe.com.br/img/products/caderno-universitario-espiral-capa-dura-1-materia-96-folhas-linha-mais-surf-tilibra_1_1200.jpg' }, // eslint-disable-line object-curly-newline
	{ id: 4, name: 'Estojo', points: 15, image: 'https://tokstok.vteximg.com.br/arquivos/ids/1834386-1000-1000/Estojo-Preto-Chat.jpg?v=637016668945630000' }, // eslint-disable-line object-curly-newline
];

/**
 * Returns the points from the product with the smallest number of points. (Expects array to be sorted by points asc)
 * @param {array} productList A list with all the user products
 * @returns {Number} product points
 */
async function getSmallestPoint(productList) {
	return productList && productList[0] ? productList[0].points : '';
	// return productList.reduce((a, b) => (a.points < b.points ? a : b)).id;
}


module.exports = { mockProduct, getSmallestPoint };
