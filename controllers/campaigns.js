const kx = require('../db/connection')

const CampaignsController = {

	async index (req, res, next) {
		// if (req.currentOrg) {
		// 	const {currentOrg} = req;

		// 	const updates = await kx
		// 							.select()
		// 							.from('updates')
		// 							.where({organizationId: currentOrg.id})

		// 	res.json({updates})

		// } else if(req.currentDonor) {
		// 	const {currentDonor} = req;
		// 	console.log('currentDonor!')
		// }
	},

	async show (req, res, next) {
		const { id } = req.params;
		
		const campaign = await kx
								.first()
								.from('campaigns')
								.where({id})

		const organization = await kx
									.first()
									.from('organizations')
									.where({id: campaign.organizationId})

		res.json({campaign, organization})
	},

	async create (req, res, next) {
		const {name, description, endDate} = req.body;
		const {currentOrg} = req;

		const campaign = await kx
							.insert({name, description, endDate, organizationId: currentOrg.id})
							.into('updates')
							.returning('*')


		res.json({update})
	},

	destroy (req, res, next) {
		
	}

}

module.exports = CampaignsController;