const kx = require('../db/connection')

const UpdatesController = {

	async index (req, res, next) {
		if (req.currentOrg) {
			const {currentOrg} = req;

			const updates = await kx
									.select()
									.from('updates')
									.where({organizationId: currentOrg.id})

			res.json({updates})

		} else if(req.currentDonor) {
			const {currentDonor} = req;
			console.log('currentDonor!')
		}
	},

	async show (req, res, next) {
		const { id } = req.params;
		
		const update = await kx
								.first()
								.from('updates')
								.where({id})

		res.json({update})
	},

	async create (req, res, next) {
		const {title, overview} = req.body;
		const {currentOrg} = req;

		const update = await kx
							.insert({title, overview, organizationId: currentOrg.id})
							.into('updates')
							.returning('*')


		res.json({update})
	},

	destroy (req, res, next) {
		
	}

}

module.exports = UpdatesController;