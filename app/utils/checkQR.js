async function buildMainMenu(context) {
	const res = [];
	const join = { content_type: 'text', title: 'Participar', payload: 'join' };
	const meusPontos = { content_type: 'text', title: 'Meus Pontos', payload: 'myPoints' };
	const escolaPontos = { content_type: 'text', title: 'Minha Escola', payload: 'schoolPoints' };

	if (context.state.apiUser && context.state.apiUser.id) {
		res.push(meusPontos);
		const school = context.state.schoolData;
		if (school && school.name && school.points && school.turmaPoints) res.push(escolaPontos);
	} else {
		res.push(join);
	}
	return { quick_replies: res };
}

module.exports = {
	buildMainMenu,
};
