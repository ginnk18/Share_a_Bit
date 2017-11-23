const kx = require('../db/connection');

const OrganizationsController = {
	index (req, res, next) {
		kx
			.select('*')
			.from('organizations')
			.then(organizations => {
				res.json(organizations)
			})
			.catch(error => next(error))

	},

	async show (req, res, next) {
		const {id} = req.params;

		try {
			const organization = await kx
										.first()
										.from('organizations')
										.where({id})

			const campaigns = await kx
										.select('*')
										.from('campaigns')
										.where({organizationId: id})

			const data = {organization, campaigns}
			res.json(data)

		} catch (error) {
			next(error)
		}

	}
}

module.exports = OrganizationsController; 