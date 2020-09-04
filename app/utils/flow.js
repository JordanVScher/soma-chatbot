module.exports = {
	avatarImage: 'https://mcusercontent.com/926cb477483bcd8122304bc56/images/386d7350-9002-450d-ad9e-dd010a675dee.png',
	getStarted: 'Olá! Eu sou o Robô do SO+MA Educação, e vou te ajudar nas suas duvidas sobre o programa.',
	share: {
		txt1: 'Encaminhe nosso bot!',
		cardData: {
			title: 'Bot',
			subtitle: 'Bot',
			image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Symbol_support_vote.png',
			item_url: 'https://www.facebook.com',
		},
	},
	greetings: {
		text1: 'Olá! Eu sou o Robô do SO+MA Educação, e vou te ajudar nas suas duvidas sobre o programa.',
	},
	mainMenu: {
		text1: [
			'Se tiver alguma dúvida é só me enviar uma mensagem ;)',
			'Me mande uma mensagem caso tenha alguma dúvida =)',
			'Posso ajudar com mais alguma coisa? É só me enviar uma mensagem ;)',
		],
		menuOptions: ['Meus Pontos', 'Pontos por escola'],
		menuPostback: ['myPoints', 'schoolPoints'],
	},
	myPoints: {
		noPoints: 'Você ainda não tem nenhum ponto! ):',
		showPoints: 'Você já nos enviou o total de <KILOS> Kg(s), e com isso acumulou o total de <POINTS> pontos =)',
		hasEnough: 'Você já pode realizar algumas trocas, deseja ver o que já é possível trocar?',
		notEnough: 'Vc esta quase chegando, com <POINTS> pontos você já consegue fazer uma troca.',
		failure: 'Ops, não consegui carregar os seus dados. Tente novamente mais tarde.',
		menuOptions: ['Sim', 'Agora não', 'Ver Todos'],
		menuPostback: ['viewUserProducts', 'mainMenu', 'viewAllProducts'],
	},
	notEnough: {
		menuOptions: ['Entendi', 'Ver Todos'],
		menuPostback: ['mainMenu', 'viewAllProducts'],
	},
	productQtd: {
		text1: 'Ebaa, quantas unidades de <PRODUTO> você quer?',
		text2: 'Ok. Então, só para confirmar que entendi o seu pedido, você está pedindo <QTD> unidade(s) de <PRODUTO> e isso consumirá <PRICE> ponto(s) e assim sobrará <POINTS> para você. É isso mesmo?',
		menuOptions: ['Sim', 'Não'],
		menuPostback: ['productFinish', 'productNo'],
	},
	productNo: {
		text1: 'Ops, me desculpe. O que houve de errado?',
		productError: 'Ok. Então vou te passar o número do Whatsapp da nossa equipe e eles vão te ajudar com isso.\nWhatsapp: <WHATSAPP>',
		menuOptions: ['Erro com meus Pontos', 'Alterar Unidades'],
		menuPostback: ['productError', 'productBtnClicked'],
	},
	showProducts: {
		text1: 'Opa, vi aqui que você já possui pontos para trocar por alguns dos produtos disponíveis, quer que eu te mostre só estes produtos, ou prefere ver todos os produtos disponíveis para planejar suas próximas compras?',
		noPoints1: 'É pra já...',
		noPoints2: 'Esses são os produtos que temos disponíveis. Espero que te inspire a reciclar mais plásticos e trocar por pontos conosco =)',
		menuOptions: ['Todos Produtos', 'Para Trocar =)'],
		menuPostback: ['viewAllProducts', 'viewUserProducts'],
	},
	productFinish: {
		text1: 'Recebemos o seu pedido com sucesso! Logo, estaremos entrando em contato para te dar maiores informações!',
	},
	schoolPoints: {
		text1: 'Só um segundo, vou consultar aqui no meu banco de dados!',
		text2: 'A escola <NAME> já acumulou o total de <POINTS> pontos, e sua turma contribuiu com o total de <POINTS2> pontos para isso =)',
	},
	issueText: {
		success: ['Eu sou um robô e estou aprendendo não entendi sua mensagem.',
			'Sou um robô e meus algoritmos ainda estão aprendendo. Não entendi sua mensagem, mas logo te respondo =)',
		],
		failure: 'Eu sou um robô e estou aprendendo! Não entendi sua mensagem',
	},
	notifications: {
		on: 'Legal! Estarei te interando das novidades! Se quiser parar de receber nossas novidades, clique na opção "Parar Notificações 🛑" no menu abaixo. ⬇️',
		off: 'Você quem manda. Não estarei mais te enviando nenhuma notificação. Se quiser voltar a receber nossas novidades, clique na opção "Ligar Notificações 👌" no menu abaixo. ⬇️',
	},
	joinAsk: {
		text1: 'Aqui você poderá se vincular com sua conta do projeto SO+MA',
		text2: 'Entre com seu cpf. Exemplo: 123.123.123-11',
		invalid: 'CPF inválido. Tente novamente',
		notFound: 'Não encontrei essa CPF nos meus cadastros.',
		success: 'Sucesso! Te encontrei, a partir de agora você está vinculado(a).',
		menuOptions: ['Voltar'],
		menuPostback: ['mainMenu'],
	},
};
