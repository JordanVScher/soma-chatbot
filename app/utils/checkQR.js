async function buildMainMenu(context) {
	const res = [];
	const join = { content_type: 'text', title: 'Participar', payload: 'join' };
	const tokenSMS = { content_type: 'text', title: 'Entrar SMS', payload: 'activateSMS' };
	const meusPontos = { content_type: 'text', title: 'Meus Pontos', payload: 'myPoints' };
	const escolaPontos = { content_type: 'text', title: 'Minha Escola', payload: 'schoolPoints' };

	if (context.state.somaUser && context.state.somaUser.id) {
		res.push(meusPontos);
		const school = context.state.schoolData;
		if (school && school.name && school.points && school.turmaPoints) res.push(escolaPontos);
	} else if (context.state.linked === true) {
		res.push(tokenSMS);
	} else {
		res.push(join);
	}
	return { quick_replies: res };
}

module.exports = {
	buildMainMenu,
};
