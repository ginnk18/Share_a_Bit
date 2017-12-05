const kx = require('../db/connection')

const MessagesController = {
	create(req, res, next) {
		const { currentOrg } = req;
		const { subject, body } = req.body;

		
	}
}

module.exports = MessagesController;