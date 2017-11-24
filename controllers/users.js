const kx = require('../db/connection');

const UsersController = {
	create (req, res, next) {

	},

	async show (req, res, next) {
		const {id} = req.params;

		try {
			const user = await kx
								.first()
								.from('users')
								.where({id})

			console.log(user);

			if(user.type === 'donor') {
				const donor = await kx
									.first()
									.from('donors')
									.where({userId: id})

				// To get All donor's transactions later: 
				// const transactions = await kx
				// 							.select('*')
				// 							.from('transactions')
				// 							.where({donorId: donor.id})

				// To get All donor's interests later:
					// const interests = await kx
					// 						.select('*')
					// 						.from('interests')
					// 						.where({userId: id})

				const data = {donor: donor}
				res.json(data)
			} else if (user.type === 'organization') {

				const organization = await kx
											.first()
											.from('organizations')
											.where({userId: id})

				const campaigns = await kx 	
										.select('*')
										.from('campaigns')
										.where({organizationId: organization.id})

				const data = {organization: organization, campaigns: campaigns}
				res.json(data)
			}
		} catch(error) {
			next(error)
		}
	}
}

module.exports = UsersController;