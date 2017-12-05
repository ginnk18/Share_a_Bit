const kx = require('../db/connection');
const stripe = require('stripe')(process.env.stripeSecretKey);

const StripeController = {
	async create (req, res, next) {
		const {currentDonor} = req;

		if(req.body.bitcoin) {
			const charge = await stripe.sources.create({
										type: 'bitcoin',
										amount: 500,
										currency: 'usd',
										owner: {
											email: req.body.email
										}
									})

			console.log('Bitcoin Charge: ', charge)

			const donor = await kx('donors')
									.increment('bitcredits', 5)
									.where({id: currentDonor.id})
									.returning('*')
									
			const transactions = await kx
										.select('*')
										.from('transactions')
										.where({donorId: currentDonor.id})
										.orderBy('created_at', 'desc')

		let orgsDonatedTo = [];
		for(let i=0; i<transactions.length; i++) {
			let orgDonatedTo = await kx
										.first(['id', 'name'])
										.from('organizations')
										.where({id: transactions[i].organizationId})

			orgsDonatedTo.push(orgDonatedTo);
		}

		const favouriteIds = await kx
									.select('organizationId')
									.from('favourites')
									.where({donorId: currentDonor.id})

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

		const data = {donor: donor[0], favouriteOrgs, transactions, orgsDonatedTo, favouriteOrgCampaigns, favouriteOrgUpdates}
		res.json(data)
		} else {
			const charge = await stripe.charges.create({
										amount: 500,
										currency: 'usd',
										description: '$5 for 5 donation credits',
										source: req.body.id
									})

			console.log('Card charge: ', charge)

			const donor = await kx('donors')
									.increment('credits', 5)
									.where({id: currentDonor.id})
									.returning('*')

		const transactions = await kx
											.select('*')
											.from('transactions')
											.where({donorId: currentDonor.id})
											.orderBy('created_at', 'desc')

		let orgsDonatedTo = [];
		for(let i=0; i<transactions.length; i++) {
			let orgDonatedTo = await kx
										.first(['id', 'name'])
										.from('organizations')
										.where({id: transactions[i].organizationId})

			orgsDonatedTo.push(orgDonatedTo);
		}

		const favouriteIds = await kx
									.select('organizationId')
									.from('favourites')
									.where({donorId: currentDonor.id})

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
		const data = {donor: donor[0], favouriteOrgs, transactions, orgsDonatedTo, favouriteOrgCampaigns, favouriteOrgUpdates}
		res.json(data)
			
		}

	},

	async orgDonation (req, res, next) {
		const {currentDonor} = req;
		const organizationId = req.params.id;
		const {amount, type} = req.body;

		try {

			if(type === 'credits') {
				if(currentDonor.credits - amount < 0) {
					return res.status(400).json({error: 'Not enough credits'})
				}

				await kx('donors')
						.decrement('credits', amount)
						.where({id: currentDonor.id})

				await kx('organizations')
						.increment('credits', amount)
						.where({id: organizationId})
						
				await kx 
						.insert({donorId: currentDonor.id, organizationId, amount, type})
						.into('transactions')

				res.json({message: 'Transaction completed.'})
				
			} else if (type === 'bitcredits') {
				if(currentDonor.bitcredits - amount < 0) {
					return res.status(400).json({error: 'Not enough bitcredits.'})
				}

				await kx('donors')
						.decrement('bitcredits', amount)
						.where({id: currentDonor.id})

				await kx('organizations')
						.increment('bitcredits', amount)
						.where({id: organizationId})

				await kx
						.insert({donorId: currentDonor.id, organizationId, amount, type})
						.into('transactions')

				res.json({message: 'Transaction completed.'})
			}


		} catch(error) {
			res.status(400).json({error: 'Unable to complete transaction.'})
		}


	},

	async campaignDonation(req, res, next) {
		const {currentDonor} = req;
		const campaignId = req.params.id;
		const organizationId = req.params.orgId;
		const {amount, type} = req.body;

		try {

			if(type === 'credits') {
				if(currentDonor.credits - amount < 0) {
					return res.status(400).json({error: 'Not enough credits'})
				}

				await kx('donors')
						.decrement('credits', amount)
						.where({id: currentDonor.id})

				await kx('campaigns')
						.increment('credits', amount)
						.where({id: campaignId})

				await kx 
						.insert({donorId: currentDonor.id, organizationId, amount, type})
						.into('transactions')

				res.json({message: 'Transaction completed.'})
				
			} else if (type === 'bitcredits') {
				if(currentDonor.bitcredits - amount < 0) {
					return res.status(400).json({error: 'Not enough bitcredits.'})
				}

				await kx('donors')
						.decrement('bitcredits', amount)
						.where({id: currentDonor.id})

				await kx('campaigns')
						.increment('bitcredits', amount)
						.where({id: campaignId})

				await kx 
						.insert({donorId: currentDonor.id, organizationId, amount, type})
						.into('transactions')

				res.json({message: 'Transaction completed.'})
			}


		} catch(error) {
			res.status(400).json({error: 'Unable to complete transaction.'})
		}
	}
}

module.exports = StripeController;