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
		const data = {donor: donor[0], favouriteOrgs}
		res.json(data)
	},

	async orgDonation (req, res, next) {
		const {currentDonor} = req;
		const organizationId = req.params.id;
		const {amount} = req.body;

		try {
			const donor = await kx('donors')
									.decrement('credits', amount)
									.where({id: currentDonor.id})
									.returning('*')

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