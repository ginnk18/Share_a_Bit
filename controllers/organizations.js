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
		const {currentDonor} = req;

		try {
			const organization = await kx
										.first()
										.from('organizations')
										.where({id})

			const campaigns = await kx
										.select('*')
										.from('campaigns')
										.where({organizationId: id})

			const favourited = await kx
										.first()
										.from('favourites')
										.where({donorId: currentDonor.id, organizationId: id})

			let userFavourite;
			if (favourited === undefined) {
				userFavourite = false;
			} else {
				userFavourite = true;
			}

			const data = {organization, campaigns, userFavourite}
			res.json(data)

		} catch (error) {
			next(error)
		}

	}
}

module.exports = OrganizationsController; 