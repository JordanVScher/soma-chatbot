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
			'Posso ajudar com mais alguma coisa ? É só me enviar uma mensagem ;)',
		],
		menuOptions: ['Meus Pontos'],
		menuPostback: ['myPoints'],
	},
	myPoints: {
		noPoints: 'Você ainda não tem nenhum ponto! ):',
		showPoints: 'Você já nos enviou o total de <KILOS> Kg(s), e com isso acumulou o total de <POINTS> pontos =)',
		hasEnough: 'Você já pode realizar algumas trocas, deseja ver o que já é possível trocar?',
		notEnough: 'Vc esta quase chegando, com <POINTS> pontos você já consegue fazer uma troca.',
		menuOptions: ['Sim', 'Agora não', 'Ver Todos'],
		menuPostback: ['viewUserProducts', 'mainMenu', 'viewAllProducts'],
	},
	notEnough: {
		menuOptions: ['Entendi', 'Ver Todos'],
		menuPostback: ['mainMenu', 'viewAllProducts'],
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
};
