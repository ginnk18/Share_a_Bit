const kx = require('../db/connection');
const stripe = require('stripe')(process.env.stripeSecretKey);

const StripeController = {
	async create (req, res, next) {
		const {currentDonor} = req;

		const charge = await stripe.charges.create({
									amount: 500,
									currency: 'usd',
									description: '$5 for 5 donation credits',
									source: req.body.id
								})

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
		for(let i=0; i<favouriteIds.length; i++) {
			let favourite = await kx
									.first()
									.from('organizations')
									.where({id: favouriteIds[i].organizationId})
			favouriteOrgs.push(favourite);
		}
		const data = {donor: donor[0], favouriteOrgs, transactions, orgsDonatedTo}
		res.json(data)
	},

	async orgDonation (req, res, next) {
		const {currentDonor} = req;
		const organizationId = req.params.id;
		const {amount} = req.body;

		try {

			if(currentDonor.credits - amount < 0) {
				return res.status(400).json({error: 'Not enough credits'})
			}

			const donor = await kx('donors')
									.decrement('credits', amount)
									.where({id: currentDonor.id})
									.returning('*')

			// console.log('Current Donor: ', currentDonor)
			// console.log('Donor', donor[0])
			// console.log('Amount: ', amount)
			// console.log('Donor credits minus amount using currentDonor: ', currentDonor.credits - amount)
			// console.log('Donor credits minus amount using donor from DB: ', donor[0].credits - amount)

			const organization = await kx('organizations')
											.increment('credits', amount)
											.where({id: organizationId})
											.returning('*')
			await kx 
					.insert({donorId: currentDonor.id, organizationId, amount})
					.into('transactions')

			res.json({message: 'Transaction completed.'})

		} catch(error) {
			res.status(400).json({error: 'Unable to complete transaction.'})
		}


	}
}

module.exports = StripeController;