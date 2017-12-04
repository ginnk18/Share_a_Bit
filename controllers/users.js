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
					let favouriteOrgCampaigns = []
					let favouriteOrgUpdates = []
					for(let i=0; i<favouriteIds.length; i++) {
						let favourite = await kx
												.first()
												.from('organizations')
												.where({id: favouriteIds[i].organizationId})

						let favouriteOrgCampaign = await kx
															.first()
															.from('campaigns')
															.where({organizationId: favouriteIds[i].organizationId})

						let favouriteOrgUpdate = await kx
														.select()
														.from('updates')
														.where({organizationId: favouriteIds[i].organizationId})

						favouriteOrgs.push(favourite);
						favouriteOrgCampaigns.push(favouriteOrgCampaign);
						if(favouriteOrgUpdate !== undefined) {
							favouriteOrgUpdates.push(favouriteOrgUpdate);
						}
					}

					// let favouriteOrgCampaigns = []
					// for (let i=0; i<favouriteIds.length; i++) {
					// 	let favouriteOrgCampaign = await kx
					// 										.first()
					// 										.from('campaigns')
					// 										.where({organizationId: favouriteIds[i].organizationId})
					// 	favouriteOrgCampaigns.push(favouriteOrgCampaign)
					// }

				const data = {donor: donor, favouriteOrgs, transactions, orgsDonatedTo, favouriteOrgCampaigns, favouriteOrgUpdates}
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

				const updates = await kx
										.select('*')
										.from('updates')
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
															order by "count" DESC`)	

				const freqDonorTransactions = transactionsByFreqDonor.rows
				let mostFreqDonors = [];
				for(let i=0; i<freqDonorTransactions.length; i++) {
					let freqDonor = await kx
											.first()
											.from('donors')
											.where({id: freqDonorTransactions[i].donorId})

					mostFreqDonors.push(freqDonor)
				}

				const data = {organization, campaigns, updates, transactions, donors, freqDonorTransactions, mostFreqDonors}
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