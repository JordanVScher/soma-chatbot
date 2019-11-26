// const flow = require('./flow');

async function buildMainMenu(context) {
	const res = [];

	res.push({ content_type: 'text', title: 'Meus Pontos', payload: 'myPoints' });
	const school = context.state.schoolData;
	if (school && school.name && school.points && school.turmaPoints) {
		res.push({ content_type: 'text', title: 'Minha Escola', payload: 'schoolPoints' });
	}
	return { quick_replies: res };
}

module.exports = {
	buildMainMenu,
};
