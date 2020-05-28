module.exports = {
	avatarImage: 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/images/b35bd3b6-a0a0-4534-9d54-0f864dd172d3.jpg',
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
		onlyPoints: 'Você já conseguiu <POINTS> pontos!',
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
	rewardQtd: {
		text1: 'Ebaa, quantas unidades de <PRODUTO> você quer?',
		text2: 'Ok. Então, só para confirmar que entendi o seu pedido, você está pedindo <QTD> unidade(s) de <PRODUTO> e isso consumirá <PRICE> ponto(s) seus.\nDepois da troca, você ficará com <POINTS> ponto(s). É isso mesmo?',
		notFound: 'Não consegui encontrar essa recompensa, acho que ele não está mais disponível. Que tal escolher outro? Temos muita coisa legal:',
		priceChanged: 'Ops, parece que o preço mudou e você não tem mais pontos suficientes para essa recompensa! Tente novamente, por favor.',
		menuOptions: ['Sim', 'Não'],
		menuPostback: ['productFinish', 'productNo'],
	},
	productNo: {
		text1: 'Ops, me desculpe. O que houve de errado?',
		productError: 'Ok. Então vou te passar o número do Whatsapp da nossa equipe e eles vão te ajudar com isso.\nWhatsapp: <WHATSAPP>',
		menuOptions: ['Alterar Unidades', 'Alterar Produto', 'Cancelar Troca'],
		menuPostback: ['productBtnClicked', 'viewUserProducts', 'mainMenu'], // ! - productBtnClicked will be replaced by the product the user chose previously
		// menuOptions: ['Erro com meus Pontos', 'Alterar Unidades', 'Alterar Produto'],
		// menuPostback: ['productError', 'productBtnClicked', 'viewUserProducts'],
	},
	showProducts: {
		text1: 'Opa, vi aqui que você já possui pontos para trocar por alguns dos produtos disponíveis, quer que eu te mostre só estes produtos, ou prefere ver todos os produtos disponíveis para planejar suas próximas compras?',
		noPoints1: 'É pra já...',
		noPoints2: 'Esses são os produtos que temos disponíveis. Espero que te inspire a reciclar mais plásticos e trocar por pontos conosco =)',
		menuOptions: ['Todos os Produtos', 'Para Trocar'],
		menuPostback: ['viewAllProducts', 'viewUserProducts'],
	},
	productFinish: {
		text1: 'Recebemos o seu pedido com sucesso! Logo, estaremos entrando em contato para te dar maiores informações!',
	},
	schoolPoints: {
		text1: 'Só um segundo, vou consultar aqui no meu banco de dados!',
		text2: 'A sua escola já acumulou o total de <POINTS> pontos e trocou <KILOS> kg(s).',
		text3: 'A sua escola já acumulou o total de <POINTS> pontos.',
		failure: 'Ops, não consegui carregar os dados da sua escola. Tente novamente mais tarde.',
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
		alreadyLinked: 'Esse CPF já está vinculado com um usuário!',
		success: 'Sucesso! Te encontrei no meu sistema.',
		menuOptions: ['Voltar'],
		menuPostback: ['mainMenu'],
	},
	SMSToken: {
		intro: 'Agora, para confirmar a sua identidade, entre com o token que acabamos de enviar no seu celular!',
		ask: 'Entre com o seu token.',
		success: 'Pronto, terminamos. 😌\nAgora você poderá conversar comigo para trocar seus pontos por prêmios, clique nos botões abaixo para começar. 😊',
		error: 'Esse token está incorreto. Tente novamente!',
		dev: {
			intro: 'Olá, testador em dev. Essa mensagem só vai aparecer no ambiente de dev, ignore a mensagem acima. ',
			token: 'Abaixo está o token do SMS que você deverá enviar:\n\n',
			error: 'Abaixo deveria estar o token do SMS pra você enviar mas aconteceu um erro. Avise um desenvolvedor!',
		},
	},
	pagination: {
		previous: {
			title: 'Anterior',
			subtitle: 'Ver produtos anteriores',
			img: 'https://i.imgur.com/Woe8E1X.png',
			btn: '⬅️ Anterior',
		},
		next: {
			title: 'Próximo',
			subtitle: 'Ver próximos produtos',
			img: 'https://imgur.com/YNeLV04.png',
			btn: 'Próximo ➡️',
		},
	},
};
