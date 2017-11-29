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

				//to get all donor's favourite organizations:
					const favouriteIds = await kx
												.select('organizationId')
												.from('favourites')
												.where({donorId: donor.id})

					let favouriteOrgs = []
					for(let i=0; i<favouriteIds.length; i++) {
						let favourite = await kx
												.first()
												.from('organizations')
												.where({id: favouriteIds[i].organizationId})
						favouriteOrgs.push(favourite);
					}

				const data = {donor: donor, favouriteOrgs}
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