const kx = require('../db/connection');

const UsersController = {
	create (req, res, next) {

	},

	async showDonor (req, res, next) {
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
				const transactions = await kx
											.select('*')
											.from('transactions')
											.where({donorId: donor.id})
											.orderBy('created_at', 'desc')

				let orgsDonatedTo = [];
				for(let i=0; i<transactions.length; i++) {
					let orgDonatedTo = await kx
												.first(['id', 'name'])
												.from('organizations')
												.where({id: transactions[i].organizationId})

					orgsDonatedTo.push(orgDonatedTo);
				}
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

				const data = {donor: donor, favouriteOrgs, transactions, orgsDonatedTo}
				res.json(data)
			} 
		} catch(error) {
			next(error)
		}
	},

	async showOrg (req, res, next) {
		const {id} = req.params;

		try {
			const user = await kx
									.first()
									.from('users')
									.where({id})
			
			if (user.type === 'organization') {

				const organization = await kx
											.first()
											.from('organizations')
											.where({userId: id})

				const campaigns = await kx 	
										.select('*')
										.from('campaigns')
										.where({organizationId: organization.id})
										.orderBy('created_at', 'desc')

				const transactions = await kx
											.select('*')
											.from('transactions')
											.where({organizationId: organization.id})
											.orderBy('created_at', 'desc')

				let donors = [];
				for(let i=0; i<transactions.length; i++) {
					let donor = await kx
										.first()
										.from('donors')
										.where({id: transactions[i].donorId})

					donors.push(donor);
				}

				const transactionsByFreqDonor = await kx
														.raw(`SELECT COUNT("donorId"), "donorId" 
															from transactions 
															where "organizationId" = ${organization.id} 
															group by "donorId" 
															order by "count" DESC 
															LIMIT 3`)	

				const freqDonorTransactions = transactionsByFreqDonor.rows
				let mostFreqDonors = [];
				for(let i=0; i<freqDonorTransactions.length; i++) {
					let freqDonor = await kx
											.first()
											.from('donors')
											.where({id: freqDonorTransactions[i].donorId})

					mostFreqDonors.push(freqDonor)
				}
				console.log(mostFreqDonors)
				const data = {organization, campaigns, transactions, donors, freqDonorTransactions, mostFreqDonors}
				res.json(data)
			}

		} catch(error) {
			next(error)
		}
	}
}

module.exports = UsersController;


/////

	// let orgsDonatedTo = [];
	// 			for(let i=0; i<transactions.length; i++) {
	// 				console.log('Org Ids from transactions: ', transactions[i].organizationId)
	// 				let orgDonatedTo = await kx
	// 											.first(['id', 'name'])
	// 											.from('organizations')
	// 											.where({id: transactions[i].organizationId})

	// 				orgsDonatedTo.push(orgDonatedTo);
	// 			}